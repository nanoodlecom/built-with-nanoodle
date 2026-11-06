import test from "node:test";
import assert from "node:assert/strict";
import { resolveUrl } from "../scripts/check-urls.mjs";

const URL = "https://example.com/page";

// Model the request lifecycle without external servers or real retry sleeps.
function requests(outcomes) {
  const calls = [];
  const delays = [];
  let released = true;
  const options = {
    async fetchUrl(url, init) {
      assert.equal(released, true, "the previous response must be released before retry");
      assert.equal(url, URL);
      assert.equal(init.redirect, "follow");
      assert.ok(init.signal instanceof AbortSignal, "each request has a deadline");
      calls.push(init.signal);
      const next = outcomes[calls.length - 1];
      assert.ok(next !== undefined, "no request after a terminal result");
      if (next instanceof Error) throw next;
      released = false;
      return {
        url: next.url ?? URL,
        status: next.status,
        body: { async cancel() { await Promise.resolve(); released = true; } },
      };
    },
    async delay(ms) { assert.equal(released, true); delays.push(ms); },
  };
  return { calls, delays, options, isReleased: () => released };
}

test("HTTP success, permanent failure, and login redirects are terminal", async () => {
  for (const [response, expected] of [
    [{ status: 200 }, { ok: true, status: 200 }],
    [{ status: 404 }, { ok: false, status: "404" }],
    [{ status: 403 }, { ok: false, status: "403" }],
  ]) {
    const r = requests([response]);
    assert.deepEqual(await resolveUrl(URL, r.options), expected);
    assert.equal(r.calls.length, 1);
    assert.deepEqual(r.delays, []);
    assert.equal(r.isReleased(), true);
  }
  for (const path of ["login?return_to=private", "session"]) {
    const r = requests([{ status: 200, url: `https://github.com/${path}` }]);
    const result = await resolveUrl(URL, r.options);
    assert.equal(result.ok, false);
    assert.match(result.status, /needs a login/);
    assert.ok(!result.status.includes("return_to"));
    assert.equal(r.calls.length, 1);
  }
});

test("rate limits, server errors, and network errors can recover", async () => {
  for (const failure of [{ status: 429 }, { status: 503 }, new Error("network failed")]) {
    const r = requests([failure, { status: 200 }]);
    assert.deepEqual(await resolveUrl(URL, r.options), { ok: true, status: 200 });
    assert.equal(r.calls.length, 2);
    assert.deepEqual(r.delays, [2000]);
    assert.notEqual(r.calls[0], r.calls[1], "retry gets a fresh deadline");
  }
});

test("retries stop at three attempts and report the final failure", async () => {
  const timeout = new Error("deadline");
  timeout.name = "TimeoutError";
  for (const [failure, expected] of [
    [{ status: 429 }, "429"],
    [{ status: 503 }, "503"],
    [new Error("network failed"), "network failed"],
    [timeout, "timed out after 20s"],
  ]) {
    const r = requests([failure, failure, failure]);
    assert.deepEqual(await resolveUrl(URL, r.options), { ok: false, status: expected });
    assert.equal(r.calls.length, 3);
    assert.deepEqual(r.delays, [2000, 4000]);
  }
  const r = requests([{ status: 503 }, { status: 404 }]);
  assert.deepEqual(await resolveUrl(URL, r.options), { ok: false, status: "404" });
  assert.equal(r.calls.length, 2);
});

test("response cleanup failure does not change a terminal HTTP result", async () => {
  const result = await resolveUrl(URL, {
    fetchUrl: async () => ({
      status: 200, url: URL,
      body: { cancel: async () => { throw new Error("already closed"); } },
    }),
    delay: async () => assert.fail("must not retry a successful response"),
  });
  assert.deepEqual(result, { ok: true, status: 200 });
});

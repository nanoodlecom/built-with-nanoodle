import test from "node:test";
import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { checkReadme, decodeAppLink } from "../scripts/check-links.mjs";

test("every Try-it link in the README decodes to a valid app payload", () => {
  const { count, problems } = checkReadme();
  assert.ok(count >= 1, "at least the seed entry");
  assert.deepEqual(problems, []);
});

test("checker catches junk payloads", () => {
  const link = (p) => `[Try it](https://nanoodle.com/play#a=${p})`;
  const gz = (v) => Buffer.from(gzipSync(JSON.stringify(v))).toString("base64url");
  const bad = [
    link("notgzip"),
    link("u" + Buffer.from("[1,2]").toString("base64url")),
    link(gz({ v: 2, graph: { nodes: [{}] } })),
    link(gz({ v: 1, graph: { nodes: [] } })),
  ].join("\n");
  assert.equal(checkReadme(bad).problems.length, 4);
  const good = link(gz({ v: 1, graph: { nodes: [{ id: "n", type: "text" }], links: [] } }));
  assert.deepEqual(checkReadme(good).problems, []);
});

test("decodeAppLink handles both gzip and plain tags", () => {
  const app = { v: 1, graph: { nodes: [{ id: "n", type: "text" }] } };
  assert.deepEqual(decodeAppLink("", Buffer.from(gzipSync(JSON.stringify(app))).toString("base64url")), app);
  assert.deepEqual(decodeAppLink("u", Buffer.from(JSON.stringify(app)).toString("base64url")), app);
});

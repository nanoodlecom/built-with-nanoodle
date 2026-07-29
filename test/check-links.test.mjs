import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { checkReadme, decodeAppLink, stripFences, splitFences } from "../scripts/check-links.mjs";
import { collectUrls, collectRelativeLinks, deadRelativeLinks, requestTarget } from "../scripts/check-urls.mjs";

const gz = (v) => Buffer.from(gzipSync(JSON.stringify(v))).toString("base64url");
const APP = { v: 1, graph: { nodes: [{ id: "n", type: "text" }], links: [] } };
const link = (target) => `- 🍜 **X** — y. [Try it](${target})`;

test("every Try-it link in the README decodes to a valid app payload", () => {
  const { count, problems } = checkReadme();
  assert.ok(count >= 1, "at least the seed entry");
  assert.deepEqual(problems, []);
});

test("checker catches junk payloads", () => {
  const app = (p) => link(`https://nanoodle.com/play#a=${p}`);
  const bad = [
    app("notgzip"),
    app("u" + Buffer.from("[1,2]").toString("base64url")),
    app(gz({ v: 2, graph: { nodes: [{}] } })),
    app(gz({ v: 1, graph: { nodes: [] } })),
  ].join("\n");
  assert.equal(checkReadme(bad).problems.length, 4);
  assert.deepEqual(checkReadme(app(gz(APP))).problems, []);
});

// A checker that skips what it cannot parse is worse than no checker: it tells a
// contributor their entry passed when nothing looked at it. These 4 are the
// submissions a real contributor makes.
test("an entry that is not a full share link is a problem, not a skip", () => {
  for (const target of ["https://da.gd/abc123", "paste your #a= link here", "", "https://nanoodle.com/play"]) {
    const { count, problems } = checkReadme(link(target));
    assert.equal(count, 1, `counted as an entry: ${target}`);
    assert.equal(problems.length, 1, `reported once: ${target}`);
  }
});

test("the /play.html and www. forms of a share link are decoded, not rejected", () => {
  for (const base of ["https://nanoodle.com/play.html", "https://www.nanoodle.com/play", "https://www.nanoodle.com/play.html"]) {
    assert.deepEqual(checkReadme(link(`${base}#a=${gz(APP)}`)).problems, [], base);
    assert.equal(checkReadme(link(`${base}#a=notgzip`)).problems.length, 1, base);
  }
});

test("the README's own entry template is fenced, so it is not read as an entry", () => {
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  assert.match(readme, /```markdown\n- 🍜 \*\*Your app name\*\*/, "template still lives in a fenced block");
  assert.ok(!stripFences(readme).includes("paste your #a= link here"));
  assert.equal(checkReadme("```\n" + link("paste your #a= link here") + "\n```\n" + link(`https://nanoodle.com/play#a=${gz(APP)}`)).count, 1);
});

// The fence carve-out is the one place an entry could hide. It must not be silent
// either, and it must survive the indented and ~~~ fence styles CommonMark allows.
test("a real Try-it link inside a fence is reported, not swallowed by the carve-out", () => {
  const real = link(`https://nanoodle.com/play#a=${gz(APP)}`);
  for (const [open, close] of [["```markdown", "```"], ["   ```", "   ```"], ["~~~", "~~~"]]) {
    const { count, problems } = checkReadme(`${open}\n${real}\n${close}\n${real}\n`);
    assert.equal(count, 1, `only the unfenced entry counts: ${open}`);
    assert.equal(problems.length, 1, `the fenced one is reported: ${open}`);
    assert.match(problems[0], /inside a fenced code block/);
    // The template placeholder in the same fence style stays exempt.
    assert.deepEqual(checkReadme(`${open}\n${link("paste your #a= link here")}\n${close}\n${real}\n`).problems, []);
  }
  // An unclosed fence runs to end of file, so nothing after it is read as an entry.
  assert.equal(splitFences("a\n```\n" + real + "\n").prose.trim(), "a");
  assert.equal(stripFences("x\n```\ny\n```\nz\n").trim().split("\n").join("|"), "x||z");
});

test("relative links in both files point at files that exist", () => {
  const targets = collectRelativeLinks().map((t) => t.target);
  assert.ok(targets.includes("CONTRIBUTING.md"), "the README's two CONTRIBUTING.md links are collected");
  assert.ok(targets.includes("LICENSE"));
  assert.ok(targets.every((t) => !t.startsWith("http")), "http URLs are the other collector's job");
  assert.deepEqual(deadRelativeLinks(), [], "every relative link resolves to a file in the repo");

  // And it reports a missing one. A dead CONTRIBUTING.md link is the same class of bug
  // as a dead https one, so it fails the same way.
  const dir = mkdtempSync(join(tmpdir(), "bwn-"));
  writeFileSync(join(dir, "R.md"), "[gone](GONE.md) [here](R.md) [anchor](#x) [mail](mailto:a@b.c)\n");
  assert.deepEqual(deadRelativeLinks(dir, ["R.md"]).map((d) => d.target), ["GONE.md"]);
  rmSync(dir, { recursive: true, force: true });
});

// An anonymous fetch of a github /edit/ URL 302s to the login form, which answers 200
// for ANY path — a deleted file included. Requesting the blob URL is what makes the
// check real: that one 404s when the file is gone.
test("a github /edit/ link is resolved through its blob URL", () => {
  const { url, note } = requestTarget("https://github.com/nanoodlecom/built-with-nanoodle/edit/main/README.md");
  assert.equal(url, "https://github.com/nanoodlecom/built-with-nanoodle/blob/main/README.md");
  assert.match(note, /login/);
  const plain = requestTarget("https://nanoodle.com/play");
  assert.equal(plain.url, "https://nanoodle.com/play");
  assert.equal(plain.note, "");
});

test("decodeAppLink handles both gzip and plain tags", () => {
  const app = { v: 1, graph: { nodes: [{ id: "n", type: "text" }] } };
  assert.deepEqual(decodeAppLink("", Buffer.from(gzipSync(JSON.stringify(app))).toString("base64url")), app);
  assert.deepEqual(decodeAppLink("u", Buffer.from(JSON.stringify(app)).toString("base64url")), app);
});

// The URL job itself needs the network, so CI runs it. What is testable offline is the
// extraction: every http URL in both files is collected once, without its fragment.
test("collectUrls finds every http URL in both files, fragment stripped and deduped", () => {
  const urls = collectUrls().map((u) => u.url);
  assert.equal(new Set(urls).size, urls.length, "deduped");
  assert.ok(urls.every((u) => !u.includes("#")), "fragments stripped");
  assert.ok(urls.includes("https://nanoodle.com/play"), "the 5 app links collapse to one page");
  assert.ok(urls.includes("https://github.com/nanoodlecom/awesome-noodles"));
  assert.ok(
    urls.some((u) => u.endsWith("/graphs/image-model-arena.noodle-graph.json")),
    "the gallery graph links are covered — a rename is exactly what this job catches",
  );
  const contributing = collectUrls().find((u) => u.url === "https://nanoodle.com");
  assert.match(contributing.where, /CONTRIBUTING\.md/, "CONTRIBUTING.md is scanned too");
});

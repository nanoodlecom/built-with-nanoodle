// Check every "Try it" entry in README.md. Zero dependencies, no network, Node >= 20.
//
//   https://nanoodle.com/play#a=<base64url(gzip(app JSON))>
//   https://nanoodle.com/play#a=u<base64url(app JSON)>      (uncompressed fallback)
//
// EVERY [Try it](…) target is an entry, not only the ones that already look like an
// app link. A shortened link, the README template's "paste your #a= link here"
// placeholder, or a bare URL with no payload is a problem to report — a checker that
// silently skips what it cannot parse tells a contributor their entry passed when
// nothing looked at it.
//
// Fenced code blocks are pulled out first, so the README's own entry template is not
// read as a live entry. That carve-out is the one place an entry could hide, so it is
// not silent either: a Try-it link inside a fence that is NOT the template placeholder
// is reported as well. Pasting a real share link into the template block is a mistake
// a contributor makes, and the fence must not swallow it.
//
// "Well-formed" means: an object with v === 1 and a graph carrying a nodes array —
// the same floor the play.html boot importer requires. Links are only verified to
// decode; whether an app is *good* is PR review's job.

import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const README = join(dirname(fileURLToPath(import.meta.url)), "..", "README.md");

const TRY_RE = /\[Try it\]\(([^)]*)\)/g;
// The link nanoodle's 🔗 Share button copies. www. and the /play.html form are the
// same page, so both are accepted and decoded like any other entry.
const APP_RE = /^https:\/\/(?:www\.)?nanoodle\.com\/play(?:\.html)?#a=(u?)([A-Za-z0-9_-]+)$/;
const PLACEHOLDER_RE = /^$|paste your|<share link>|your #a= link/i;
// CommonMark fences: ``` or ~~~, 3 or more of the character, indented up to 3 spaces,
// closed by the same character. CONTRIBUTING.md indents its fences under a list item,
// so a column-0-only pattern would miss that style the day it reaches README.md. An
// unclosed fence runs to the end of the file, which is what CommonMark does too.
const FENCE_RE = /^ {0,3}(`{3,}|~{3,})[^\n]*\n([\s\S]*?)(?:^ {0,3}\1[ \t]*$|$(?![\s\S]))/gm;

/**
 * Split the text into the prose outside fenced code blocks and the text inside them.
 * The README's own entry template lives in a fence, so it must not count as an entry —
 * but the fenced text is handed back, not thrown away, so nothing hides in there.
 */
export function splitFences(text) {
  const fenced = [];
  const prose = text.replace(FENCE_RE, (block, _marker, body) => {
    fenced.push(body ?? "");
    return "";
  });
  return { prose, fenced: fenced.join("\n") };
}

/** Drop fenced code blocks — the README's own entry template lives in one. */
export function stripFences(text) {
  return splitFences(text).prose;
}

export function decodeAppLink(tag, payload) {
  const bytes = Buffer.from(payload, "base64url");
  const json = tag === "u" ? bytes.toString("utf8") : gunzipSync(bytes).toString("utf8");
  return JSON.parse(json);
}

export function checkReadme(text = readFileSync(README, "utf8")) {
  const problems = [];
  let count = 0;
  const { prose, fenced } = splitFences(text);

  // A real share link inside a fence is a contributor who edited the template in place
  // instead of adding a line under it. Say so; do not let the carve-out hide it.
  for (const [, target] of fenced.matchAll(TRY_RE)) {
    const raw = target.trim();
    if (PLACEHOLDER_RE.test(raw)) continue;
    const where = raw.length > 60 ? raw.slice(0, 60) + "…" : raw;
    problems.push(
      `${where}: this Try-it link sits inside a fenced code block, so it is not a listed ` +
      `entry — add your line under the template block, not inside it`,
    );
  }

  for (const [, target] of prose.matchAll(TRY_RE)) {
    count++;
    const raw = target.trim();
    const where = (raw.length > 60 ? raw.slice(0, 60) + "…" : raw) || "(empty link)";

    if (PLACEHOLDER_RE.test(raw)) {
      problems.push(`${where}: still the template placeholder — paste the real share link here`);
      continue;
    }
    const m = APP_RE.exec(raw);
    if (!m) {
      problems.push(
        `${where}: not a nanoodle app link — a Try-it link must be the full-length ` +
        `https://nanoodle.com/play#a=… link that 🔗 Share copies (a shortened link hides the payload)`,
      );
      continue;
    }

    let app;
    try {
      app = decodeAppLink(m[1], m[2]);
    } catch (e) {
      problems.push(`${where}: does not decode (${e.message})`);
      continue;
    }
    if (!app || typeof app !== "object" || app.v !== 1) {
      problems.push(`${where}: not a v1 app payload`);
    } else if (!app.graph || !Array.isArray(app.graph.nodes) || !app.graph.nodes.length) {
      problems.push(`${where}: app has no graph nodes`);
    }
  }
  if (!count) problems.push("no Try-it links found in README.md — regex or README drifted");
  return { count, problems };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { count, problems } = checkReadme();
  console.log(`${count} link(s) checked`);
  for (const p of problems) console.error("✗ " + p);
  process.exit(problems.length ? 1 : 0);
}

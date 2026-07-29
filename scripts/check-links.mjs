// Check every "Try it" entry in README.md. Zero dependencies, no network, Node >= 20.
//
//   https://nanoodle.com/play#a=<base64url(gzip(app JSON))>
//   https://nanoodle.com/play#a=u<base64url(app JSON)>      (uncompressed fallback)
//
// EVERY [Try it](…) target is an entry, not only the ones that already look like an
// app link. A shortened link, the README template's "paste your #a= link here"
// placeholder, or a bare URL with no payload is a problem to report — a checker that
// silently skips what it cannot parse tells a contributor their entry passed when
// nothing looked at it. Fenced code blocks are stripped first, so the template in the
// README is not read as an entry.
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
const FENCE_RE = /^```[^\n]*\n[\s\S]*?^```[^\n]*$/gm;

/** Drop fenced code blocks — the README's own entry template lives in one. */
export function stripFences(text) {
  return text.replace(FENCE_RE, "");
}

export function decodeAppLink(tag, payload) {
  const bytes = Buffer.from(payload, "base64url");
  const json = tag === "u" ? bytes.toString("utf8") : gunzipSync(bytes).toString("utf8");
  return JSON.parse(json);
}

export function checkReadme(text = readFileSync(README, "utf8")) {
  const problems = [];
  let count = 0;
  for (const [, target] of stripFences(text).matchAll(TRY_RE)) {
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

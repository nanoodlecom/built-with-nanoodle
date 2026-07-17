// Decode every "Try it" app link in README.md and verify it is a well-formed
// nanoodle app payload. Zero dependencies, Node >= 20.
//
//   #a=<base64url(gzip(app JSON))>   |   #a=u<base64url(app JSON)>
//
// "Well-formed" means: an object with v === 1 and a graph carrying a nodes
// array — the same floor the play.html boot importer requires. Links are only
// verified to decode; whether an app is *good* is PR review's job.

import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const README = join(dirname(fileURLToPath(import.meta.url)), "..", "README.md");
const LINK_RE = /\[Try it\]\((https:\/\/nanoodle\.com\/play#a=(u?)([A-Za-z0-9_-]+))\)/g;

export function decodeAppLink(tag, payload) {
  const bytes = Buffer.from(payload, "base64url");
  const json = tag === "u" ? bytes.toString("utf8") : gunzipSync(bytes).toString("utf8");
  return JSON.parse(json);
}

export function checkReadme(text = readFileSync(README, "utf8")) {
  const problems = [];
  let count = 0;
  for (const [, link, tag, payload] of text.matchAll(LINK_RE)) {
    count++;
    const where = link.slice(0, 60) + "…";
    let app;
    try {
      app = decodeAppLink(tag, payload);
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

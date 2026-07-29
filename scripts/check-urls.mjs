#!/usr/bin/env node
// Resolve every http(s) URL in README.md and CONTRIBUTING.md and fail on a non-200.
//
// This is the network half of the link check. `npm test` proves an app link decodes,
// which needs no network and stays the offline check a contributor can run. It says
// nothing about the pages this repo points AT. Those rot: awesome-noodles renames its
// graph files (twice so far), and a renamed file turns a "graph JSON" link into a 404
// that no other check in this repo would see. This one names the dead URL.
//
// Runs in CI only (.github/workflows/test.yml, job "urls"), on every push and PR and
// once a week — an upstream rename breaks the README with no commit of ours to trigger
// on. Run it by hand any time: node scripts/check-urls.mjs
//
// Fragments are dropped before the request: a server never sees "#a=…", so the 5 app
// links all resolve to the same page and are checked once.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILES = ["README.md", "CONTRIBUTING.md"];
const URL_RE = /https?:\/\/[^\s)\]<>"'`]+/g;
const TIMEOUT_MS = 20000;
const ATTEMPTS = 3;

/** Every http(s) URL in the given files, fragment stripped, deduped, each with the files it came from. */
export function collectUrls(root = ROOT, files = FILES) {
  const found = new Map();
  for (const file of files) {
    for (const raw of readFileSync(join(root, file), "utf8").match(URL_RE) || []) {
      const url = raw.replace(/[.,;:]+$/, "").split("#")[0];
      if (!url) continue;
      if (!found.has(url)) found.set(url, new Set());
      found.get(url).add(file);
    }
  }
  return [...found].map(([url, where]) => ({ url, where: [...where].join(", ") }));
}

async function resolve(url) {
  let last = "";
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(TIMEOUT_MS) });
      res.body?.cancel().catch(() => {});
      if (res.status === 200) return { ok: true, status: 200 };
      // 429 and 5xx are the remote having a bad minute, not a dead link — retry those.
      if (res.status !== 429 && res.status < 500) return { ok: false, status: String(res.status) };
      last = String(res.status);
    } catch (e) {
      last = e.name === "TimeoutError" ? `timed out after ${TIMEOUT_MS / 1000}s` : e.message;
    }
    if (attempt < ATTEMPTS) await new Promise((r) => setTimeout(r, attempt * 2000));
  }
  return { ok: false, status: last };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const targets = collectUrls();
  const dead = [];
  for (const { url, where } of targets) {
    const { ok, status } = await resolve(url);
    console.log(`${ok ? "ok  200" : "DEAD " + status}  ${url}`);
    if (!ok) dead.push(`${status}  ${url}  (linked from ${where})`);
  }
  console.log(`${targets.length} URL(s) resolved`);
  for (const d of dead) console.error("✗ dead link: " + d);
  process.exit(dead.length ? 1 : 0);
}

#!/usr/bin/env node
// Resolve every link in README.md and CONTRIBUTING.md and fail on a dead one.
//
// This is the network half of the link check. `npm test` proves an app link decodes,
// which needs no network and stays the offline check a contributor can run. It says
// nothing about the pages this repo points AT. Those rot: awesome-noodles renames its
// graph files (twice so far), and a renamed file turns a "graph JSON" link into a 404
// that no other check in this repo would see. This one names the dead URL.
//
// Two kinds of link, both covered, because a dead CONTRIBUTING.md link is the same
// class of bug as a dead https one:
//   - http(s) URLs are fetched and have to answer 200.
//   - relative targets (CONTRIBUTING.md, LICENSE) have to exist in the repo. No
//     network, so this half also runs inside `npm test`.
//
// Runs in CI (.github/workflows/test.yml, job "urls"), on every push and PR and once a
// week — an upstream rename breaks the README with no commit of ours to trigger on.
// Run it by hand any time: node scripts/check-urls.mjs
//
// Fragments are dropped before the request: a server never sees "#a=…", so the 5 app
// links all resolve to the same page and are checked once.

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILES = ["README.md", "CONTRIBUTING.md"];
const URL_RE = /https?:\/\/[^\s)\]<>"'`]+/g;
const MD_LINK_RE = /\[[^\]\n]*\]\(([^)\s]+)\)/g;
const TIMEOUT_MS = 20000;
const ATTEMPTS = 3;

// github.com/<owner>/<repo>/edit/<ref>/<path> is a signed-in-only page. Anonymously it
// 302s to the login form, which answers 200 for ANY path — a deleted file included. So
// fetching it verifies nothing. Check the blob URL for the same file instead: that is
// the real target, and it 404s when the file is gone.
const GH_EDIT_RE = /^(https:\/\/github\.com\/[^/]+\/[^/]+)\/edit\/(.+)$/;

/** The URL to actually request for a link, and why, when the two differ. */
export function requestTarget(url) {
  const m = GH_EDIT_RE.exec(url);
  if (m) return { url: `${m[1]}/blob/${m[2]}`, note: "via blob: /edit/ needs a login and 200s for any path" };
  return { url, note: "" };
}

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

/**
 * Every relative markdown link target in the given files, deduped. Anchors, mailto: and
 * absolute URLs are somebody else's job; everything left has to be a file in the repo.
 */
export function collectRelativeLinks(root = ROOT, files = FILES) {
  const found = new Map();
  for (const file of files) {
    for (const [, raw] of readFileSync(join(root, file), "utf8").matchAll(MD_LINK_RE)) {
      const target = raw.split("#")[0];
      if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("/")) continue;
      if (!found.has(target)) found.set(target, new Set());
      found.get(target).add(file);
    }
  }
  return [...found].map(([target, where]) => ({ target, where: [...where].join(", ") }));
}

/** Relative targets that do not exist on disk. */
export function deadRelativeLinks(root = ROOT, files = FILES) {
  return collectRelativeLinks(root, files).filter(
    ({ target }) => !existsSync(join(root, normalize(target))),
  );
}

async function resolve(url) {
  let last = "";
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(TIMEOUT_MS) });
      res.body?.cancel().catch(() => {});
      // A redirect to a sign-in form is not proof the target is alive — it is proof we
      // were never shown it. Treat it as dead rather than as a green 200.
      if (/^https:\/\/github\.com\/(login|session)\b/.test(res.url)) {
        return { ok: false, status: `needs a login (redirected to ${res.url.split("?")[0]}) — check nothing` };
      }
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
  const dead = [];

  const relative = collectRelativeLinks();
  for (const { target, where } of relative) {
    const ok = existsSync(join(ROOT, normalize(target)));
    console.log(`${ok ? "ok  file" : "MISSING "}  ${target}`);
    if (!ok) dead.push(`no such file  ${target}  (linked from ${where})`);
  }
  console.log(`${relative.length} relative link(s) checked on disk`);

  const targets = collectUrls();
  for (const { url, where } of targets) {
    const { url: request, note } = requestTarget(url);
    const { ok, status } = await resolve(request);
    console.log(`${ok ? "ok  200" : "DEAD " + status}  ${url}${note ? `  [${note}]` : ""}`);
    if (!ok) dead.push(`${status}  ${request}  (linked from ${where})`);
  }
  console.log(`${targets.length} URL(s) resolved`);

  for (const d of dead) console.error("✗ dead link: " + d);
  process.exit(dead.length ? 1 : 0);
}

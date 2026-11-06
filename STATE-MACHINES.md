# State machine audit

Audited 2026-11-06 from `12d5f33c6674d1ee74c3abbc0b352a26ea32c113`.
Scope: all tracked source, tests, documentation, embedded starter-app payloads,
and the GitHub Actions workflow. No open PRs existed at inspection time.

This repository is a Markdown showcase with two zero-dependency validation
scripts, not the nanoodle application runtime. `package.json` is private and
exists only to run tests. GitHub reported no Pages site, deployments or releases.
The release action here is a verified merge to `main`; no package publication or
service deployment is required. The scripts make read-only HTTP requests.

## Inventory

| Machine | States and transitions | Invariant / recovery |
| --- | --- | --- |
| Markdown fences (`splitFences`) | Prose → fence on a valid opener; fence → prose on a matching character with at least the opening length; EOF preserves an unclosed fence. | Fenced examples cannot become live entries. CRLF, longer closers, invalid backtick info, shorter and mismatched closers have regression coverage. |
| Entry validation (`checkReadme`) | Collected → placeholder / invalid URL / decode failure / invalid version / empty graph / accepted. Fenced real links become explicit errors; zero live entries fails. | Every recognized Try-it entry receives a result. Gzip and plain JSON paths and accepted host/path variants are tested. Validation checks payload shape, not runtime execution or provider model availability. |
| Share decoding (`decodeAppLink`) | Base64url → gzip or plain bytes → UTF-8 → JSON; decompression/parse errors return to the entry collector as problems. | Failure of one entry does not skip later entries. Payloads are processed synchronously; no mutable persisted state. |
| URL collection (`collectUrls`, `requestTarget`) | Documents → extracted URLs → strip fragments → deduplicate with source attribution → map GitHub edit URLs to blob URLs. | Five app fragments become one HTTP request. A login page cannot establish that an edit target exists. Extraction is a lightweight Markdown/URL scanner, not a general Markdown renderer. |
| Local link resolution | Source document → relative target → remove query/fragment → decode URL filename → resolve from source directory → exists / missing. | Nested document paths and encoded filenames resolve consistently. The collector and CLI use the same normalized targets. |
| HTTP request (`resolveUrl`) | Attempt → response or network/timeout error → response cleanup → success, permanent failure, login failure or retry delay. 429/5xx and transport failures retry; attempts stop at three. | Each attempt has a fresh 20-second abort deadline. Delays are 2 then 4 seconds. Cleanup completes before the next attempt. Cleanup rejection is ignored; final transport/status failure is reported. Deterministic tests cover success, 403/404, login/session redirects, rate limits, 503, transport errors, timeout exhaustion and recovery. |
| CLI aggregation | Relative checks → sequential deduplicated HTTP checks → collect failures → exit 0 or 1. | A failed URL does not prevent remaining URLs being checked. No live data is written. |
| CI lifecycle | Push / PR / weekly schedule / manual trigger → three offline Node jobs plus network job → pass or fail. | Weekly checks detect upstream link rot without repository changes. Network failures remain visible after bounded retries; the next workflow run can recover. No publish or deployment job exists. |
| Contribution lifecycle | Build app → share/export → edit README → PR → validation and human review → merge. | Placeholder examples stay fenced. Policy requires no secrets or personal data; the checker does not claim to verify every policy rule. |

## Embedded workflows

All five links decode, with unique node IDs and links between existing nodes.
These graphs describe additional runtime state machines implemented in the
separately maintained nanoodle app:

| Starter app | Data dependencies |
| --- | --- |
| Teacup dragon studio | Text → image. |
| Model arena | One text prompt fans out to four model-specific image nodes; results can finish independently. A comment node is inert. |
| Photo to video | Text → image → image-to-video. Video depends on the still image. |
| Lyrics to song | Text → lyrics LLM → style LLM; music consumes both lyrics and style. The music node must wait for both inputs. |
| See, think, speak | User image upload → vision description → poem LLM → speech. Empty upload requires user input. |

Execution, cancellation, provider polling, error/retry, key handling, browser
persistence and recovery belong to that runtime and are not implemented here.
No billable model requests were made during this audit.

## Findings and validation

1. A valid longer closing fence was treated as an unclosed block, rejecting a
   following live entry. CRLF and invalid backtick info were also parsed
   incorrectly. Reproduced as a failing regression test, then replaced the
   whole-block regex with explicit prose/fence transitions.
2. Relative targets were resolved from the repository root and URL filenames
   were not decoded. A nested document linking `../README.md` and `a%20b.md`
   incorrectly reported both missing. Reproduced as a failing regression test,
   then corrected source-relative resolution and filename decoding.
3. HTTP body cancellation was started without awaiting resource release.
   Cleanup now completes before returning or retrying. Added lifecycle tests
   that assert cleanup ordering, fresh deadlines, bounded retries and final
   diagnostics without real sleeps or external servers.
4. The lyrics starter description implied parallel LLM inputs, while the
   committed payload makes style generation depend on completed lyrics.
   Updated the description to match the graph.

Baseline: 10 tests passed. The two new parsing/resolution tests failed on the
baseline and pass after the fixes. The final suite has 16 passing tests on the
pinned Node 24.22.1 runtime; CI also covers Node 22.23.4 and 26.12.1. The live
URL checker verifies the existing public destinations separately. Merge and
CI receipts belong in the pull request so they can identify the final head.

Rollback, if needed: revert the audit fix commit through a new PR. This changes
validation and documentation only; there is no database migration, live-data
mutation or server rollout to undo.

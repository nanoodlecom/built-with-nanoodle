# Add your app

One PR = one app. No third-party app has landed yet, so yours would be the
first one in the list.

1. **Build it** at [nanoodle.com](https://nanoodle.com) — wire the graph, hit
   ✨ Create app, make it yours.
2. **Get the link**: the app's 🔗 Share button copies the `#a=` link that
   carries the whole app. Use the full-length link, not a shortened one —
   the checker (and future embeds) need the payload in the fragment.
3. **Add one line** to the Apps section of the README. The fastest way is
   [edit README.md in the browser](https://github.com/nanoodlecom/built-with-nanoodle/edit/main/README.md)
   — GitHub makes the fork and the PR for you:

   ```
   - <emoji> **<App name>** — <one-line description>. [Try it](<share link>)
   ```

   If the app also lives somewhere as an exported `.html` (your site, a
   gist, a Pages deploy), link it at the end of the description.
4. **Run `npm test`** — it decodes every Try-it link and checks it's a valid
   app payload. A placeholder or a shortened link fails there, not in review.
   If you edited in the browser, CI runs the same check on your PR, and also
   resolves every other link on the page.

Rules:

- The app must load and run end-to-end on a fresh browser with a valid key.
- Made with nanoodle — this list is for apps built on the node editor, not
  general AI apps.
- SFW, no secrets: share links must never contain API keys or personal data
  (nanoodle strips uploaded media from shares by design; don't re-add any).
- Note rough cost in the description if a run costs more than a few cents
  (video models mostly).

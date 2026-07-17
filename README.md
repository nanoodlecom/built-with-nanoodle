# built-with-nanoodle 🍜✨

**Apps people shipped with [nanoodle](https://nanoodle.com).** Every entry is
a working app — built visually as a node graph, turned into an app with
✨ Create app, and shared as a link that carries the whole thing inside it.
Click "Try it" on any entry and the app opens in your browser, runs on *your*
own NanoGPT key, and uploads nothing anywhere.

Shipped something with nanoodle? [Add it](CONTRIBUTING.md) — exported
single-file apps, remixes, and tiny weekend hacks all count.

## Apps

- 🐉 **Teacup dragon studio** — Type a scene, get a photo-real image; the seed
  example every remix starts from. [Try it](https://nanoodle.com/play#a=H4sIAAAAAAAAA03PQW7DIBCF4auM3pqFbVVZcI7uqiyQwTYKMAiPq1gWd69IY8VrnobvP_AL3SskEx00vp0Zt0y2mJkTrbJZz1CYi8kL9HGO2boV-ueAt9BIPRRkz-2AuKdA4Ql96xR26H7oFCbvgl3bgde7hiHxaT__GbcSnKUtk1mDc5l8IkPysiiKZixMeWFhRStPQpFL8mmm4OdFUKs6IcMH4qOZ3b_ka3hTuiul1rtC8OlxKQmtZCocG7VVnnWZi5x1VUH4Ohg-g1w45ka61_oHgvKnDFsBAAA)

*(That's the seed entry — yours goes right below it.)*

## How these links work

An app link (`#a=…`) packs the app — its graph, name, and any custom UI —
gzipped into the URL fragment. Nothing is hosted: opening the link unpacks
the app locally in your browser. You bring your own
[NanoGPT](https://nano-gpt.com) key; the app's author never sees your key,
your prompts, or your outputs. Exported apps are the same thing as a single
`.html` file you can host anywhere — if an entry has a live URL, it's
linked from its description.

## Checks

`npm test` decodes every "Try it" link in this README and verifies it is a
well-formed nanoodle app payload (`v`, `graph.nodes`). Links are only
verified to *decode* — quality judgments happen in PR review, by humans.

## License

MIT — see [LICENSE](LICENSE). Not affiliated with NanoGPT. Build your own at
[nanoodle.com](https://nanoodle.com).

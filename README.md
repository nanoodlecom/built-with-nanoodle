# built-with-nanoodle 🍜✨

**Ship an app with [nanoodle](https://nanoodle.com) and it belongs on this
list.** Everything on it so far is one of ours, so the first app that isn't
gets an empty shelf to itself. Each entry is a working app: built visually as a
node graph, turned into an app with ✨ Create app, and shared as a link that
carries the whole thing inside it. Click "Try it" on any entry and the app
opens in your browser, runs on *your* own NanoGPT key, and uploads nothing
anywhere.

Made something? [Add it](CONTRIBUTING.md) — exported single-file apps, remixes,
and tiny weekend hacks all count.

## Apps

### From the team — official starter apps

Every entry below is by the nanoodle team itself — no third-party apps have
landed yet, so yours would be the first. Several started life as gallery
graphs in
[awesome-noodles](https://github.com/nanoodlecom/awesome-noodles). The graph JSON links below are
snapshots of the workflows embedded in their "Try it" links, so you can download
and remix those exact graphs even when the upstream gallery changes.

- 🐉 **Teacup dragon studio** — Type a scene, get a photo-real image; the seed
  example every remix starts from. [Try it](https://nanoodle.com/play#a=H4sIAAAAAAACA1WQwW7DIAyGX8XymUppFE0Tz7Hb1AMKJEEFjIBUSaO8-0y2qN0FhPj8-7M3fKC8CgzKG5T4ZVQ_R9BJjRQgl1lbQoFjUnFCuZ0waZNRfm9oNReFKyNljTWgmKXwa0H50QhcGW_5HqxxOteA41-igmLDevbp5-SMBm6ssjMmgg3AxOEiwKs-EcSJCgnINBTwlIINIzg7TgX3XZwi7UvEejWaX5Ou_VNp_ql4nsIxeXecdTn4y6PjkmyfNaFtus-lHtzhJpCp-9vQrg49JPI1qi7kXESkVM5F7KxD70D7AiLXxmp_2_cf4uZEMIYBAAA) · [graph JSON](graphs/teacup-dragon-studio.noodle-graph.json)
- 🥊 **Model arena** — One prompt fans into four image nodes, each pinned to a
  different image model. Hit Run once and judge the four side by side; swap any
  contender's model in the app's Settings. [Try it](https://nanoodle.com/play#a=H4sIAAAAAAAAA52TsY7bMBBEf2WxTRrqzpZ0LtSmSZMmKYMr9sSVzJy0ZEjKPsEQkDp1-lT5sXxBPiGQfIoVQHAAV2pG82bI4QkPWGwVCrWMBb63mhsgz0KosPbk9licZo3VHLD4dEKjsUDZosLYu_G_0rYtS0SFL1jsNgp7LPKNwspwo8NoEfklYoG_f_z8BgtKAVYYnLetiwoq23kwLdUM7agJCj53umYNwWiGp3763sE7E-FDJ_Dr63ewHsKRHJD0UFqJLJr9m3A2ACPwkWM0UgeojA_xDodBzQ3SS4Mp3zJ-tlnLTxCN9KA91Vag7HzDGjoHFBpmN-IIIlPZOQUtld6C29toFQRbRWitFyM1NKbex2WQ7BJkqn9Okr9G2f2TZCqGBdYuJpM4SXH4e4Nv5yOALV7886v-ab4KEBKbPJGQUJImFYW4ykkXnIernDxd5Xw5srw2yVYJ2YKw-89JrRKOdODgmHVC5v7ZMyWHNGnI13w_3msS7Zm_Ss9xeFTYGHlejL8Zx195246Y8WHMc3LWx3lOg8Jol4LsIjhPfrGBJr3FMb_mmN3i-HDNMb_Fcbfi-DgMfwAcWMz-ewQAAA) · [graph JSON](graphs/image-model-arena.noodle-graph.json)
- 📽️ **Photo to video** — Type a prompt: an image node renders a still, then a
  video node animates that still into a short clip. Video runs cost more than
  a few cents. [Try it](https://nanoodle.com/play#a=H4sIAAAAAAACA21R227CMAz9FcvPqYDC2Nav2PvEQ6Bpay1NqjgFOtR_nwN0dGJSpCrp8bn5gkcsVgqdbg0W-NH46EHOkUrjUWEddNdgcZlgvjSMxecFqRS4WwkkDl0ajeYc5XbGYrtUOAg8l29FxpacCK7_C9QQyQ3Amuze6wjegYba-hO5Gvbkbd-SM3wwLgIbrcBR3UQFHHVgHEc1SecPaWp1bW7am-VdfPlHvBXfVpCtiXrR9myy68wimcqizyYGpu9EuNoW73Ot9UxrakbEXjf_inXBt13KyhILup6bjJyCWiJZAyd9NKzgIIUHDWWgKjJUPpx0KIX21yk5MXXOmnXGUk1vdaA4LK5Gk-PJRjAsnUXyToY2b8tO3so-6PvLi8TYKbTkvmZ7s2lvldhMdtNOp112PsRpl6Nk9nNA_gDcIz4qsvk_jLOBW8FPlOsnxLgbxx--xaP3lQIAAA) · [graph JSON](graphs/photo-to-video.noodle-graph.json)
- 🎵 **Lyrics to song** — One LLM turns an idea into lyrics, then a second
  writes a matching style description from those lyrics. A music node uses
  both to sing the result.
  [Try it](https://nanoodle.com/play#a=H4sIAAAAAAACA51SW06DQBTdymS-AVuoTWQNfvljjDFmQody03ll5tYWGxIX4QpdiXdABJOq0S8GOPc87pwTf-LlMuFGaMlLft16qAJDy4I1W57wrReu4eVphNmNDLy8P3HYENwsCYKti6Moj0hvR16uFwlvh0cNUm1CnO9_l_zWA0om2AEC1nvFrhak5sGljXV0ENUuYzfSSYEMG8kaa3cZ77pkFMwnQaX0oFesBsH8i2BoA0pNuDu7Z8JH0ZjpEA34jA1GrFFtL6SG4G8vr8xYhoBKJvFUWa2lQeHbjMQ0xVdE-ZwKuNgqnV5mRVorEZq5x-KMx3X-4XH9vUkwTyRFPvU-QCUUC9gqSfZoGTVg6I1ugUAfdvtVUYADYDNF6acSRoCGvtB9VbRfpLEx3X8yraZMvbsh1dXi3FWDCej3vQQR10IFOcloMKDF8aJnSeOqvAzOmiAfa-u1iCXRriDth4QrMLtZ3VSsW-2tjiqximMFnfU4VrAjo3YOyCeAo1mHs1wqP8OY_8a4mgDDRcwZi_8wFj95XJ1hLP7g8ZPxoeveAREaMbnwAwAA) · [graph JSON](graphs/sing.noodle-graph.json)
- 👁 **See, think, speak** — Upload a photo: a vision model describes it, an
  LLM condenses the description into a four-line poem, and a TTS node reads
  the poem aloud. [Try it](https://nanoodle.com/play#a=H4sIAAAAAAACA4WSTW-cMBCG_4rlM5ANbKuWc6T2kFyaXqoqilwYYLS2x7UNXbriv3ecZLtIi5QTH36fl2eMT3KS9W0mrTIga_kIkIk4oD1kIjhQB5nJ3is3yPp0TlILQdY_TxJbJuwtR-LsEj06Tarl56OsP-4yOTNQ8rVD0C0zp2XJzlh5wSYMSPYVq_Zv3G7Nyd8cu4PQePwFyS8INKoHgVZMOGGbiYZs4yGCaCEq1AXXGTbVDPZEvYabHgxazKviU95pFQa5sqkuNlqbtwnKTZUwhwiGgz9oFMqDUMIRxEJ8H71lt2SQRF3koVgwEif-YIjdqEVHo881WkiMKcQ3cHrm1TgIsnyX8JeVlf7fXOFNr03-oaiuzfcX8xjDq_nn3ab5ufCBt8GoY_7oAJohL3lDvt4xORE2qeceJ9Dz8xf0mt96CI5sgOeOvFGR142r2OApkzzIYXUUdDoKnSeTPpaOyfl4OPKJe_llcmFfWifKq8T_6XS50bjKRzjG68LqEnDMurhurDYaq_ca9xuNT8vyD4K9SWA9AwAA) · [graph JSON](graphs/see-think-speak.noodle-graph.json)

### Add yours — the list is still waiting on its first outside app

Just built something? In the app, hit 🔗 **Share** to copy its `#a=` link, then
[click here to edit this README on GitHub](https://github.com/nanoodlecom/built-with-nanoodle/edit/main/README.md)
— GitHub forks the repo for you and opens a PR at the end. Add one line under
this heading:

```markdown
- 🍜 **Your app name** — one line on what it does. [Try it](paste your #a= link here)
```

That's the whole process. The [full rules](CONTRIBUTING.md) are short: it has to
load and run, it has to be SFW, and the link must not carry any key or personal
data.

## How these links work

An app link (`#a=…`) packs the app — its graph, name, and any custom UI —
gzipped into the URL fragment. Nothing is hosted: opening the link unpacks
the app locally in your browser. You bring your own
[NanoGPT](https://nano-gpt.com) key; the app's author never sees your key,
your prompts, or your outputs. Exported apps are the same thing as a single
`.html` file you can host anywhere — if an entry has a live URL, it's
linked from its description.

## Checks

`npm test` reads every "Try it" entry in this README and decodes it: each one
has to be a full-length `#a=` share link that unpacks into a well-formed app
payload (`v`, `graph.nodes`). A placeholder or a shortened link fails, and so
does a real link pasted *inside* the template's code fence instead of under it.
It also checks that every relative link in this file and in CONTRIBUTING.md —
`CONTRIBUTING.md`, `LICENSE`, and graph snapshots — points to a file that exists. None of that touches the
network, so you can run it before you open the PR.

CI runs that plus the one check it cannot: `scripts/check-urls.mjs` fetches
every http link in this file and in CONTRIBUTING.md and fails on a dead one. It
runs weekly as well as on each PR, because a page we point at can 404 without
us touching a thing. The "edit this README on GitHub" link is resolved through
its `blob` URL — the `edit` page sends a signed-out visitor to the login form,
which answers 200 for any path at all, so fetching it directly would prove
nothing.

Links are only verified to *load* — quality judgments happen in PR review, by
humans.

## License

MIT — see [LICENSE](LICENSE). Not affiliated with NanoGPT. Build your own at
[nanoodle.com](https://nanoodle.com).

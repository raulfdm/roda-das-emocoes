# 06 — English Labels and the Locale switcher

**What to build:** you can change language without losing your place. All 130 English Labels join the
Wheel, and a switcher moves between Portuguese and English. Switching mid-Selection keeps the exact
same Node — only the words change — and the shareable link updates to the new language.

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] All 130 English Labels are transcribed from `docs/wheels/english.png` onto the existing tree
- [ ] Every Node has a Label in both Locales; the tree's shape is untouched by the addition
- [ ] A switcher changes the active Locale, re-rendering every Label on the Wheel
- [ ] Switching Locale preserves the current Focus and Selection exactly — same Node, different words
- [ ] Switching Locale rewrites the query state to the new language's words for that same Node
- [ ] Portuguese remains the default when no Locale is specified
- [ ] The data-invariant test is extended to assert the tree is structurally identical across
      Locales — same Node count, same shape, same parent-child relationships

## Notes

The published English, Portuguese and Spanish wheels all preserve Roberts' exact structure, position
for position — `Playful→Diversão`, `Content→Satisfação`, `Let down→Desapontado`, and so on for all
41 branches. That shared structure is the only reason lossless Locale switching is possible, and it
is a property to protect: the structural-identity test exists to catch a transcription that drifts.

An earlier Spanish image circulating online is a **different wheel** — the Willcox 6-core variant,
114 Nodes, no `Mal` branch, mislabelled as Plutchik. Do not use wheels from other lineages as a
transcription source. Only `docs/wheels/` is authoritative.

See ADR-0004: Labels are adopted verbatim. Do not normalise, de-gender, or "fix" them.

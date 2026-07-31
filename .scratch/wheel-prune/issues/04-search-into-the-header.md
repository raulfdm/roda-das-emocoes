# 04 — Demote search into the header

**What to build:** search stops being the second thing on the page. It moves into the header row
beside the Locale switcher as a compact field, and the Wheel becomes the first thing below the title.

**Blocked by:** —

**Status:** ready-for-agent

- [ ] The `<search>` block at `+page.svelte:161-215` moves into the `<header>`, sharing its row with
      the Locale switcher
- [ ] The visible `<label>` becomes `sr-only`; the placeholder carries it on screen and
      `words.searchLabel` still names the field for assistive technology
- [ ] The field loses `shadow-sm` and its full-page width, and reads as chrome rather than as the
      page's primary control
- [ ] Results still drop as an overlay anchored to the field, still render each hit as a full Path,
      and still clear the query on pick
- [ ] The Wheel is the first thing below the title and tagline on both platforms
- [ ] On a phone the header still wraps sensibly at 360px, and the search field does not push the
      Wheel below the fold
- [ ] The results overlay is above the Wheel in stacking order and does not clip against it
- [ ] Keyboard: the field is reachable in a sensible tab order relative to the Locale switcher, and
      Escape clears an open result list

## Notes

Explorer issue 08 already required that "search works on a phone without the field obscuring the
Wheel", so the current layout is arguably in breach of its own acceptance criteria — this issue is
closing that as much as it is changing taste.

The strip directly above the Wheel is contested: the Focus readout wants it on phones
(`+page.svelte:229-240`). Getting search out of there is the point.

Do not change what search *does*. Accent-insensitive matching, full-Path results, and
`pickResult`'s behaviour are all untouched — the ranked list of Labels is exactly as it was.

`words.searchLabel`, `searchPlaceholder`, `searchEmpty` and `searchClear` all survive. The
placeholder is now doing visible teaching work (`ex.: sobrecarga`), so do not shorten it.

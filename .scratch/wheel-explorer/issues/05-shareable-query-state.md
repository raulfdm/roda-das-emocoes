# 05 — Shareable query state

**What to build:** your place in the Wheel survives the address bar. The current Locale and Selection
live in query parameters, so a link you send someone opens the Wheel exactly where you were, and the
browser back button undoes your last descent instead of leaving the app.

**Blocked by:** 04

**Status:** wontfix — shipped, then reversed. See Reversal below.

- [ ] The active Locale and the Selection Path are carried in query parameters on a single route —
      there is no path-based routing and no page per Node
- [ ] Loading the page with those parameters restores the Wheel to that Selection, with its ancestors
      in Focus, without any intermediate interaction
- [ ] Changing the Focus or Selection updates the query state through history, so back and forward
      behave as expected
- [ ] The Selection is expressed in the active Locale's words, so a shared link reads naturally to
      whoever receives it
- [ ] Loading with no query state opens at the Cores in the default Locale — query state is additive,
      never required
- [ ] Malformed or unknown query state degrades gracefully to the default view rather than erroring

## Notes

This is a single-page app. Path-based routing was explicitly rejected; see the spec's "Application
shape and URL state".

Because Labels are not unique, a bare word cannot identify a Node — the full Path is what
disambiguates. Encoding only the leaf would be ambiguous for `Desapontado`, which sits on three
different Nodes.

## Reversal

**This shipped in full and is being removed.** ADR-0005, _The Wheel's place is not addressable_,
records the decision and the reasoning; `.scratch/wheel-prune/issues/01-delete-the-url.md` is the
work.

Every criterion above is deliberately unmade. `url.ts` is deleted, both halves; `focusShowing`
(`geometry.ts:105`) goes with it, having had no other caller; Focus and Selection become `$state`;
the `live` gate that existed to bridge the prerender/query-string gap is removed. Locale — the one
piece of this that was a preference rather than a position — survives in `localStorage` instead.

The last criterion is the only one that keeps its spirit: an old `?path=` link still degrades
gracefully to the default view. It just does so by there being nothing left to parse.

Kept rather than deleted because the reasoning is still correct — if the URL is ever wanted back,
this is the ticket that says how to do it, and its point about Labels not being unique remains true
of any future encoding.

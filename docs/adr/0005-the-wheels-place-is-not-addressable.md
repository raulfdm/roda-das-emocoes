# The Wheel's place is not addressable

The app carried its whole state in the address bar — `lang`, `path` and `focus` as query parameters,
with `+page.svelte:41` stating the rule outright: _"the URL is the only source of truth. There is no
second copy of the Locale, the Selection or the Focus to keep in step, and history gives back and
forward for free."_ That is a good architecture for an app whose state is worth addressing. This
one's is not.

Sharing a link was speculative. Nobody asked for it, nothing measured it, and the thing a reader
actually takes away — the word and its Path — leaves through the clipboard, not the address bar. What
the URL cost was concrete: `goto()` on every tap, so a three-tap descent is three history entries and
a growing query string the reader watches accumulate; `encodeShareable`/`decodeShareable` and their
tests; `focusShowing` resolving an inbound link's depth against the *receiving* screen's ring count;
and — because a prerendered page has no query string — a `live` gate that deliberately renders the
default view first and corrects it after mount, which is one of the two flashes on reload.

So the URL carries nothing. Focus and Selection are ordinary component state. Locale, the one piece
that is a preference rather than a position, moves to `localStorage`, because re-picking your
language on every visit is a real irritation and re-picking your feeling is just using the app.

## Consequences

- `url.ts` is deleted entirely, both halves, along with `focusShowing` (`geometry.ts:105`) whose only
  caller it was. The `live` gate goes too; the prerendered HTML is now simply correct rather than
  provisional.
- **The back button no longer undoes a descent.** It leaves the app, as it would from any other
  single view. This is the sharpest loss and it is deliberate: `Ver a roda inteira` and tapping the
  centre are the ways back up, and both were always there.
- **Links cannot be shared or received.** A `?path=` link written by an older build now opens at the
  Cores rather than erroring, which is the same graceful degradation the decode path always promised,
  arrived at by having no decode path at all.
- The reader's place does not survive a reload. Reopening the app puts you at the Cores in your
  stored Locale — which is where someone reaching for a feelings wheel is starting from anyway.
- This reverses the spec's "Application shape and URL state" in four of its five bullets and retires
  `.scratch/wheel-explorer/issues/05-shareable-query-state.md`. The surviving bullets are that this
  is a single-page app with one route, and that the page is prerendered to static HTML.
- It also dissolves `.scratch/wheel-viewport/issues/07-is-viewport-shareable-state.md`, which existed
  to decide what the Viewport would put in the URL. There is no URL for anything to go in.

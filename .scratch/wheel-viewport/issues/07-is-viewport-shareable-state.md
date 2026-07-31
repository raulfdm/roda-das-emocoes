# 07 — Is Viewport shareable state? Is Rings?

**Type:** grilling

**Blocked by:** 01, 05

**Status:** wontfix — out of scope, see Resolution

## Question

`+page.svelte:41` is emphatic: _"From then on the URL is the only source of truth. There is no second
copy of the Locale, the Selection or the Focus to keep in step, and history gives back and forward
for free."_ Anything new either joins the URL or becomes the first piece of state that doesn't — and
the second needs justifying against that comment.

Decide, per axis:

- **Rotation, scale, pan.** These are how a reader is looking, not what they found. Putting them in
  the URL means every drag is a history entry — `goto()` is called once per move (`+page.svelte:76`)
  — which would bury the back button under hundreds of frames of turning. But leaving them out means
  they are lost on reload and cannot be shared.
- **Rings.** Different in kind: closer to a preference than to a gesture, changes rarely, and
  currently derived from the viewport width rather than chosen. Does it belong in the URL, in
  `localStorage`, or nowhere?
- **`focusShowing()`.** `url.ts` already resolves a shared link to the right depth for the receiving
  screen, using `rings` (`geometry.ts:97`). If Rings becomes a reader's choice, whose value does a
  received link use — the sender's or the receiver's?
- **Prerendering.** The page is prerendered with no query string and reads the real URL only after
  mount (`+page.svelte:29`). Anything added to the URL has to survive that hydration gap without a
  flash.

## Notes

Blocked by 05 because if zoom and Rings merge into one control, "is Rings shareable" and "is scale
shareable" stop being separable questions.

## Resolution — out of scope, not answered

**There is no URL.** A pruning pass decided the address bar carries nothing at all: no `lang`, no
`path`, no `focus`. `url.ts` is deleted, `focusShowing` with it, and Focus and Selection become
ordinary component state. See ADR-0005, _The Wheel's place is not addressable_, and
`.scratch/wheel-prune/issues/01-delete-the-url.md`.

Every bullet in the Question presupposed a URL to decide about. Each one is now void rather than
settled:

- **Rotation, scale, pan** — already gone with the gesture descoping after ticket 11, and there is
  nowhere to put them regardless.
- **Rings** — the choice was URL, `localStorage`, or nowhere. Two of the three survive, and Rings
  is still not a reader's control, so this returns to ticket 05 if and when it becomes one. The
  prune answered the same shaped question for **Locale** — `localStorage` — which is the precedent
  Rings would follow.
- **`focusShowing()`** — deleted. `url.ts` was its only caller, and no link is ever received, so no
  link's depth needs resolving against a receiver's ring count.
- **Prerendering** — still real, but it is no longer a URL question. The hydration gap this bullet
  worried about was created by the `live` gate, which existed only to wait for a query string; with
  the URL gone, the remaining flash is the breakpoint one, and
  `.scratch/wheel-prune/issues/03-both-wheels-css-chooses.md` owns it.

Recorded as out of scope rather than resolved: the map's Decisions-so-far records the route actually
walked, and a scope boundary is not a step on it.

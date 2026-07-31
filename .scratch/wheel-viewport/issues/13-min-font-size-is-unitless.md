# 13 — `MIN_FONT_SIZE` is unitless, so it never fires

**Type:** task

**Blocked by:** —

**Status:** needs-triage

## Question

`geometry.ts` carries a threshold whose comment claims a job it cannot do:

```ts
/** Anything below this is unreadable, so the Label is left off rather than drawn as a smudge. */
const MIN_FONT_SIZE = 0.019;
```

It is `0.019` **in the Wheel's own units**, where the disc has radius 1. So it scales with the box:
5.0px on a 390px phone, 6.9px on a 1440×900 desktop, and smaller again on anything narrower. A
threshold that shrinks with the screen cannot protect a small screen, which is the only screen that
needs protecting.

Measured while resolving ticket 05, across every framing, ring count and locale tried: it suppressed
**zero** Labels. Including the states where it should have — the desktop poster at three rings drew
`Sobrecarregado` at 7.8px, and a phone at three rings drew it at 5.6px. Both are smudges by the
comment's own standard, and both were drawn.

Resolve:

- Should the floor be **absolute** — a px size below which a Label is left off regardless of how big
  the Wheel is drawn? If so, what is it? The app's own revealed answers are 7.8px (what the desktop
  poster shipped with, and 05 judged too small) and 13.6px (what it ships with now).
- The font size is computed in Wheel units inside the SVG, which knows nothing about pixels. Where
  does an absolute floor even live — does `arcsFor` need the rendered box size passed in, or does the
  component drop Labels after the fact?
- `MIN_LABEL_ARC` (`0.04`) and `MIN_LABEL_THICKNESS` (`0.09`) have the same shape. Are they the same
  bug, or is relative right for them? They gate whether a Label is *placed* rather than how big it
  is, which may be a different question.
- Is anything actually broken today? After 05 the worst Label in any shipped state is 13.6px, so this
  may be a latent fault rather than a live one — in which case the fix is the comment, not the code.

## Notes

**Found by measurement, not by looking.** Nothing on screen is wrong right now, which is exactly why
this sat unnoticed: the threshold has never fired, so it has never been seen not firing.

Do not fix this by raising `0.019`. A larger relative threshold is still relative, and it would start
suppressing Labels on a *large* screen — where they are legible — before it suppressed any on a
small one.

Ticket 05's Answer holds the measurements. The scratch harness it used is deleted; it computed
`fontSize()` (replicated from `Wheel.svelte`, where it is component-local) over `arcsFor()` output at
known pixel radii. Rebuilding it is a few minutes' work and worth doing rather than trusting the
numbers second-hand.

**Consider whether `fontSize` should move out of `Wheel.svelte`.** Being component-local is why this
threshold and the function that fights with it live in different files and could drift apart unseen.
That is a real seam question and `codebase-design` has the vocabulary for it.

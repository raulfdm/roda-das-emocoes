# 08 — A rotating Wheel, the accessibility twin, and reduced motion

**Type:** grilling

**Blocked by:** 04

**Status:** closed — out of scope

## Question

The SVG is `aria-hidden` and carries no tab stops; every Node is reachable through the nested list in
`WheelList.svelte` instead (`Wheel.svelte:76-88`, ticket 09 of `wheel-explorer`). That decision may
make most of this ticket trivial — rotation is a purely visual affordance over a graphic that
assistive technology already cannot see, so the twin arguably needs nothing at all.

Confirm that, and then resolve what it does not cover:

- **Sighted keyboard users.** They are not served by the twin's traversal if what they want is to
  turn the Wheel. Does rotation get a keyboard control? If so, where does focus live — the SVG is
  `aria-hidden`, so it cannot simply become focusable without unpicking that decision.
- **`prefers-reduced-motion`.** Already honoured for the Focus tween, which drops to `0ms`
  (`Wheel.svelte:40`). What is the reduced-motion form of a spin — instant jumps to snap positions,
  no momentum, or no rotation offered at all?
- **Does the twin gain anything?** If Rings becomes a reader's choice, the twin may need to reflect
  it. If it doesn't, that is worth stating explicitly rather than leaving unexamined.
- **Does rotation need announcing?** Probably not — it changes nothing about what is selected — but
  the `aria-live` readout region (`+page.svelte:258`) exists and the question should be asked once
  rather than assumed away.

## Notes

The strong prior is that the twin is untouched and this ticket is short. Worth checking rather than
skipping: this is exactly the kind of decision that is cheap now and expensive after the spec is
written.

## Comments

**Closed as out of scope.** Descoped after 11 shipped. There is no rotation, so the questions this
ticket raised do not arise.

One thing it was right about survives and was honoured while landing 11: the SVG is `aria-hidden` and
the nested list twin is the whole keyboard and assistive path. The half-disc framing changes what is
*drawn*, never what is *reachable* — every one of the 130 Nodes stays available through the list,
including the ones the frame crops. The Path readout that moved out of the centre is visible text on
the page, and the cropped centre keeps the Path in its accessible name.

Reduced motion is untouched: the Focus tween already honours `prefers-reduced-motion`, and nothing
new animates.

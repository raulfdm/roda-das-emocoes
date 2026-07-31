# 04 — What drives rotation, and where the reading zone is

**Type:** prototype

**Blocked by:** 03, 11, 12

**Status:** resolved — reopened by ADR-0009

## Question

How does the reader turn the Wheel, and how do they know where to read?

This is a feel question. It cannot be specced from prose — it needs throwaway code and a thumb on
the glass.

Explore and decide:

- **What drives it.** Dragging anywhere on the Wheel? A dedicated ring or handle? Buttons? A
  keyboard shortcut? Some combination, differing by platform?
- **Free or snapped.** Does it come to rest wherever released, or settle so that a wedge sits square
  in the reading zone? If it snaps, to what — the nearest wedge centre at every ring, or just the
  ring the reader is working in? Rings disagree about where their boundaries are.
- **Momentum.** Does a flick keep spinning? A wheel of feelings that spins like a prize wheel may
  read as playful or as flippant — this is a tone decision as much as a physics one.
- **The reading zone.** Where is text most comfortable — 3 o'clock only, or the whole right half? A
  wide zone means less turning; a narrow one means an obvious place to look. Does anything mark it,
  or is it implicit?
- **Rotation and Focus together.** Changing the Focus already animates a 520ms tween. If the Wheel is
  turned and the reader then taps to descend, does rotation reset, persist, or animate to something
  new?

## Notes

HITL — the prototype exists to be reacted to, not to be shipped. Use `/prototype`.

**Ticket 02 has answered what the reference does, so start from its choices rather than a blank
page.** Desktop: 1:1 grab-and-turn, no momentum. Touch: 3×-gain flick with a 0.95-per-frame friction
flywheel. **Neither snaps** — it rests at arbitrary angles. And there is **no marker at all**: an
element census of the live SVG is `{g:1, path:131, title:131, text:131}`, so their reading zone at 3
o'clock is implicit in the layout and nothing points at it. Every one of those is a live option for
us, already priced.

Two of the questions above are now sharper:

- **Momentum is a real fork, not a detail.** They ship a 3× amplified flick with coasting. Ticket 12
  will report how that actually feels under a thumb — which is the only way to answer it.
- **"What marks the reading zone" may have the answer "nothing".** They mark nothing and it appears
  to work, because radial layout makes 3 o'clock self-evident. Consider that seriously before
  designing an indicator.

**Blocked by 11 as well.** If the Wheel is framed as a half-disc, the reading zone stops being a
region *within* the visible Wheel and becomes the visible Wheel — which changes this ticket's second
half completely.

**Blocked by 12** because momentum cannot be decided from source. Take 12 first; it costs minutes.

## Comments

**Inherits ticket 11's fifth Resolve bullet.** 11 asked "is the cropped half reachable only by
turning, or also by dragging the Wheel across?" and resolved without answering it — the static
framing landed, and neither gesture was implemented. That question is now this ticket's, since it is
the one asking what drives rotation in the first place; 06 then resolves the collision once both
gestures have a claim.

Note what 11 did *not* settle: the map's "Pan earns its place" premise still rests only on the static
offset, which is where it started. Whether pan is worth having as a *live* axis is still open, and
this ticket is where it gets answered.

11 is resolved, so this ticket is now blocked only by 03 and 12.

**Closed as out of scope.** Descoped with the rest of the live Viewport after 11 shipped. Nothing
turns the Wheel, so nothing drives rotation and there is no reading zone to mark.

This ticket had inherited 11's fifth Resolve bullet — is the cropped half reached by turning or by
panning? That question dies with it, and the honest answer is now neither: the cropped half is
reached by changing the Focus, which re-spreads the children across the full circle. That is what the
Wheel already did before any of this, and on a phone it is enough.

The map's "Pan earns its place" premise is retired with the same stroke. Pan earned its place as a
*fixed offset*, which is what shipped; it never earned it as a live axis.

**Reopened and resolved by ADR-0009.** Answers to the five questions above, as shipped:

- **What drives it:** dragging anywhere on the Wheel's box, 1:1 with the pointer. No handle, no
  buttons, no keyboard — the graphic is `aria-hidden` and the list twin is the non-pointing route.
- **Free or snapped:** free. It rests where released.
- **Momentum:** yes, at 0.93 per frame with no gain. _Decided twice._ The tone argument above was
  first taken at face value and it shipped without any — and the dead stop under the finger read as a
  fault, not as restraint. This ticket was right that it could not be specced from prose; the answer
  came from a thumb on the glass, which is what it asked for. A throw settles in about half a second over
  some 7°, which is a Wheel being set down rather than spun, and there is no 3× touch gain like the
  reference's. A pause before release discards the throw; `prefers-reduced-motion` skips the coast.
- **The reading zone:** nothing marks it, which is what ticket 02 predicted would work. On a phone the
  frame *is* the zone; on a desktop 3 o'clock is self-evident from the radial layout.
- **Rotation and Focus together:** rotation persists, unchanged. It is not part of `View` and so is
  not tweened — a descent re-spreads the children beneath whatever angle the reader chose.

**This ticket's death-note was wrong.** It closed saying the cropped half "is reached by changing the
Focus, which is what the Wheel already did." At the Cores view there is no Focus to change, and the
frame clips four of the seven Cores, so on a phone *Happy* was unreachable by pointing. That is the
hole ADR-0009 exists to close, and it was sitting in this ticket and in ADR-0008 the whole time.

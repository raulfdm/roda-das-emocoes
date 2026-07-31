# The Wheel is framed, not manipulated

> **Superseded in part by
> [ADR-0009 _The Wheel turns in its frame_](0009-the-wheel-turns-in-its-frame.md).** The Framing
> below stands entirely — the half-disc, the crop-equals-flip argument, and the rule that the frame
> follows the screen rather than the reader. What is reversed is the claim that nothing turns.
>
> The reasoning that failed is the escape hatch in the first Consequence: _"reaching the cropped half
> is done by changing the Focus."_ At the Cores view there is no Focus to change, and the frame clips
> four of the seven Cores away, so a phone reader could not reach **Happy** by pointing at all. The
> hole was in this document from the day it was written; the section below headed _"What was
> rejected, and why that matters here"_ is a record of what was believed, and 0009 says which parts
> of it survived.
>
> **Further amended by
> [ADR-0010 _The phone is framed on a fan_](0010-the-phone-is-framed-on-a-fan.md).** The phone's
> frame is no longer a half-disc, so _"The half is not an arbitrary half"_ below now describes a
> frame that has been replaced. Its argument survives in the only direction that was ever
> load-bearing — a frame that cannot show negative x can never show an upside-down Label — but the
> exact complement is gone: the fan also crops Labels that read perfectly well. What bought that is
> radius, and with it a second ring of Labels on a phone.

The Wheel is always drawn whole, as a disc of radius 1. What changes between a phone and a desktop is
not the drawing but the rectangle of the plane we choose to show — a **Framing**. A desktop is framed
on the whole disc. A phone is framed on the right half, with the Wheel's centre sitting on the box's
left edge.

That is the whole of the optical layer. It has no other axes: nothing scales, nothing pans, nothing
turns, and there is no gesture that changes any of it. The Framing is picked from the screen width
and is otherwise a constant.

**The half is not an arbitrary half.** Labels run radially outward, so a Label reads the right way up
exactly when it sits on the right of the vertical — which makes the half we crop and the half we
would otherwise have had to turn around the *same half*. The crop does the work a flip correction
used to do, and a phone needs no correction at all. A desktop keeps the whole disc and therefore
keeps the correction, so the flip survives as a property derived from the frame rather than a setting
that could disagree with it.

## What was rejected, and why that matters here

This effort was chartered to build something else: an optical layer with scale, pan and rotation, so
that a Label anywhere on the Wheel could be brought into a comfortable reading orientation. The
reference implementation it was pointed at does exactly that — a whole-poster Wheel you drag to spin,
with no drill-down at all.

It was abandoned, and the reason is the decision above rather than any difficulty in building it.
Once a phone is framed on the right half-disc, **every Label on screen is already upright by
construction**, and on a desktop the flip correction handles the rest. Nothing has to turn, because
nothing is ever upside down. The framing dissolved the problem the gestures existed to solve, and
five tickets closed without being decided.

Two pieces of evidence that made the abandonment easier to trust. The reference implementation
corrects its own Label flip against the post-rotation angle, and it works — but it *pops* as Labels
cross the vertical, which is a permanent cost of turning a wheel of radial text. And its author,
given a phone-first brief for the same taxonomy, shipped a native app that **drills down instead of
rotating**. Same person, same Wheel, and he arrived at ADR-0001's model rather than his own web one.

The reject is what gives the accept its force. A static Framing looks like an under-ambitious answer
until you notice it is the *complete* answer to the question the ambitious one was chasing.

## Consequences

Written as costs and constraints rather than as facts about the code, because ADR-0001's Consequences
section decayed precisely where it described an implementation. See its Correction.

- **A phone reader never sees the whole Wheel, and that is now permanent rather than pending.**
  ADR-0001 recorded the lost at-a-glance overview as a real cost; this decision declines to buy it
  back and closes the route that might have. Anyone reopening it is reopening ADR-0001, not this.
- **Reaching the cropped half is done by changing the Focus**, which is what the Wheel already did.
  There is no second way to move around, and adding one — a drag, a spin, a pan — would put this
  decision back on the table rather than extending it.
- **The two platforms are no longer the same picture at different depths.** They differ in what is
  drawn and in the CSS that draws it. Any change assuming one Wheel in one frame is wrong on one of
  them, and ADR-0001's claim to the contrary is corrected there.
- **The flip correction must stay derived from the frame, never configured beside it.** The whole
  argument above depends on the cropped half and the corrected half being the same half. A frame that
  could be set to crop one and correct the other would be expressible, wrong, and silent.
- **The Framing is not a reader's setting.** It follows the screen, and nothing on the page offers to
  change it. Making it choosable would mean choosing to read Labels upside down.

# The Wheel zooms; it is not rendered whole

The reference artifact is a poster with all 130 Nodes visible at once, and that is what a reader
will expect the app to look like. It cannot be, because mobile is the primary platform: 82
Tertiaries over 360° is 4.4° per wedge, which on a 360px-wide screen is **12px of arc** — below any
legible font size, with no typographic trick available. So the Wheel is a zoomable sunburst instead:
tapping a Node makes it the Focus, its children spread across the full circle, and its ancestors
compress into inner rings with the Path readable at the centre.

## Consequences

- Tap targets on mobile go from 12px of arc to 156px (Cores), 267px (Secondaries), 534px
  (Tertiaries) — roughly 20× larger, and never more than nine Labels on screen.
- Desktop opens the same component already expanded, so the poster view survives where the screen
  can carry it. The two platforms differ only in starting depth, not in code.
- The at-a-glance overview is genuinely lost on mobile. This is a real cost, but it was already lost
  the moment the Wheel didn't fit the viewport.
- Focus and Selection must stay distinct in the state model — someone passes through many Focuses on
  the way to one Selection.

## Correction

**The decision stands. Three of its four consequences do not.** Recorded here rather than rewritten
above, because the reasoning that produced them is worth reading even where the bullets are now
false.

**The title was undercut by its own second consequence, from the day it was written.** "It is not
rendered whole" is the decision; "desktop opens the same component already expanded, so the poster
view survives" grants exactly the thing the decision forbids, on the platform where the constraint
did not bite. The poster *is* the Wheel rendered whole — all 130 Nodes, all three rings.

That exception is now gone, and not because anyone set out to fix this record. The desktop draws two
rings rather than three, because three was the only state in the app with unreadable type. So
**nothing renders the Wheel whole any more, and this ADR's title is more true today than when it was
written.**

Consequence by consequence:

1. **Partly subjectless.** The tap-target arithmetic holds for Cores and Secondaries, and a phone
   still never shows more than nine Labels. But a Tertiary is no longer interactive at all
   (ADR-0006) — it has nothing beneath it, so it responds to nothing. The "534px (Tertiaries)" figure
   describes a control that does not exist.
2. **False.** The two platforms differ in more than starting depth. A desktop is framed on the whole
   disc and a phone on the right half (ADR-0008), which is a difference in what is drawn, in the CSS
   that draws it, and in where the Path is read. "Already expanded" also now means two rings, not the
   poster.
3. **Intact, and the only one that got stronger.** The at-a-glance overview is still genuinely lost
   on mobile, and there is now a measurement for what recovering it would cost: the whole disc on a
   390px phone renders Labels at 3.8–7.3px, median 6.0 — half the size of a desktop poster that was
   itself judged too small. Half-disc framing gained a phone about 1.46× in radius, which is real and
   is not enough.

   The direction of travel surprised us. The gap between the platforms narrowed, but not because a
   phone gained the overview — because the **desktop gave it up**.
4. **Fully subjectless.** Selection is deleted (ADR-0006). There is one piece of reader-facing state,
   the Focus, and nothing to keep it distinct from.

**What this suggests about ADRs, and not only this one.** The three dead bullets all recorded facts
about the implementation — pixel counts, which component holds what, the shape of the state model.
The survivor recorded what the decision *costs a reader*. That is the altitude that lasted, and
ADR-0008 is written to it deliberately.

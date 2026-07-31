# The phone is framed on a fan, and shows two phases

> **Superseded in full by [ADR-0011 _The Wheel is never cut_](0011-the-wheel-is-never-cut.md).**
> The fan shipped at 1.2, was corrected to 1.4, and was then rejected outright — not on any of the
> measurements below, which stand, but because a straight edge through the Wheel reads as a rendering
> fault however much radius it buys. The phone now shows the whole disc at 199px and one ring.
>
> What survives: the reasoning about *why* the empty column existed, the trade table, and the finding
> that two phases and an uncut Wheel are arithmetically incompatible at 398px. What is dead: the
> `FAN` framing, the two-ring phone, and the fade that tried to make the crop look deliberate.

The phone's frame stops being the right half-disc and becomes a **fan**: still anchored with the
Wheel's centre on the box's left edge, but 1.4 units tall rather than 2, so it crops top and bottom
as well as the left. And the phone stops drawing one ring below the Focus and draws two, like the
desktop — Cores with their Secondaries, then Secondaries with their Tertiaries.

The two are one decision. Neither works without the other.

## The empty column

A frame anchored at `x = 0` takes its radius from the box's **width**. The half-disc was 2 units
tall, which forced a box twice as tall as it was wide, and a box that shape has to be fitted to the
screen's *height* — so the width it ended up with had nothing to do with the width available. On a
430pt phone the Wheel sat in 226px of a 398px column and **43% of the width was empty**.

That was never a design; it was a consequence of wanting the frame to be exactly half a disc. The
map had it filed as unresolved fog — _"the right-hand space on a phone... whether that wants a larger
radius at the Cores specifically, or something in the space, or nothing at all."_ It wants a larger
radius, everywhere.

At `h: 1.4` the width term binds instead, the box fills the column, and the radius goes **226px →
323px**.

## Why one ring was right and no longer is

Ticket 05 ruled the phone keeps one ring, and it was right on the evidence it had. A second ring
under the old framing lands at **11.3px median** — worse than the 12.1px desktop three-ring state
that same ticket had just killed as the only unreadable view in the app. There was no argument to be
had.

What changed is the radius, not the tolerance. Measured in Portuguese on a 398px column:

| Cores + Secondaries | labels | median |
| --- | --- | --- |
| half-disc, r=226 | 23 | 11.3px |
| fan, r=323 | 14 | **16.2px** |

The desktop's two-ring view is 19.8px median on the same measurement. Focused on a Core, the
Secondaries and Tertiaries come in at 13.4px median. A Tertiary read on its own arrives at 33.9px.

The journey is now two taps rather than three: Cores+Secondaries → tap a Core → Secondaries+
Tertiaries → read the word.

**`1.4` is a chosen point on a straight trade, not a knee in a curve.** Measured in a real browser
at a real phone size, every step down buys type and costs Labels, monotonically: 2.0 → 23 Labels at
11.3px, 1.6 → 17 at 15.9px, 1.4 → 14 at 16.2px, 1.2 → 12 at 18.9px.

**1.2 shipped first and was wrong in the hand.** Twelve Labels over 48 wedges leaves broad areas of
flat colour with no word in them, and that reads as text failing to render rather than as a Wheel
continuing off the page — it was reported exactly that way. The numbers had said 1.2 was the better
buy; looking at it said otherwise, because "Labels drawn" does not measure how much bare colour is
left behind. 1.4 gives two Labels back and 15° of window for 2.7px of type.

## What this costs

**The window.** The rim is on screen across about **89°** rather than 180°. Well under half the Wheel
is in front of you, and 4 of the 7 Cores are off-frame at rest rather than 4 of 7 being off-frame in
the old half-disc — which sounds the same and is, because the reachability was already the problem
ADR-0009 solved. All 7 Cores come round under a turn, which is checked.

This is only payable because the Wheel turns. Under a static frame an 89° window would be a cage;
under a turning one it is where you happen to be looking. **ADR-0009 is a hard dependency of this
decision, not a neighbour of it** — anyone removing the turn has to put the half-disc back.

**ADR-0008's exactness is gone, and the guarantee is not.** The half-disc's whole elegance was that
the set of cropped Labels and the set of upside-down Labels were *the same set*: the frame did not
solve the flip, it deleted it. The fan is a window strictly inside that half, so the implication that
matters still holds absolutely — nothing at negative x can be shown, so nothing upside down can be —
but the converse is now deliberately false. The fan crops plenty of Labels that read perfectly well.

That is a real loss of argument, and the test suite was changed to say so rather than to keep
passing: the equality became an implication, and a second test asserts the converse has genuinely
gone, so nobody can quietly grow the frame back into a half-disc and take the radius with it.

**`slices` needed a second axis.** While the frame stood a full radius above and below the centre,
nothing could leave it vertically and only the x edges could cut a Label. The fan crops top and
bottom, and the Labels nearest 12 and 6 o'clock stand straight up into those edges. It also needed
the Label's real shape — a word is many times longer than it is tall, so a single font-size figure
could not answer for both axes.

## Consequences

- **`rings` has no screen-size term at all any more**, and stops being derived. Both platforms show
  two phases. `ringsBelow` still clamps to what the tree has left.
- **`HALF` is renamed `FAN`.** It is not a half of anything, and a constant named for a shape it no
  longer has is exactly the drift this repo's comments exist to prevent.
- **The frame's aspect lives in two places that must agree** — `FAN.h` and the `--frame` custom
  property that shapes the box. A box of a different aspect letterboxes the frame and paints a strip
  of the crop back into view, which is the one thing the framing exists to prevent.
- **A short or landscape phone is still fitted to its height.** The width term binds on a phone of
  ordinary proportions; the height term stays as the guard, and there being no breakpoint between
  them is the point.
- **ADR-0001's "12px of arc" is now comfortably wrong in our favour** on the phone, which is the
  second time this effort has strengthened it rather than overturned it.

## The bare wedges, and why the fix is a fade

Shrinking the frame does not stop wedges outrunning their Labels; it only changes how many. A wedge
occupies a radial band, so its inner part stays on screen long after its Label's anchor — out at the
ring's mid-radius — has left the frame. At the Cores view, 34 of the 36 Labels not drawn are not
being *culled* at all: their anchors are simply outside the fan. No tuning of the crop rule reaches
them, which is why relaxing that rule from "clipped at all" to "a quarter missing" changed the count
by two and the picture by nothing.

What is left is bare colour, and bare colour beside crisp type reads as text that failed to render.
So the wedges fade out over the top and bottom eighth of the frame — the Wheel receding past the
page, rather than being guillotined by it.

**The fade is on the wedges only, never on the Labels**, and that was learnt by trying the other
thing. Fading the whole graphic dims exactly the Labels nearest an edge, which are exactly the ones
the crop rule had just judged readable — so a word arrived on screen as a ghost, overruled halfway by
a gradient. Whether a Label is shown is a decision with a rule behind it. Colour may fade; type is
drawn at full strength or not at all.

## A phone page that ends where it looks like it ends

`min-h-screen` is `100vh`, and on iOS Safari `100vh` is the viewport with the toolbars *hidden*. A
page that fits perfectly therefore still scrolls by the height of the toolbars in front of you —
measured here at about 144px of blank below the footer, which `mt-auto` then pins to the bottom of.
`min-h-dvh` tracks the viewport actually on screen. The remaining scroll is real content: the list
twin and the credit.

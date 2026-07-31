# The Wheel turns in its frame

The Wheel can be turned. Dragging it rotates it about its centre, 1:1 with the pointer; letting go
mid-movement throws it, and it coasts to rest under friction rather than stopping dead. It never
snaps to a wedge. The turn persists until the reader changes it — descending, ascending and searching
all carry it through unaltered.

The Framing is untouched. A desktop still shows the whole disc and a phone still shows the right
half-disc, and neither is a reader's setting. What changes is that the Wheel can now be turned
*inside* that frame.

This reverses ADR-0008's central consequence — _"adding one — a drag, a spin, a pan — would put this
decision back on the table rather than extending it"_ — and it is being reversed on the table's own
terms, because the argument that closed it had a hole in it.

## What ADR-0008 got wrong

ADR-0008 argued that the half-disc framing dissolved the problem rotation existed to solve: every
Label a phone can see is upright by construction, so nothing has to turn. That part is true and
survives intact.

The hole is in the escape hatch. ADR-0008 says **"reaching the cropped half is done by changing the
Focus, which is what the Wheel already did."** At the Cores view there is no Focus to change. A
phone at rest draws seven wedges and the frame clips four of them away entirely — *Sad*, *Happy*,
*Surprised* and *Bad* all sit at negative x. You cannot tap what is not on screen, so on a phone,
opening the app and reaching for **Happy** was impossible by pointing. The only routes were the
search box and the `<details>` list twin.

So the cropped half was never reachable by changing the Focus. It was reachable from every view
except the one every reader starts in. Turning is what closes that, and measured across a full turn
all seven Cores come into the frame.

The ADR-0008 reasoning that stands, and that this decision is careful not to spend:

- **The crop and the flip are the same half.** Radial Labels read upright exactly at positive x, so a
  frame that crops negative x needs no correction. This survives rotation — see the invariant below.
- **The Framing follows the screen and is not offered to the reader.** Unchanged.
- **A phone reader never sees the whole Wheel at once.** Still true; turning brings the rest round one
  region at a time, which is not the same as the at-a-glance overview ADR-0001 mourned.

## Where rotation lives

Ticket 03 posed this as a fork with no good branch: a tweened field on `View`, honest but re-deriving
every arc on every frame, or a transform above the geometry, cheap but leaving the flip computed
against the unrotated angle and therefore upside down as soon as you turn.

It is a false fork. A rotation is **rigid** — it moves every wedge without changing any wedge's
shape — so no path data depends on it. What does depend on it is which half of the plane a Label has
landed in, and where the frame's edges fall relative to it. Both are already computed inside
`arcsFor`, which had cut exactly this seam for `framing`.

So rotation is a parameter of `arcsFor` alongside `framing`, and the component applies it as one
transform on one `<g>`. Measured over 120 frames of a brisk drag on the desktop poster: **zero path
`d` attributes change**, 0.16 label transforms change per frame, and `arcsFor` costs 0.056 ms — 0.3%
of a 60fps budget. Turning the Wheel writes one attribute and re-tessellates nothing.

Rotation is deliberately **not** a field on `View`. `View` is the tweened thing, and rotation has
nothing to tween towards: a drag is 1:1, and a Focus change carries the angle through rather than
settling somewhere new.

**The invariant that had to be guarded.** The flip decision is invisible when wrong. An unrotated
Wheel agrees with a rotated one, so computing it against the unrotated mid-angle looks correct at
rest, passes review, and only breaks for the Labels that have crossed vertical mid-drag.
`geometry.test.ts` asserts it against the drawn output at ten rotations including several past a full
turn, under both framings — and the rigidity above is asserted too, because folding rotation into the
arc angles is a performance cliff wearing a correct picture.

## What was accepted as a cost

**The flip pops.** Ticket 02 measured this on the reference implementation and ADR-0008 recorded it
as a permanent cost of turning a wheel of radial text: a Label crossing vertical snaps 180°. It is
real and it is not mitigated here. Two things make it tolerable rather than merely tolerated — it is
desktop-only, since the cropped framing has no Labels on the flipping side at all, and it is rarer
than it sounds: 0.16 Labels per frame, roughly one every six frames of a drag.

Snapping was chosen over animating or deferring. Animating a 180° turn means a Label spinning through
its own upside-down state, which is worse than arriving there instantly; deferring until the drag ends
means reading upside-down Labels for the length of the drag, which is what the correction exists to
prevent.

**A phone cannot scroll by dragging on the Wheel.** A turn is angular and has no axis to concede, so
`touch-action: none` is the honest declaration. Scoped to the Wheel's own box: under the cropped
framing the Wheel is about two thirds of the column's width, so there is bare page beside it, plus
the header above and the list below.

**The Wheel's own text is no longer selectable.** A drag would otherwise sweep a selection through
every Label it crossed. ADR-0006 left _"select the word on screen like any other text"_ as the app's
only export route, and this would have closed it — except that the Reading readout above the Wheel is
ordinary HTML and stays selectable. The route survives and improves: real text at a real size,
instead of a Label at 0.02 user units. Suppression is unconditional rather than applied while
turning, because a selection begins on the first pointer move, before the gesture has travelled far
enough to be recognised as a turn.

**It coasts, and no longer snaps to a halt.** This was decided twice. Ticket 04 called momentum "a
tone decision as much as a physics one" and guessed a Wheel that spins like a prize wheel would read
as flippant, so it shipped without any — and the dead stop under the finger read as a fault rather
than as restraint. The ticket had said all along that this could not be settled from prose, and it
was not: it was settled by turning the thing.

The tone worry is answered by the numbers instead of by refusing. A throw keeps 93% of its speed per
frame, which settles a brisk one in about half a second over some 7° — a Wheel being set down, not one
being spun. There is **no gain**: the reference amplifies a touch flick 3× (ticket 02) and this does
not, because the gesture exists to bring the far side round to be read. It still never snaps to a
wedge; it rests where it stops.

Two things a naive flywheel gets wrong are handled: a pause of more than 80ms before release discards
the throw, so placing the Wheel deliberately does not fling it, and `prefers-reduced-motion` skips
coasting entirely — a coast is motion the app continues on its own, which is precisely what that
preference is about.

## The Tertiary is read, not chosen

Tapping a Tertiary used to do nothing at all. ADR-0006 made it inert on the grounds that it is the
answer and you read it — but the wedge is drawn identically to a wedge that opens, so the app taught
a reader to tap and then declined to respond. That reads as broken, and it was reported as broken.

A Tertiary now responds by bringing itself up to be read, and **reading one is where the descent
ends, so the Wheel settles into it** rather than staying live:

- **Its siblings dim rather than disappear.** Hiding them was tried first and takes too much with it:
  `Sobrecarregado` means what it means partly by not being `Ansiedade`, so the alternative is worth
  keeping on screen, and keeping it there keeps it tappable, which is how you change your mind. Only
  siblings dim — never ancestors, which are the Path.
- **The word moves below the Wheel and gets large**, with its Path in small type beneath it. At this
  point the word *is* the page: the Wheel above has narrowed to the single wedge that names it, and
  everything else on screen is a way back. An outline on the chosen wedge was tried and dropped: a
  hard black line reads as a control rather than as an answer, and it fights the palette, which is the
  only thing on the Wheel carrying which Core you are in. Taking strength away from the others says it
  without adding anything.
- **The Wheel stops turning.** Every gesture it has is a way of getting somewhere, and there is
  nowhere left to go; a Wheel that still spins under a word you have just landed on reads as
  unfinished. The gesture goes back to the browser, and page scroll and pull-to-refresh come with it.

**Turning is also withdrawn one level earlier, at a Secondary.** A Secondary has exactly two
Tertiaries, so they take a half-circle each and are both wholly on screen the moment you arrive.
Turning could only rotate an answer you can already read. The hint that advertises the gesture is
gated on the same condition, so it never offers something that will not happen.

**Arriving there squares the Wheel up**, because the two Tertiaries only sit straight at a multiple
of a half-turn — descend from 135° and they arrive skewed, with no way left to straighten them. The
snap goes to the *nearest* half-turn, so the Wheel moves at most 90° and the reader keeps roughly the
orientation they chose; which of the two ends up on the left is not something anyone has an opinion
about. It is applied in one step rather than eased, because it lands on the same frame the Focus
change starts its 520ms zoom and there is already more movement on screen than the eye can follow.

**A settled Wheel still swallows drags.** Handing `touch-action` back was tried and is the `pan-y`
mistake again: with only ~80px of real page below the fold, a downward drag across a Wheel this size
spends itself rubber-banding into a screenful of blank. Whether the Wheel *turns* changes with depth;
whether it *scrolls the page* does not, and the answer is never.

**This is not Selection returning**, and the distinction is the whole of why it is allowed. There is
no highlight on the Wheel, nothing to clear, nothing to copy, and nothing that outlives the next
move — descending, ascending or going back to the Cores all drop it. ADR-0006 deleted Selection
because the payoff it was in service of, _"the word, its Path, a copy button"_, was not wanted. None
of that comes back. What comes back is the tap, which was collateral.

`CONTEXT.md` gains **Reading** for it. The word is chosen to be far from the retired one: a Reading
is something you do to a Node, not a state the Node is in.

## Consequences

- **Rotation is not addressable and not stored.** It dies with the visit, like the Focus (ADR-0005)
  and unlike the Locale. An angle is a posture, not a preference.
- **The turn is not reachable by keyboard, and does not need to be.** The graphic is `aria-hidden`
  and the list twin carries every Node — including the four Cores the frame clips, which is why the
  twin was never the fallback the reachability hole made it look like. Rotation changes what is
  comfortable to look at, never what is reachable; ticket 08's point survives its own ticket.
- **The turn hint is load-bearing on a phone, and retires itself.** With four Cores off-frame at
  rest, a reader who does not know the Wheel turns is stuck with three. `words.turnHint` shows until
  the Wheel has been turned once and then never again.
- **Every wedge is interactive now**, so the pointer cursor no longer distinguishes them. The hover
  does: opening lifts the wedge, reading only acknowledges the tap.
- **A Tertiary is a button in the list twin**, not a paragraph. ADR-0006's reasoning was that a
  control which does nothing is worse than text; it does something now.
- **Tap and drag have to be told apart.** A drag that ends over a wedge still raises a click, so a
  gesture that passes 6px stops counting as a tap. Measured in pixels, not radians: the same movement
  sweeps a large angle near the hub and a tiny one at the rim.
- **A coasting Wheel is caught, not tapped.** A pointer that lands on a Wheel still under momentum is
  reaching for the spin, so that gesture opens nothing even if it never moves.
- **`View` is still the whole of what is tweened**, and rotation is deliberately outside it. Anyone
  adding a fourth axis should ask which of the two it is — tweened state, or a rigid parameter that
  only the Labels notice.

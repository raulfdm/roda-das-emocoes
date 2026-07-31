# 11 — Does the Wheel sit whole in its box, or offset to show a half-disc?

**Type:** prototype

**Blocked by:** —

**Status:** resolved

## Question

Surfaced by ticket 02, and it sits upstream of three tickets that were charted without it.

`feelingswheel.app` on mobile never corrects a Label's orientation at all. Instead it offsets the
Wheel so its **centre lands on the viewport's left edge** — measured at `x = -350, width = 700` on a
390px viewport — so the visible region is exactly the right half-disc. Under radial-outward layout,
"upright" is exactly the right half-disc and "upside-down" is exactly the left. **The two are exact
complements**: every Label you can see reads correctly, every Label that doesn't is off-screen. Zero
flips, zero correction code.

Decide whether our Wheel does the same, and there are two independent reasons it might.

**It dissolves ticket 03.** If the left half is never on screen, no Label ever needs flipping, and
the flip-pop that 02 measured on their desktop build cannot happen. The whole
correct-the-flip-under-rotation problem stops existing rather than being solved.

**It attacks ADR-0001's arithmetic head-on.** ADR-0001 rules out the whole Wheel on a phone because
"82 Tertiaries over 360° is 4.4° per wedge, which on a 360px-wide screen is 12px of arc". But a
half-disc framed at the viewport edge fits a Wheel of **twice the diameter** in the same width — 780px
of Wheel in 390px of viewport. That doubles arc length per wedge: **12px becomes ~24px.** Whether
that is enough to make `rings: 3` legible on a phone is exactly what ticket 05 is trying to answer,
and it cannot answer it without knowing this.

Resolve:

- Whole disc, half-disc, or a reader's choice between them?
- If half-disc: which half? They chose the right, which follows from radial-outward text. Does that
  survive our Locales — Portuguese and Spanish Labels run longer than English ones.
- Does the half-disc framing hold on desktop too, or is it a phone-only layout? Their answer is
  phone-only; desktop gets the whole disc and pays for it with the flip correction.
- What happens to the centre readout, which is an HTML overlay at `inset: 35%` and assumes a centred
  Wheel?
- Is the cropped half reachable only by turning, or also by dragging the Wheel across? This is the
  pan axis, and it is the first strong argument that pan is worth having at all.

## Notes

HITL. Use `/prototype` — this is a "how should it look" question and the arithmetic alone will not
settle it. Build the half-disc framing at `rings: 3` on a phone viewport and see whether ~24px of arc
is genuinely readable or merely twice as illegible.

**Blocks 03, 04 and 05.** It was not in the original charting because the charting assumed the Wheel
stays centred in a square box, which is what our code does today (`aspect-ratio: 1`, `viewBox="-1 -1
2 2"`). Nothing forces that.

This is in scope: a fixed framing offset is the pan axis of the Viewport, applied statically.

## Comments

**Prototype built, awaiting the hands-on look.** Four framings live on the real `/` route behind
`?variant=A|B|C|D` in dev, under `src/lib/wheel/prototype/` — see that directory's `README.md` for
what each one is and how to run it. Throwaway: it is a lazily-imported dev-only branch off
`+page.svelte`, and it deletes as one directory plus one `{#if}` block. It must not reach `main`.

- `A` whole disc (the control), `B` right half-disc fitted to the stage height, `C` right half-disc
  bled to the stage width — exactly twice `A`'s diameter, which is ADR-0001's "12px becomes 24px"
  taken at its word — and `D` a continuous slider between whole and half.
- All four run at forced `rings: 3` on one shared stage, with the ring count switchable from the
  prototype bar, so the readability question can be looked at rather than argued about.
- `B` and `C` each offer **turn** and **pan** as separate drag modes, because the last Resolve
  bullet asks which of the two the cropped half wants and the map's "Pan earns its place" premise
  rests on the answer. The prototype picks neither — the gesture conflict is ticket 06, which is
  blocked on this ticket.
- `C` is deliberately uncapped on wide screens, so the "does it hold on desktop?" bullet has
  something to look at rather than a phone-sized layout stranded in a desktop column.

Two things fell out while building that are worth knowing before the verdict:

1. **`D` cannot drop the Label flip until the very end of its travel.** The crop does not reach 6
   o'clock until the framing is fully half-disc, so at any middle setting there are still flipped
   Labels on screen and the correction is still load-bearing. Whatever a reader's-choice framing
   buys, it does not buy its way out of ticket 03.
2. **`B` and `C` converge as the stage gets taller.** `B` takes its radius from the stage's height
   and `C` from its width, so on a tall enough phone the fitted and bled half-discs nearly coincide,
   and the "how much do we crop?" question turns out to be a question about the aspect of the box
   the Wheel is given, not about the framing rule. Resizing the window is part of the test.

Not resolved: this is HITL by design. Ticket 11 stays `claimed` until someone has looked at all four
on real hardware and said which one the Wheel gets.

## Answer

**`B` — the fitted right half-disc, on phones only. The desktop keeps the whole disc.**

Landed, not just decided: the prototype is deleted and the framing is in the real component.

**Whole, half, or a reader's choice?** Half, and not a reader's choice. `D` was ruled out by its own
finding above — a middle setting still shows flipped Labels, so it buys the cost of a control without
buying the thing the control was for. `C` was rejected as too expensive: bleeding to the stage width
crops roughly three quarters of the Wheel to buy the remaining arc.

**Correction to this ticket's arithmetic, and it matters for 05.** The Question above reasons with
"780px of Wheel in 390px of viewport — **12px becomes ~24px**". That is `C`'s figure, and `C` is not
what was chosen. `B` takes its radius from the box's *height*, so the gain is the column's
height-to-width ratio, not a flat 2x. Measured on the 390x844 viewport this was decided on: the Wheel's
radius goes **179px to 262px, about 1.46x**, so ADR-0001's 12px of arc becomes roughly **17px, not
24px**. The cap makes it worse, not better — the box is `min(62dvh, 34rem)` tall, so on any phone the
ratio tops out near 1.5x and never approaches 2x.

**Ticket 05 should plan against ~17px.** That is still a real improvement on 12px and it is the
honest number; do not carry the 24px figure forward.

**Which half?** The right, and it is forced rather than chosen — Labels run radially outward, so the
right half is by construction the half that reads the right way up. It survives the longer Portuguese
and Spanish Labels: nothing about the crop interacts with word length, because the crop is angular
and the Labels run radially. Checked at `Feliz` in Spanish, which is the widest branch in the longest
Locale.

**Does it hold on desktop?** No — this is the one place the answer went against the reference's
elegance. A wide screen has room for the whole poster, and the poster is worth more than the flip
correction costs. So the flip is **not** deleted; it becomes a real parameter, derived from the frame
rather than configured beside it (`flips()` in `framing.ts` is `framing.x < 0`). That keeps the two
from drifting: there is no way to express a frame that crops the unreadable half and then corrects it
anyway, or one that shows it and forgets to.

**Consequence for ticket 03: it is narrowed, not dissolved.** The flip-pop that ticket 02 measured
can still happen, but only on a desktop showing the whole disc. Ticket 03 should be re-read with that
scope.

**The centre readout.** The frame puts the Wheel's centre on the box's left edge, so the readout is
cropped to a half-circle — a `D` about one Label wide. It keeps the one job it can still do (the way
back up, with the Path still in its accessible name) and the visible Path moves to the page, above
the Wheel, where it reads at the full width of the column. Widening the box to fit the whole hole was
considered and rejected: it breaks the complement. A Label at 185° and radius 0.95 sits at
`x = -0.074`, well inside a box widened to `x = -0.3`, so upside-down Labels come straight back.
**The complement is exact only at `x >= 0`**, and that is the whole reason the framing is worth
having.

**Is the cropped half reached by turning or by panning?** **Neither, and the question is now closed.**

It was handed to ticket 04 when this ticket resolved. The effort was then descoped and 04 closed as
out of scope along with the rest of the live optical layer, so the answer is the one that was true
all along and did not need a gesture: the cropped half is reached by **changing the Focus**, which
re-spreads the children across the full circle. That is what the Wheel already did before any of
this, and on a phone it is enough.

The map's "Pan earns its place" premise ends here too. Pan earned its place as a fixed offset — which
is what shipped — and never as a live axis.

### Where the slack goes, and why the frame is pinned to the screen's edge

A fitted half-disc cannot fill a phone. The box is 1:2 and its height is capped, so on a 414x896 XR
it comes out 272px wide in a 414px screen and **142px has to go somewhere**. That is not a styling
slip; it is what "fitted" means at that width, and the only ways out are to crop more (variant `C`'s
cost arriving late, hiding children of the Focus) or to grow the Wheel taller and push the controls
below the fold. Both were looked at on the XR and both were rejected.

So the slack goes to the **right**, and the Wheel's centre is pinned to the **screen's** left edge —
not the column's. Centred in the column, the disc's flat side lands mid-page with a gutter either
side and reads as a drawing that failed to finish. Against the screen's edge it reads as what it is:
a Wheel larger than the screen, continuing past it. The page hands the component its own gutter
through `--page-gutter` so the frame can reach past the page's padding.

Worth carrying to 05: the arc gain is bounded by this too. Filling a 414px screen with an uncropped
half-disc would need 828px of height, so no amount of layout work gets `B` past roughly 1.5x.

### Two things the implementation found

1. **A half-disc box must be sized in the axis CSS honours.** Asking for a height and letting
   `width: auto` follow the aspect ratio silently gives back a *full-width* box with the Wheel
   letterboxed inside it — and a letterboxed half-disc leaks a strip of the cropped half back into
   view, which is precisely what the framing exists to prevent. The box is driven from the width now,
   at half the height it is fitting to.
2. **The complement governs orientation, not ink.** It is exact about which *way* a Label faces and
   says nothing about how wide the glyphs are. Labels run radially, so the Labels nearest 6 and 12
   o'clock lie *along* the frame's edge and the crop halves every glyph — visible, upright and
   unreadable. Both belong to wedges the frame has already halved, so they are left off; descending
   into the wedge is how you get the word. That rule lives in the component, because only the
   rendered font size knows how wide the ink is.

### What was tested, and what was not

One test, `framing.test.ts`, asserting the complement over all 131 Focuses at each of 3 ring counts:
every Label the frame crops is exactly every Label the flip would have turned around, in both
directions, plus a guard that the whole disc still *does* flip so the assertion cannot pass vacuously.
That is the class of claim the eye cannot check. Everything else here — the shape, the `D`, the
readout — was checked by looking at it on a 390×844 viewport in Portuguese and Spanish.

**Rings were deliberately not touched.** `wide.current ? 3 : 1` still stands. The arc this framing
buys is the evidence ticket 05 needs, not a licence to spend it.

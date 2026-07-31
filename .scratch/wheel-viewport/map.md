# Map — The Wheel gains a Framing

Label: `wayfinder:map`

## Destination

**Descoped after ticket 11 shipped.** This map set out to give the Wheel a **Viewport** — an optical
layer with scale, pan and rotation above the existing Focus navigation. It gets a **Framing**
instead: a static rectangle of the Wheel's plane, chosen by screen size, with no live axes at all.

The reason is that 11 answered the original ask on its own. Any Label can now be brought into a
comfortable reading orientation without moving your head, because on a phone every Label on screen
is already upright by construction, and on a desktop the flip correction handles it. Nothing has to
turn. The gesture work that the rest of the map was charting existed to serve a problem that the
framing dissolved.

What is left is the tidying: name what shipped, settle whether Rings is a reader's control, decide
what the URL carries, deal with ADR-0001, and write it up.

Reached when `.scratch/wheel-viewport/spec.md` records the Framing that shipped, and the ADRs record
what was decided — including ADR-0001's fate.

## Notes

**Domain:** the Wheel, its Nodes, Focus and Selection are defined in `CONTEXT.md`. Read it before
naming anything new; this effort adds terms to it. ADR-0001 through 0004 are in `docs/adr/`.

**Skills every session should consult:** `/grilling` and `/domain-modeling` by default. The
prototype and research tickets are all closed or resolved; what is left is deciding and writing up.

**This map plans — it does not build.** Prototypes are throwaway, made to decide with and then
discarded. Implementation is a separate pass after the spec exists.

> **Tickets 11 and 05 were explicit, knowing exceptions.** Asked what to implement with no spec in
> place, the decision was to land the chosen framing for real rather than only record it. So
> half-disc framing is in the production component while `spec.md` still does not exist, and ticket
> 10 will be writing up something already shipped in two respects.
>
> **05 took the exception a second time**, changing the desktop ring count from three to two. The
> case for it: one line, one view — `ringsBelow` already clamped every focused state, so nothing but
> the un-focused Cores view moved — and it was fully measured before it was made. The case against,
> which should be weighed if a third is ever proposed: a premise bent whenever the change looks small
> is not a premise. Two is where it stands.
>
> This still governs everything else: no other ticket builds.

### Settled while charting

These are premises, not tickets. A ticket that contradicts one of them is wrong.

- **Three orthogonal axes.** _Focus_ (which Node fills the circle — exists), _Rings_ (how many levels
  are drawn outward — currently hard-wired to `wide.current ? 3 : 1`), and _Framing_ (which rectangle
  of the plane is on screen — shipped in ticket 11). Framing is added alongside Focus, never in place
  of it: Focus is load-bearing for the share URL, `descendsInto()`'s descend-vs-settle rule and the
  accessibility twin. _Superseded in part:_ the third axis was chartered as a **Viewport** with
  scale, pan and rotation. Only the static offset shipped, and the rest is now out of scope.
- **Counter-rotating Labels upright is dead.** At 12 o'clock a desktop Tertiary wedge gives upright
  text only 0.068 units of horizontal room against the 0.233 it has at 3 o'clock — a 10-character
  Label lands at font size 0.011 against a `MIN_FONT_SIZE` of 0.019. No font size fixes it.
- **"Readable" means a readable region, on demand** — the paper gesture. Not all 82 Labels legible at
  rest.
- **Desktop drove the original ask** (you cannot turn a monitor), but **mobile is in scope** because
  of the Rings question.
- **Pan earns its place — as a fixed offset, and only that.** Charting nearly dropped it as an axis
  nobody asked for. Ticket 02 found that a *fixed* pan offset — framing the Wheel as a half-disc — is
  the cheapest known answer to the Label-flip problem. That is what shipped, and it is where pan's
  claim ends: it never earned its place as a live axis, and 04 closed without granting it one.
  _Corrected:_ this premise said the offset "doubles the arc available per wedge". A fitted half-disc
  gains about 1.5x, not 2x. See ticket 11's Answer.

## Decisions so far

<!-- one line per resolved ticket: enough to judge relevance, then open the ticket for the detail -->

- [02 — What does feelingswheel.app actually do?](issues/02-what-feelingswheel-app-does.md) — all 130
  Nodes always, no re-rooting; 1:1 drag on desktop and a 3×-gain flick with friction on touch;
  **no snap, no marker of any kind**; zoom only as a `0.5×–1.5×` slider on a separate page, absolute
  rather than focal. Their desktop corrects the Label flip against the post-rotation angle and it
  works — but **pops** as Labels cross vertical. Their mobile doesn't correct at all: it **frames the
  Wheel as a right half-disc**, where upright text and the visible region are exact complements.
  Full findings in [`research/feelingswheel-app.md`](research/feelingswheel-app.md).
- [11 — Does the Wheel sit whole in its box, or offset to show a half-disc?](issues/11-half-disc-framing.md)
  — **half-disc on phones, whole disc on desktop.** The right half is forced by radial Labels, not
  chosen, and it survives the longer PT/ES Labels. Desktop keeps the poster and therefore keeps the
  flip, so the flip becomes a real parameter derived from the frame (`flips(framing)` is
  `framing.x < 0`) rather than being deleted — **ticket 03 is narrowed to the desktop case, not
  dissolved**. The cropped centre keeps the way back up; the Path moves to the page above the Wheel.
  Widening the box to fit the whole hole was rejected: the complement is exact only at `x >= 0`.
  Turning vs panning to reach the crop is untouched and stays with 06. Landed in the real component;
  the prototype is deleted. Rings deliberately unchanged — that arc is 05's evidence, not its answer.
- [01 — Name what shipped, and name what Rings becomes](issues/01-name-the-viewport.md) — **no new
  terms; `CONTEXT.md` gains nothing.** There is no layer above Framing: the candidate was the pair
  {Rings, Framing}, which is one breakpoint today and splits the moment 05 hands Rings to a reader,
  and "viewport" already means the browser's viewport in four files. `Rings` stays implementation
  vocabulary — "ring 1/2/3" is on three existing `_Avoid_` lists, so promoting it would contradict
  them, and a non-colliding word would need the code renamed to match. **01's premise was wrong:**
  05 states its own question in plain nouns already, so 01 resolves by lifting the block rather than
  satisfying it. If 05 rules for a reader's control, the naming is 05's output. 09 loses the "does
  the Wheel have a Viewport at all" ADR candidate.
- [05 — Does a reader control how many rings are drawn?](issues/05-zoom-and-rings-one-control-or-two.md)
  — **no control; the desktop default was the bug.** `wide.current ? 3 : 1` → `? 2 : 1`, shipped.
  Measured: three rings at the Cores drew Labels at 7.8–15px (median 12.1), the only unreadable state
  in the app; two draws 48 Nodes at 13.6–22.5px (median 20.4) and every Focus view is byte-identical,
  because `ringsBelow` already clamped them. The phone keeps one ring — three under the half-disc is
  8.8px median for Tertiaries nobody can tap, and the *whole* disc on a phone is 6.0px median, which
  **confirms ADR-0001 rather than overturning it**. Wrapping long Labels was ruled out (two lines is
  7.35px against one line's 7.8px — the arc binds once you wrap). `MIN_FONT_SIZE` was found to be
  unitless and therefore never to fire; handed to ticket 13. So this effort does **not** give back
  the at-a-glance overview ADR-0001 mourned — 09's headline consequence stands.
- [09 — ADR-0001: amended, superseded, or untouched?](issues/09-adr-0001-fate.md) — **amended in
  place**, ADR-0003 style: decision untouched, `## Correction` added. Superseding would have been
  wrong — the decision was vindicated, not reversed. The finding that shaped it: ADR-0001 undercut
  its own title from the day it was written, because the desktop poster it granted in consequence 2
  *is* the Wheel rendered whole — and 05's two-ring change removed that exception on typographic
  grounds, so the title is truer now than then. Of the four consequences, 3 survives and is
  strengthened, 2 is false, 1 is partly subjectless and 4 fully. **One new ADR, not three:**
  [ADR-0008 _The Wheel is framed, not manipulated_](../../docs/adr/0008-the-wheel-is-framed-not-manipulated.md),
  covering the half-disc that shipped and the optical layer that was abandoned — one record, because
  the reject is what gives the accept its force. Two-rings is recorded in the Correction rather than
  given its own ADR. Carried forward: the three dead consequences all described the implementation,
  the survivor described what the decision costs a reader, so ADR-0008's Consequences are written at
  that altitude on purpose.

## Not yet specified

<!-- in-scope fog: real, but not sharp enough to ticket. Graduates as the frontier advances. -->

Most of what stood here was fog about a live Viewport — desktop's default zoom state, performance
under gesture, whether the centre readout and the Selection highlight survive rotation. All of it
cleared when the gesture work was descoped: there is no zoom state, no gesture to be slow, and
nothing turns. The centre readout's placement, the one part that was real, was settled by 11 — the
overlay is positioned off the frame arithmetically, so it lands on the Wheel's centre wherever the
framing puts it.

What is genuinely still unsharp:

- ~~**The right-hand space on a phone.**~~ _Cleared, then re-answered_ (ADR-0010, then ADR-0011).
  The space wanted the **whole Wheel**, not a larger radius. Three framings were tried before that
  landed: half-disc, fan at 1.2, fan at 1.4. Every one of them spent visible Wheel on radius, and
  every one read as a Wheel that had failed to draw. The whole disc at 199px shows all seven Cores
  at 24.8px and fits the page on one screen with no scrolling. The phone keeps one ring, so ticket
  05's ruling stands untouched after all. The paragraph below records the reasoning that was
  superseded.

- ~~**The right-hand space on a phone** (first answer, superseded).~~ The empty column was not a layout choice but a consequence of the frame being exactly
  2 units tall: that forces a box twice as tall as it is wide, which has to be fitted to the screen's
  height, so the width it lands on has nothing to do with the width available. Shortening the frame
  to 1.2 lets the width bind instead — 226px → 380px of a 398px column. The radius is what the space
  was worth, and it bought the thing ticket 05 had to refuse: **a second ring of Labels on a phone**,
  at 19.1px median against the old 11.3px. So 05's ruling is reversed for the phone, on a measurement
  05 could not have made, and its desktop reasoning is untouched.
- ~~**Whether Framing survives 05.**~~ _Cleared._ It survives untouched. A phone is framed on the
  half-disc, and no ring count shows the whole Wheel there; a return to `WHOLE` puts Labels at 6.0px
  median, so the reader can have the whole Wheel or legible Labels and Rings is not the lever between
  them. 05 changed the desktop's ring count and left both framings alone.
- **The shape of the spec itself.** Smaller than it was again — 10 is now writing up one shipped
  decision plus whatever 01, 05 and 09 settle, not a feature that does not exist. 07 is gone (below).

## Out of scope

Work ruled beyond this destination. Closed; never graduates.

### Descoped after ticket 11 — and partly reopened

> **03, 04 and 06 are back, resolved, and shipped (ADR-0009).** The descope rested on a claim that
> was false when it was written: that the cropped half is reached by changing the Focus. At the Cores
> view there is no Focus to change, and the frame clips four of the seven Cores — *Sad*, *Happy*,
> *Surprised*, *Bad* — so on a phone **Happy was unreachable by pointing at all**. Turning closes it;
> all seven Cores come into the frame across a full turn.
>
> What the descope got right and keeps: no scale, no live pan, no device-orientation sensors, and the
> Framing itself untouched. Only rotation came back. 08 and 12 stay closed — 08 because the turn
> changes what is comfortable to look at and never what is reachable, and 12 because its momentum
> question was answered by declining momentum.

The live optical layer, in full. Ticket 11 shipped a static Framing that answered the ask these were
charted to serve, so each closed without being decided rather than being decided against.

- **[03 — Where rotation lives](issues/03-where-rotation-lives.md)** — nothing turns, so the flip has
  no rotation to survive. What it proved stands: the correction works, and it pops only under a
  rotation that no longer exists.
- **[04 — What drives rotation](issues/04-what-drives-rotation.md)** — no driver, no reading zone.
  Takes 11's fifth Resolve bullet down with it; the cropped half is reached by changing the Focus,
  which is what the Wheel already did.
- **[06 — Gesture conflicts](issues/06-gesture-conflicts.md)** — every collision was against a new
  gesture, and there is no new gesture. Tap descends, drag scrolls.
- **[08 — Accessibility under rotation](issues/08-accessibility-under-rotation.md)** — no rotation.
  Its real point was honoured anyway: the frame changes what is drawn, never what is reachable, and
  all 130 Nodes stay available through the list twin.
- **[12 — Hands-on with the reference](issues/12-hands-on-with-the-reference.md)** — legwork for
  decisions about pop and momentum that are no longer being made. Ticket 02's research stands.

### Dissolved by the pruning pass

A separate effort — `.scratch/wheel-prune/` — deleted the URL outright, on the grounds that sharing
was speculative and the machinery it cost was not. ADR-0005, _The Wheel's place is not addressable_,
records it.

- **[07 — Is Viewport shareable state? Is Rings?](issues/07-is-viewport-shareable-state.md)** — there
  is no URL for anything to be shareable in. `url.ts` and `focusShowing` are deleted, and Focus and
  Selection become component state. Void rather than answered: every bullet in the ticket
  presupposed an address bar that carries something. If Rings ever becomes a reader's control, where
  it lives is 05's to settle, and the prune set the precedent by putting **Locale** in
  `localStorage`.

**Superseded by ADR-0009 where it says nothing turns.** The destination above, the "three orthogonal
axes" premise and the Out-of-scope section all predate the reachability hole being found. There are
now four things the Wheel remembers — Focus, Rings, Framing and **Turn** — and 10 has more to write
up than it did. `CONTEXT.md` gained **Turn** and **Reading** after all, which reverses 01's "no new
vocabulary" ruling: 01 was right about the world it ruled on, where nothing turned and a Tertiary did
nothing.

**Still live:** 10 (write the spec), 13 (`MIN_FONT_SIZE` is unitless). 01, 05 and 09 have all
resolved — no new vocabulary, no reader's control, and ADR-0001 amended rather than superseded. The
ADRs now record what was decided, which is half this map's destination; **10 is the frontier and the
last of it.** 13 is a defect found while measuring for 05 and is not part of the destination.

**What the prune adds to 09's docket.** It reverses a spec section rather than amending one, and it
deletes Selection, which takes the subject away from a third ADR-0001 consequence. ADR-0001's _"the
two platforms differ only in starting depth, not in code"_ was already false after 11 and stays
false: they differ in Framing too. It briefly got worse — the prune shipped both Wheels prerendered
and chosen by CSS — and then ADR-0007 undid that, so there is one render path and one `<Wheel>`
again. 09 still owns the ruling; the prune deliberately did not make it.

- **Replacing Focus with pure zoom/pan** — the `feelingswheel.app` model. Considered and rejected
  while charting: it deletes `focusOn()`, the zoom tween, `descendsInto()`, Focus in the share URL,
  and reverses ADR-0001, in exchange for a worse mobile default.
- **Counter-rotated upright Labels** — geometrically impossible on the desktop poster (see above).
- **Text on a curved path** (tangential Labels along the arc) — ruled out with upright Labels; both
  are attempts to fix the Label's orientation inside its wedge rather than to bring the wedge round.
- **Changing the taxonomy, or any Label in any Locale** — ADR-0004 governs; nothing here touches it.
- **Device-orientation sensors driving rotation** — turning the phone to turn the Wheel. A different
  effort, and it does nothing for the desktop case that drove this one.

# The Wheel is navigated, not answered

The app had two pieces of state where the reader was concerned: the Focus, the Node expanded to fill
the circle, and the Selection, the Node they had settled on. Keeping them apart was treated as the
central modelling risk — the spec said so, `CONTEXT.md` gave each its own entry with an _Avoid_ list,
and ADR-0001 listed it as a consequence. All of that was in service of a payoff — the word, its Path,
a copy button — that nobody wanted. Choosing a feeling was not the thing being asked for; finding one
was.

So Selection is deleted outright. There is no chosen Node, no highlight, no `Escolher` control, no
clipboard. You descend the Wheel until the word you want is on screen, you read it, and you leave.

The removal fixes a bug it also explains. `descendsInto` was conditional on the view — a Node whose
children were already drawn did not descend, it settled — so that clicking the fully expanded desktop
poster highlighted a Path rather than re-rooting the whole thing. On a desktop, where the Cores'
children are on screen from the start, that meant clicking a Core produced no navigation at all: the
click had nowhere to go but a highlight, and the Wheel appeared stuck. The rule only ever existed to
keep descending and arriving apart. With arriving gone it is unconditional, which is what the
original ticket said before Selection complicated it: tapping a Node with children makes it the
Focus.

## Correction

**The first Consequence below is reversed by
[ADR-0009](0009-the-wheel-turns-in-its-frame.md); the decision above is not.** Selection stays
deleted — no chosen Node, no highlight, no clipboard, and none of the payoff this ADR found nobody
wanted.

What was wrong was making the Tertiary inert. Its wedge is drawn identically to a wedge that opens,
so the app taught a reader to tap and then declined to respond, and that is indistinguishable from a
bug — it was reported as one. A Tertiary now brings itself up to be read. The tap was collateral in
Selection's removal rather than part of what was being removed.

## Consequences

- A **Tertiary is not interactive**. It has nothing beneath it, so it responds to nothing — no
  pointer cursor on its wedge, and in the accessibility twin it is a paragraph rather than a button
  that would do nothing when pressed. It is the answer; you read it. _Reversed — see the Correction._
- **Clicking a Core on a desktop now works**, and re-roots the poster. This is the zoomable sunburst
  ADR-0001 describes, applied on both platforms rather than only on the phone.
- **Nothing can be copied.** `copySelection` and its `words.copy` / `copied` / `clear` entries are
  deleted, and the app has no way to take a word away with it. Combined with ADR-0005 there is now
  no export route of any kind — not a link, not text. Select the word on screen like any other text.
- `CONTEXT.md` loses its **Selection** entry, and **Focus** stops being defined against it.
- The Wheel's centre hint has one form rather than two: a tap always opens. `centreHintOpen` and
  `centreHintChoose` collapse to `centreHint`.
- Explorer spec user stories 8, 9, 10, 11 and 27 are withdrawn, and
  `.scratch/wheel-explorer/issues/04-selection-readout-copy.md` is retired — as is
  `.scratch/wheel-prune/issues/02-selection-line-not-a-card.md`, which had just rehoused it.
- ADR-0001 lists _"Focus and Selection must stay distinct in the state model"_ as a consequence, and
  that consequence no longer has a subject. Whether ADR-0001 is amended is not decided here; it
  belongs to `.scratch/wheel-viewport/issues/09-adr-0001-fate.md`, which is already holding two other
  claims of ADR-0001 that later work falsified.

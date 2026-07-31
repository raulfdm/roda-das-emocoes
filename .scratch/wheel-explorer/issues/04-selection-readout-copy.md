# 04 — Selection, Path readout and copy

**What to build:** you can arrive at an answer. Selecting a Node marks it distinctly from merely
having passed through it, shows the full chain from Core to Node, and lets you copy that to the
clipboard so it can go into a journal or a message. This is the payoff the whole Wheel exists to
deliver.

**Blocked by:** 03

**Status:** wontfix — shipped, rehoused, then deleted. See Retired below.

- [ ] Any Node can be made the Selection — at any ring, not only at Tertiaries, so someone who only
      needs a broad word isn't forced to descend
- [ ] The Selection is visually distinct from the Focus, so it's clear you've arrived rather than
      passed through
- [ ] The full Path is displayed, e.g. `Mal › Estresse › Sobrecarregado`
- [ ] The word and its Path can be copied to the clipboard in one action, with visible confirmation
- [ ] Making a new Selection replaces the previous one; there is a way to clear it

## Notes

Focus and Selection are separate state (see `CONTEXT.md`). A user passes through many Focuses to
reach one Selection. Selecting a Node that has children should not be conflated with descending into
it — the interaction must distinguish "I'm going deeper" from "this is my answer".

Nothing is persisted or written to the URL in this ticket; that arrives in 05. _(And 05 was later
reversed — nothing is written to the URL at all. See ADR-0005.)_

## Retired

**Selection is deleted outright — ADR-0006.** Nothing is chosen, marked or copied. The section below
describes the rehousing that happened first and was itself undone a session later; it is left in
place because the sequence is the record.

The one thing worth carrying forward: this ticket's insistence that Selection and Focus stay
distinct is what made `descendsInto` conditional on the view, and that conditional is what left a
desktop click on a Core doing nothing at all. The distinction was real and correctly identified. It
was the feature underneath it that was not wanted.

## Rehoused, then deleted

Every criterion above still holds. What changed is where they live: the `A sua escolha` card that
delivered them is deleted, and the same four jobs — mark the Selection, show its Path, copy it,
clear it — move to a single line below the Wheel. See
`.scratch/wheel-prune/issues/02-selection-line-not-a-card.md`.

Two of this ticket's points came out of that pass stronger rather than weaker. The Selection line
renders on **both** platforms, where the card had left the desktop with no Path text on the page at
all — the Focus readout is gated by `cropsCentre(framing)` and the desktop's Path lived only inside
the Wheel's centre. And keeping the Selection line visually separate from the Focus readout above
the Wheel is exactly this ticket's second criterion, restated in a layout that has to work harder
for it.

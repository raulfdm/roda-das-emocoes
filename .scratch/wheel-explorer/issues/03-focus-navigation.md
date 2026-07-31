# 03 — Focus navigation

**What to build:** the Wheel becomes navigable. On a phone it opens showing only the 7 Cores as large
wedges; tapping one makes it the Focus and spreads its Secondaries around the full circle; tapping
again descends to the Tertiaries. Tapping the centre goes back up. Three taps takes you from "I feel
bad" to a precise word, with never more than nine Labels on screen.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Tapping a Node with children makes it the Focus; its children spread across the full 360°
- [ ] Tapping the centre moves the Focus up one level; from a Core it returns to the full Cores view
- [ ] There is a single action that returns to the 7 Cores from any depth
- [ ] Ancestors of the Focus compress into inner rings, with the Path so far readable at the centre
- [ ] Mobile opens with the Cores only; desktop opens with all three rings expanded — same component,
      differing only in initial Focus depth
- [ ] Focus changes are animated, driven by Svelte's own tweening
- [ ] Tap targets at every depth are comfortable on a phone (Cores ~51° of arc, Secondaries ~90°,
      Tertiaries ~180°)

## Notes

Focus is not Selection. This ticket introduces **Focus only** — the Node currently expanded to fill
the circle. Selecting a Node as an answer arrives in ticket 04, and the two must stay separate pieces
of state. Collapsing them is the main modelling risk in this feature; see `CONTEXT.md`.

The geometry is a pure transformation from (tree, Focus) to the set of visible arcs, holding no state
of its own. The re-rooting math is ours — `d3-shape` only generates path strings.

See ADR-0001 for why the Wheel zooms rather than rendering whole.

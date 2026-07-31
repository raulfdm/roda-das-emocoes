# 03 — Where rotation lives, and how the Label flip survives it

**Type:** grilling

**Blocked by:** 01, 11

**Status:** resolved — reopened by ADR-0009

## Question

Two entangled decisions, which is why they share a ticket.

### Where does rotation live?

Either rotation becomes a field on `View` in `geometry.ts` — tweened alongside `x0`, `x1`, `depth`
and `rings`, flowing through `arcsFor()` — or it sits above the geometry as a transform on the SVG
group, leaving `geometry.ts` untouched.

The transform is far cheaper: no arcs re-derived, the browser composites it, and `geometry.ts` stays
the pure `(tree, Focus) → arcs` function its header comment promises. The `View` field is more
honest: rotation genuinely is part of "what the Wheel is currently showing", and only there can it be
tweened in step with a Focus change rather than fighting it.

Decide which, and on what grounds.

### How does the Label flip survive rotation?

`geometry.ts:212`:

```js
const flipped = middle > Math.PI ? ' rotate(180)' : '';
```

That 180° flip is what stops left-half Labels reading upside-down. It is computed **once, at layout
time, against the unrotated mid-angle**. Rotate the Wheel half a turn and every flipped Label arrives
on the right half still flipped — upside-down, which is worse than the sideways text this effort
exists to fix.

The flip has to become a function of the *rotated* angle. That is easy if rotation is in `View` and
awkward if it is a transform above the geometry — which is why this decision and the one above cannot
be made separately.

Also settle: at the moment a Label crosses the flip boundary mid-rotation, does it snap 180°? Does it
animate? Does the boundary sit somewhere the reader is unlikely to be looking?

## Notes

The flip problem was found while charting, by reading `placeLabel()`. It is not hypothetical — it is
a guaranteed break in the most obvious implementation of this feature.

**Ticket 02 confirmed it against a live implementation, and priced the fix.** `feelingswheel.app`'s
desktop build takes exactly the approach anticipated above: re-derive only the trailing
`rotate(0|180)` against `(θ + rotation) mod 360` on every pointer move, leaving the wedge-attached
`rotate(θ)` alone. Measured across 0/45/90/135/180°, it produces zero upside-down Labels — **the fix
works.** But the flip is a discontinuity, and 02 caught it popping at 3° granularity: one Label swung
+87.4° → −89.7° between drag+15 and drag+18. With roughly 30 of 130 Labels within 20° of vertical at
any moment, something is popping continuously throughout a drag.

So the sub-question above — "does it snap 180°, animate, or defer?" — is now the *main* question
here, not an afterthought. A correction that works and looks bad is not obviously better than no
correction. Ticket 12 will report whether the pop is actually offensive in the hand.

**Blocked by 11 as well, because 11 may delete half this ticket.** If the Wheel is framed as a
half-disc, no Label is ever on the side that needs flipping, and the entire correction problem stops
existing. Do not decide how to fix the flip before deciding whether we ever have it.

## Comments

**Narrowed by 11, not deleted.** Ticket 11 resolved to half-disc framing on phones only — the desktop
keeps the whole disc, and therefore keeps the flip. So the last paragraph above reads slightly wrong
now: the correction problem did not stop existing, it lost its mobile half.

What that changes for this ticket:

- **The flip-pop is a desktop-only problem.** Every Label a phone can see is already upright by
  construction, so whatever this ticket decides about snapping, animating or deferring applies to one
  screen size, and the reader on that screen has a mouse and a fixed monitor.
- **The flip is now a real parameter**, derived from the frame rather than configured beside it —
  `flips(framing)` in `src/lib/wheel/framing.ts` is `framing.x < 0`, and `arcsFor(view, framing)`
  threads it through to `placeLabel`. A rotation that changes which part of the plane is visible would
  have to go through the same seam, which is probably the useful hint for "where rotation lives".
- **Rotation still has nowhere to live yet.** 11 landed a *static* offset only. Nothing turns.

Still blocked by 01.

**Closed as out of scope.** The effort was descoped after ticket 11 shipped: the Wheel gets a
static Framing, not a live optical layer, so there is no rotation for this ticket to find a home for.

What it established is still true and worth keeping: the flip correction works, it pops as Labels
cross vertical, and half-disc framing removed the problem on phones without solving it on desktop.
The desktop still corrects the flip, and because nothing turns, nothing pops. The pop was only ever a
symptom of rotation, and rotation is gone.

Reopen this if a live Viewport is ever chartered again.

**Reopened and resolved — the fork was false.** A live turn was chartered again (ADR-0009), so this
ticket's own reopen condition fired.

Neither branch was taken. Rotation is a **parameter of `arcsFor` alongside `framing`**, and the
component applies it as one transform on one `<g>`. That is possible because a rotation is rigid: it
moves every wedge without changing any wedge's shape, so no path data depends on it, and the only
things that do — the flip, and whether the frame cuts the Label — are already computed in `arcsFor`
against a seam that `framing` had cut for exactly this shape of question. The ticket assumed a
transform above the geometry meant the flip was *out of reach*; it only meant the flip must not be
baked into the path strings.

Measured on the desktop poster over 120 frames of a brisk drag: **zero `d` attributes change per
frame**, 0.16 label transforms change, `arcsFor` costs 0.056 ms — 0.3% of a 60fps budget.

The sub-question — snap, animate, or defer? — resolves to **snap**. Animating a 180° turn spins the
Label through its own upside-down state; deferring means reading upside-down Labels for the whole
drag, which is what the correction exists to prevent. The pop is accepted as a cost and is smaller
than feared: desktop-only, and roughly one Label every six frames.

Guarded by tests, because this failure is invisible at rest — see `geometry.test.ts`.

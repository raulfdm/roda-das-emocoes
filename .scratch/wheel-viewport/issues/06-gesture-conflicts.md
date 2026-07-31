# 06 — Gesture conflicts

**Type:** grilling

**Blocked by:** 04, 05

**Status:** resolved — reopened by ADR-0009

## Question

Every gesture the Viewport wants is already spoken for. Resolve each collision.

- **Tap versus drag.** A tap on a wedge activates it — descends or settles (`Wheel.svelte:98`). A
  drag on a wedge turns the Wheel. The same pointer-down starts both. What separates them: a
  distance threshold, a time threshold, or does rotation move to a dedicated handle so the conflict
  never arises? Getting this wrong makes the Wheel feel broken in a way nothing else on this map
  does.
- **Pinch versus page zoom.** A two-finger pinch on a phone zooms the browser unless the element
  says otherwise. Suppressing that is a real accessibility cost — it is how low-vision readers
  enlarge text — and worth weighing rather than assuming.
- **Drag versus page scroll.** The Wheel does not fill a phone's viewport; the page scrolls. A
  vertical drag that starts on the Wheel is ambiguous between turning it and scrolling the page.
- **Trackpad and mouse wheel versus page scroll.** Same collision on desktop, where the page also
  scrolls and where a two-finger trackpad gesture is the natural zoom.
- **Where the gestures are live.** Only over the Wheel? Over the centre readout, which is an HTML
  button? Over the whole page?

Output is a decision per collision, with the reasoning, in a form ticket 10 can turn into acceptance
criteria.

## Notes

Blocked by both prototypes because the collisions depend on what gestures actually exist — 05 may
remove pinch from the design entirely, and 04 may move rotation to a handle and dissolve the
tap-versus-drag problem outright.

**Two hard data points from ticket 02.**

*How the reference dodges the tap-versus-drag collision:* it doesn't have one. Clicking a Node
**selects** it into a list; it never navigates. We have descend-vs-settle on the same pointer-down,
so this collision is ours alone and no prior art solves it for us.

*An implementation trap, verified:* their desktop drag dies the instant the cursor leaves the 700×700
box, because `onMouseleave` is bound to the same handler as `onMouseup` — the transform freezes
mid-gesture. Since you grab near the rim of a disc inscribed in its own square box, this fires
constantly in ordinary use. **Use pointer capture** (`setPointerCapture`), and make that an explicit
acceptance criterion in the spec rather than a thing an implementer is trusted to know.

Also worth carrying into the spec: they bind exactly six handlers — `touchstart` `touchmove`
`touchend` `mousedown` `mouseleave` `mouseup` — and dispatch between desktop and touch by **one-shot
user-agent sniffing at mount**. Ticket 02 reads that as leaving iPad rotation dead, since the tablet
branch is off and an iPad falls through to the mouse path. Ticket 12 will confirm on the device.
Whatever we do, unified Pointer Events beat two UA-selected code paths.

## Comments

**Closed as out of scope.** Descoped after 11 shipped. Every collision this ticket catalogued was
between a new Viewport gesture and an existing one, and no new gesture is being added, so there is
nothing left to resolve. Tap still descends, drag still scrolls the page.

**Reopened by ADR-0009 — there is a new gesture after all.** One collision was real and is resolved
by declaration rather than by arbitration:

- **Drag vs page scroll (touch).** A turn is angular and has no axis to concede, so the Wheel takes
  `touch-action: none` over its own box. A phone cannot scroll by dragging on the Wheel; it can
  everywhere else, and the cropped Wheel is about two thirds of the column's width.
- **Drag vs tap.** A drag that ends over a wedge still raises a click, so a gesture that travels more
  than 6px stops counting as a tap. Pixels, not radians: the same movement sweeps a large angle near
  the hub and a tiny one at the rim.
- **Drag vs the centre control.** The centre ascends on tap and turns on drag, through the same rule.

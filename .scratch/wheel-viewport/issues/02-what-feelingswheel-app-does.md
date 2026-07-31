# 02 — What does feelingswheel.app actually do?

**Type:** research

**Blocked by:** —

**Status:** resolved

## Question

`feelingswheel.app` is the reference this effort was pointed at, and it is already the credit link in
our own footer (`+page.svelte:301`). Its marketing copy says "Click and turn the interactive Feelings
Wheel to explore your emotions" — turn, not drill into. The page is client-rendered, so its mechanics
cannot be read from the served HTML.

Establish, as fact rather than inference:

- Does it render all 130 Nodes at once, or does it re-root like ours?
- What drives the rotation — drag, momentum, snap? Does it come to rest at wedge boundaries, or
  anywhere?
- Where is its reading zone? Is there a fixed pointer or marker showing where you read?
- How are its Labels oriented — rigidly attached to the wedge, or corrected as it turns? **In
  particular: does a Label ever end up upside-down?** This is the exact failure mode ticket 03 is
  about.
- Does it offer optical zoom or pan at all, or only rotation?
- What does it do on a phone versus a desktop?
- Anything it does that we haven't thought of, and anything it visibly gets wrong.

## Notes

AFK — resolved by a `/research` subagent, no human needed. Findings land as a Markdown file in the
repo on a throwaway `research/feelingswheel-app` branch, linked from this ticket's answer.

This is the cheapest ticket on the map and it de-risks 04 and 06, so it runs first and in parallel
with everything else. It informs those tickets; it does not decide them — a prior-art finding is
evidence, not a design decision.

## Answer

Full findings: [`research/feelingswheel-app.md`](../research/feelingswheel-app.md) — 550 lines, every
claim tagged `VERIFIED-SRC` / `VERIFIED-BROWSER` / `INFERRED`, with sources.

The ticket's premise was wrong in a useful way. The site is Laravel + Inertia + Vue **with an SSR
pass**, so the at-rest Wheel came out of `curl` and the mechanics out of unobfuscated minified
bundles. Most claims below are measured in headless Chromium under synthesised drags, not inferred.

**The mechanics.** All 130 Nodes at fixed radii, always — no Focus, no re-rooting; clicking selects
into a list beside the Wheel and never navigates. Rotation is 1:1 grab-and-turn on desktop with no
momentum, and a 3×-gain flick with a 0.95-friction flywheel on touch, chosen by one-shot user-agent
sniffing. **No snap on either** — it rests at arbitrary angles. **No marker of any kind**: an element
census of the live SVG returns `{g:1, path:131, title:131, text:131}` and nothing else, so the
reading zone at 3 o'clock is implicit in the radial layout. Zoom exists only as a `0.5×–1.5×` range
slider on a separate `/full-screen` page — not a gesture, absolute rather than focal, and not
available where the Wheel actually lives. No pinch, no scroll-zoom, no 2D pan.

**Three findings that change this map:**

1. **Their layout function is structurally our `placeLabel()`, and desktop fixes the flip exactly as
   ticket 03 anticipated — but it pops.** `de()` re-derives only the trailing `rotate(0|180)` against
   `(θ + rotation) mod 360` on every mousemove, leaving the wedge-attached `rotate(θ)` alone. Zero
   inversions measured at 0/45/90/135/180°. The cost is a **180° instantaneous flip as a Label
   crosses 12 or 6 o'clock**, caught at 3° granularity (`Bad` went +87.4° → −89.7° between drag+15
   and drag+18). With ~30 of 130 Labels within 20° of vertical at any moment, something pops
   constantly throughout a drag. **The correction works and is still not free.**

2. **Mobile solves it by framing instead of maths — the candidate nobody ticketed.** On mobile it
   never flips any Label (`flippedInMarkup: 0 of 130`) and instead offsets the container so the
   Wheel's centre lands exactly on the viewport's **left edge** (measured `x=-350, width=700` on a
   390px viewport). Radial-outward text is upright precisely on the right half-disc; the inverted
   Labels are precisely the left half-disc. **Exact complements** — the 65 inverted Labels are always
   the hidden ones. Crop to the half where the naive layout is already right, and the correction
   problem disappears. This became ticket 11.

3. **The same author chose drill-down, not rotation, for his native phone app.** [The Feelings Wheel
   on the App Store](https://apps.apple.com/us/app/the-feelings-wheel/id6756626873): *"Start broad
   with emotions like happy, surprised, angry, or fearful, then tap deeper to find what truly fits."*
   Same person, same taxonomy, phone-first brief — and he picked our ADR-0001 model. **The rotation
   model reads as a web-poster answer, not a phone answer.** Evidence for ticket 09.

**Implementation trap for whoever builds rotation:** their desktop drag dies the instant the cursor
leaves the 700×700 box — `onMouseleave` is bound to the same handler as `onMouseup`, and the
transform freezes mid-gesture. Since you grab near the rim of a disc inscribed in its own box, this
fires constantly. Use pointer capture. Noted on ticket 06.

**Not established** — all needing real hardware, and now ticket 12: how the 3× touch flick actually
feels under a thumb; whether the Wheel rotates at all on an iPad (the UA test's tablet branch is off,
so an iPad takes the desktop mouse path — strong reading of the source, untested); and whether a real
tap selects on iOS given selection is bound to `mouseup`. There is also **no public repo, no
changelog, no design write-up and no user-reception evidence** — the iOS listing shows 5.0★/35
ratings with no review text — so nothing here says whether real users enjoy turning it.

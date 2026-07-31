# What `feelingswheel.app` actually does

Research output for `.scratch/wheel-viewport/issues/02-what-feelingswheel-app-does.md`.

**Date:** 2026-07-31 · **Subject:** <https://feelingswheel.app/> (by Roman Paprotsky,
<https://romanpaprotsky.com/>) · **Build inspected:** `FeelingsWheel-CPzlRkI7.js`,
`FullScreen-DZFfvaG2.js`, `AppLayout-BQKQJ_GX.js`, `AppLayout-DH9s5aJR.css`

## How these claims were established

Every claim below is tagged:

- **[VERIFIED-SRC]** — read directly out of the shipped, minified JavaScript or CSS the site serves.
  The site is Laravel + Inertia + Vue 3 with an SSR pass; the bundles are unobfuscated beyond
  minification, so the wheel component's source is fully legible.
- **[VERIFIED-BROWSER]** — observed by driving the live site in headless Chromium (Playwright),
  measuring real DOM/`getScreenCTM()` values under real synthesised drags. This is the strongest
  class of evidence here: it is what the page actually does, not what I think the code says.
- **[INFERRED]** — a reading of the code I could not, or did not, confirm by running it.
- **[UNDETERMINED]** — listed in the final section.

Note on trust: the served HTML is **not** empty — the ticket's premise that "the page is
client-rendered so its mechanics are not in the served HTML" is only half true. The wheel is
server-rendered as a static, `pointer-events-none aria-hidden` SVG placeholder for first paint, then
replaced on mount by a d3-built interactive SVG. So the *at-rest layout* was readable straight from
`curl`, and the *mechanics* were readable from the bundle.

---

## Summary

`feelingswheel.app` renders **all 130 Nodes at once, always** — the full poster, three fixed rings,
no re-rooting and no Focus concept at all. Its single navigational verb is **rotation**: a 1:1
grab-and-turn on desktop, a 3×-amplified flick with momentum on touch. There is **no snap** and
**no reading marker** of any kind. It comes to rest wherever you let go.

Two findings matter more than the rest.

**First: it has already solved our ticket-03 problem, and it solved it the obvious way.** It bakes
the same 180° flip we do (`rotate(θ) translate(r,0) rotate(0|180)` — structurally identical to our
`placeLabel()`), but on desktop it **re-derives the flip against the post-rotation angle on every
pointer move** and rewrites all 130 label transforms. Measured across a full 180° sweep: **zero
upside-down Labels at any rotation.** The wedge orientation itself is never corrected — only the
reading direction flips.

**Second: on a phone it does something we have not considered at all.** It does not correct Labels
under rotation on touch. It doesn't need to: it **never flips any Label on mobile**, and it
**positions the Wheel so that its centre sits exactly on the left edge of the viewport**, showing
only the right hemisphere. Radial-outward text is upright precisely on the right half, so the half
that is wrong is exactly the half that is off-screen. The reading zone *is* the viewport.

And one finding that cuts against the whole model: **the same author's native iOS app for the same
taxonomy uses tap-to-drill-down, not rotation** — "Start broad with emotions like happy, surprised,
angry, or fearful, then tap deeper to find what truly fits"
(<https://apps.apple.com/us/app/the-feelings-wheel/id6756626873>). Given a phone as the primary
target rather than a web page, the author picked our ADR-0001 model, not his own web one.

---

## 1. Does it render all 130 Nodes at once, or does it re-root/zoom like ours?

**All 130 at once. Always. There is no Focus, no re-rooting, no zoom-to-Node.** [VERIFIED-SRC +
VERIFIED-BROWSER]

The served HTML contains 130 `<text>` elements and 130 wedge `<path>`s, at exactly three label radii:

| radius | count | our term   |
| ------ | ----- | ---------- |
| 71.25  | 7     | Cores      |
| 168.75 | 41    | Secondaries |
| 291.25 | 82    | Tertiaries |

That is **the same 7 / 41 / 82 taxonomy as ours** — it is Geoffrey Roberts' wheel, credited in their
footer as it is in ours. So this is a like-for-like comparison.

The ring radii are hard constants in the bundle, keyed off `height` in the d3 hierarchy
[VERIFIED-SRC]:

```js
R = e => e.height===2 ? 0   : e.height===1 ? 115 : 225   // inner radius
V = e => e.height===2 ? 115 : e.height===1 ? 225 : 350   // outer radius
```

Nothing anywhere in the bundle recomputes these. The wheel is a fixed 700×700 px (`const c=700`),
laid out once on mount with `d3.partition()` and never re-laid-out. Clicking a wedge **selects**
it, it does not navigate: `H(id)` toggles the wedge's class from its colour to `bg-color-default`
and pushes the feeling onto a `selectedFeelings` list rendered beside the Wheel
[VERIFIED-SRC + VERIFIED-BROWSER — a synthesised tap flipped `bg-color-lavender-purple` →
`bg-color-default` and the selection list appeared].

**Selection is multi-select**, and the list beside the Wheel supports drag-reordering, grouping and
copy-to-clipboard. There is no notion of a Path readout at the centre; the centre is empty.

**Implication for ADR-0001:** their model is only viable because they never try to make all 82
Tertiaries legible on a phone at once. They don't render the Wheel small — they render it at a fixed
700px and let it overflow the viewport (see §6). ADR-0001's arithmetic is untouched by this
finding; they simply declined the constraint rather than solving it.

## 2. What drives its rotation — drag, momentum, snap?

**Two entirely separate code paths, chosen by user-agent sniffing, with materially different feel.**
[VERIFIED-SRC + VERIFIED-BROWSER]

The switch is `const y = Fe()` where `Fe` is an `ismobilejs`-style UA regex test, evaluated **once**
at component setup. It is UA-based, not touch-capability-based and not width-based, and it is called
with no options so its tablet branch is off. [VERIFIED-SRC]

### Desktop: 1:1 angular drag, no momentum, no snap

```js
// mousedown: record the pointer's angle about the container's true on-screen centre
ke = e => { g = W(e.clientX, e.clientY); window.addEventListener("mousemove", I) }
// mousemove: add the angular delta straight onto the accumulated rotation
I  = e => { l = W(e.clientX,e.clientY); const n = l - g;
            n!==0 && (F=true, x.value += n, g = l,
              r.value.style.transform = `rotate(${x.value}deg)`,
              b.selectAll("text").attr("transform", t => de(t)) ... ) }
// mouseup / mouseleave: just detach. Nothing else happens.
N  = () => { F=false; window.removeEventListener("mousemove", I) }
```

`W()` uses `getBoundingClientRect()` centre — a correct pivot. The gain is exactly 1: one degree of
pointer travel about the centre is one degree of Wheel.

Measured [VERIFIED-BROWSER]: a synthesised drag of 60° produced `rotate(59.9227deg)`, tracking the
pointer within a fraction of a degree throughout. On release the transform was `rotate(59.9227deg)`
and **still `rotate(59.9227deg)` 1.5 s later** — no momentum, no easing, no settling. In a separate
run it came to rest at `rotate(180deg)` and stayed there. **It rests at whatever arbitrary angle your
pointer left it at; it does not snap to wedge boundaries, or to anything else.**

`F` is a "did-drag" flag that suppresses selection, so a drag never accidentally picks a feeling.
[VERIFIED-SRC]

### Touch: 3× amplified flick, with a momentum flywheel

```js
pe = e => { ...  const i = l - g, t = M + i*(180/Math.PI)*3;   // <- 3x gain
            m = l - u; u = l;                                  // m = per-move velocity
            f = requestAnimationFrame(() => r.value.style.transform = `rotate(${t}deg)`);
            e.preventDefault() }
ye = () => L();
function L(){                                     // the flywheel
  if (Math.abs(m) < .001) return;                 // stop threshold
  u += m; const i = M + (u-g)*(180/Math.PI)*3;
  f = requestAnimationFrame(() => r.value.style.transform = `rotate(${i}deg)`);
  m *= .95;                                       // friction, per tick
  B = setTimeout(L, 16)                           // ~60 Hz
}
```

So on touch: **3× gain** (a finger sweeping 30° around the centre turns the Wheel ~90°), and a
**momentum spin with 0.95-per-16ms friction** that coasts to a stop at an arbitrary angle. A new
`touchstart` kills the flywheel (`m=0; clearTimeout(B)`).

Measured [VERIFIED-BROWSER, iPhone 13 emulation]: after a synthesised swipe, the transform read
`rotate(45.43deg)` at +300 ms and `rotate(51.43deg)` at +1500 ms — still coasting more than a second
after the finger lifted, then stopping at a non-boundary angle. **Momentum confirmed; no snap.**

**Neither path snaps. There is no notion of a wedge boundary in the rotation code at all.**

## 3. Where is its reading zone? Is there a fixed pointer or marker?

**There is no marker, pointer, needle, crosshair, highlight band or reading indicator of any kind.**
[VERIFIED-BROWSER]

A full element census of the live interactive SVG returns exactly:

```
{ "g": 1, "path": 131, "title": 131, "text": 131 }
```

No `line`, no `circle`, no `polygon`, no `rect`, no `marker`, no `defs` (the only `<defs>` in the
component is an unused linear gradient in the SSR placeholder). Nothing marks where you are meant to
read.

**But the reading zone is real, and it is implicit in the geometry: it is 3 o'clock.** Labels are
laid out radially — `rotate(θ-90) translate(r,0)` — so a Label's baseline points straight out from
the centre. At 3 o'clock that baseline is exactly horizontal and the word reads normally. At 12 and
6 o'clock it is exactly vertical. So "turn the thing you want round to the right-hand side" is the
whole interaction, and the app simply trusts you to work that out. The marketing copy ("Click and
**turn** the interactive Feelings Wheel") is the only instruction you get.

On desktop this reading zone is unmarked and un-framed. **On mobile the reading zone is enforced by
the layout instead of marked** — see §6, which is the interesting half of the answer.

Measured cost of radial layout [VERIFIED-BROWSER]: at any given rotation, **28–31 of the 130 Labels
sit within 20° of vertical.** That is a permanent band of sideways text at the top and bottom of the
Wheel — roughly a quarter of the Wheel is hard to read at any moment, by construction.

## 4. How are Labels oriented? Does one ever end up upside-down?

**No. Never — on either platform. And they get there by two completely different routes.** This is
the section that speaks directly to ticket 03.

### Their layout function is structurally identical to our `placeLabel()`

```js
// Z(): used at SSR and at initial client mount
function Z(e){
  const i = (e.x0+e.x1)/2 * 180/Math.PI;         // mid-angle, degrees
  const n = (e.y0+e.y1-o)/2;                      // radius
  return `rotate(${i-90}) translate(${n},0) rotate(${ y || i<180 ? 0 : 180 })`;
}
```

Compare `src/lib/wheel/geometry.ts:200-215`. Same three-part transform, same 180° flip on the left
half, same decision made at layout time against the unrotated angle. **The exact shape of the bug
ticket 03 describes is present in their code too.** [VERIFIED-SRC]

### Desktop's fix: re-derive the flip against the *post-rotation* angle, every pointer move

```js
function de(e){
  const i = (e.x0+e.x1)/2 * 180/Math.PI;
  const n = (e.y0+e.y1-o)/2;
  const t = i - 90;                     // wedge orientation: UNCHANGED
  let a = (i + x.value) % 360;          // <- current ON-SCREEN angle
  a = a < 0 ? a + 360 : a;
  const s = a < 180 ? 0 : 180;          // <- flip decided against that
  return `rotate(${t}) translate(${n},0) rotate(${s})`;
}
```

and in the mousemove handler:

```js
b.selectAll("text").data(k.descendants()).attr("transform", t => de(t))
   .attr("dy","0.35em").attr("id", ...).text(t => C(t.data.name, t))
```

So: on every `mousemove`, all 130 Label transforms (and ids, and truncated text) are rewritten. The
first `rotate(t)` — the wedge-attached radial orientation — is never touched. Only the trailing
`rotate(0|180)` is re-derived. [VERIFIED-SRC]

**Measured, live [VERIFIED-BROWSER].** I measured every Label's true on-screen baseline direction via
`getScreenCTM()` at rotations of 0°, 45°, 90°, 135° and 180°:

| container transform | labels | upside-down on screen | within 20° of vertical |
| ------------------- | ------ | --------------------- | ---------------------- |
| (none)              | 130    | **0**                 | 31                     |
| `rotate(45deg)`     | 130    | **0**                 | 29                     |
| `rotate(90deg)`     | 130    | **0**                 | 30                     |
| `rotate(135deg)`    | 130    | **0**                 | 28                     |
| `rotate(180deg)`    | 130    | **0**                 | 31                     |

**Zero upside-down Labels at every rotation tested.** The approach works.

### The cost: the flip is a discontinuity, and you can see it pop

Stepping the drag in 3° increments and watching the Core Label "Bad" [VERIFIED-BROWSER]:

```
drag+15  rotate(14.9191deg)   Bad baseline= +87.4  flip=rotate(180)
drag+18  rotate(17.8904deg)   Bad baseline= -89.7  flip=rotate(0)     <-- 180° pop
```

As a Label crosses 12 o'clock or 6 o'clock its reading direction inverts **instantaneously**, at the
moment it is closest to vertical. So the guarantee is precisely "never upside-down", not "always
comfortable": you buy it with a visible snap through the vertical, twice per revolution per Label.
Since ~30 Labels are near-vertical at any time, something is popping through this boundary
constantly during a drag.

### Mobile's fix: don't flip at all, and hide the half where that is wrong

This is the finding I did not expect, and I think it is the most useful thing in this document.

On mobile the touch handlers **never call `de()`**. They only set the container transform. So Label
orientation is frozen at whatever `Z()` produced at mount. And in `Z()`, note the precedence:
`y || i<180 ? 0 : 180` parses as `(y || (i<180)) ? 0 : 180` — **when `y` (is-mobile) is true the flip
term is always 0.** No Label is ever flipped on mobile. [VERIFIED-SRC]

Confirmed live [VERIFIED-BROWSER, iPhone 13 emulation]: `flippedInMarkup: 0 of 130`, and
`upsideDownOnScreen: 65` — **exactly half** the Labels are upside-down in absolute screen terms, both
at rest and after rotating 51°. The *set* of upside-down Labels rotates with the Wheel, but the count
stays at exactly 65.

Which would be a disaster, except for the layout (§6): the container carries `-ml-[114%]`, and
measured on a 390 px viewport the Wheel's bounding box is `x = -350, width = 700`, i.e. **its centre
lands on `x = 0`, exactly the left edge of the viewport.** The visible region is therefore precisely
the right half-disc. And "upside-down under radial-outward layout" is precisely the left half-disc.
**The two are exact complements.** Every Label you can see reads correctly; every Label that doesn't
is off-screen.

A screenshot at `rotate(51deg)` on the emulated phone confirms it visually: every visible word reads
bottom-left to top-right, none inverted.

**This is a genuinely different answer to ticket 03's question, and it is much cheaper than ours or
theirs-on-desktop: crop the viewport to the half where the naive layout is already correct, and the
correction problem disappears.** It costs you the ability to see the whole Wheel, which is exactly
the trade the map's "readable region on demand / paper gesture" note is circling.

## 5. Does it offer optical zoom or pan at all, or only rotation?

**On the main page: rotation only. No zoom, no pan, no pinch, no scroll-zoom, no double-tap.**
[VERIFIED-SRC + VERIFIED-BROWSER]

The component binds exactly six handlers and nothing else:
`onTouchstart onTouchmove onTouchend onMousedown onMouseleave onMouseup`. There is no `wheel`
listener, no second-touch handling, no `scale()` anywhere in `FeelingsWheel-CPzlRkI7.js`.
Scroll-wheeling over the Wheel leaves its transform byte-identical and just scrolls the page
[VERIFIED-BROWSER].

**There is one zoom, and it lives on a separate page.** A "Fullscreen" button (a plain `<a href>`,
not a modal) links to `/en/feelings-wheel-full-screen` and its twelve localised siblings
(<https://feelingswheel.app/en/feelings-wheel-full-screen>). That page reuses the identical
`FeelingsWheel` component and adds a single control [VERIFIED-SRC + VERIFIED-BROWSER]:

```html
<input type="range" min="0.5" max="1.5" step="0.01" value="1">
```

driving `transform: scale(h)` on the Wheel container, with a 500 ms
`cubic-bezier(.25,.1,.25,1)` transition, and a watcher that grows the row height to `700 * scale` so
the page reflows. **So: zoom is a slider, 0.5×–1.5×, on a dedicated page — not a gesture, and not
available where the Wheel actually lives.** Panning is ordinary vertical page scroll
(`overflow-y-scroll`); there is no 2D pan and no horizontal pan at all.

Worth naming for our own purposes: their zoom is **decoupled from rotation** (different page,
different control, different input modality) and it is **absolute, not focal** — it scales about the
element's default origin, it does not zoom toward a point you indicate. If we do a Viewport with
scale, focal zoom is table stakes and they do not have it.

## 6. What does it do on a phone vs a desktop?

**One component, one 700 px layout, one taxonomy — and a `lg:` breakpoint that decides whether you
see the whole Wheel or half of it.** [VERIFIED-SRC + VERIFIED-BROWSER]

The parent passes `class="-ml-[114%] lg:ml-0"` down to the Wheel. Below Tailwind's `lg` (1024 px) the
700 px Wheel is dragged left out of its column; at and above `lg` it sits centred. Measured across
viewport widths:

| viewport | wheel left | wheel centre X | what you see |
| -------- | ---------- | -------------- | ------------ |
| 390 px   | −350       | **0**          | exactly the right hemisphere |
| 768 px   | −376       | **−26**        | right hemisphere, centre off-screen |
| 1000 px  | −393       | **−43**        | right hemisphere, centre further off-screen |
| 1024 px  | −9         | 341            | whole Wheel |
| 1280 px  | 77         | 427            | whole Wheel |

So the differences are:

- **Desktop (≥1024 px):** the whole 130-Node poster, centred, all rings legible-ish, all Labels
  never upside-down because the flip is recomputed live during drag. Grab-and-turn at 1:1. No
  momentum. A separate Fullscreen page if you want it bigger.
- **Phone (<1024 px):** the right hemisphere only, Wheel centre pinned to the viewport's left edge,
  Labels never flipped (correct by construction on the visible half), 3× flick with momentum. The
  Wheel is never scaled down to fit — **it overflows deliberately and permanently.** There is no
  "see the whole Wheel" option on a phone at all, short of the Fullscreen page's 0.5× slider.
- Vertically the framing depends on scroll position; horizontally it is fixed. At the initial scroll
  position on a 390×844 viewport the Wheel's centre measured at `(0, 762)` — bottom-left corner —
  so what you first see is the upper-right *quadrant*, and you scroll to bring the lower-right
  quadrant into view.

Also platform-differentiated [VERIFIED-SRC]: the hover-highlight handler `G()` early-returns when
`y` is true, so there is no hover affordance on mobile; and the drop-shadow filter is applied only
when `!y`.

## 7. Things they do that we haven't thought of, and things they get wrong

### Worth stealing or at least considering

1. **Crop the viewport to the half where naive Label layout is already upright.** (§4.) A whole class
   of orientation problems deleted by framing rather than by maths. Directly relevant to 03 and 06.
2. **A per-wedge `<title>` carrying a full plain-language definition of the feeling.** 130 non-empty
   `<title>` elements measured live; sample: *"Feeling afraid because something seems dangerous,
   unsafe, or uncertain. This is a broad sense that you may need to protect yourself or avoid harm."*
   Native browser tooltip, zero UI cost. [VERIFIED-BROWSER]
3. **A `.animate` onboarding wiggle** — `@keyframes rotateBackAndForth` (0 → +40° → −20° → 0 over
   4 s, `forwards`), gated on a `localStorage` first-visit flag, whose entire job is to teach that
   the thing turns. Teaching an unmarked gesture with a one-shot demo is a good idea for an
   interaction that has no marker. [VERIFIED-SRC] (But see below — I could not get it to fire.)
4. **Rotation and selection cleanly separated by a did-drag flag**, so turning never accidentally
   picks a feeling. We will need the same guard the moment rotation lands next to tap-to-Focus.
5. **Multi-select with an editable, reorderable, groupable, copyable list beside the Wheel** — they
   treat the answer as a set, not a single Selection. Not in scope for us, but it is a real
   alternative to our one-Selection model.
6. **Zoom as an explicit slider rather than a gesture.** Ugly, but it is discoverable and it never
   fights with the rotation gesture. Worth remembering when 05 asks how pinch and Rings interact.
7. **Twelve locales, with localised URLs.** Their `hreflang` set is 12 languages; ours is 3.

### Things it visibly gets wrong

1. **The desktop drag is cancelled the instant the cursor leaves the 700×700 box.** `onMouseleave` is
   bound to the same handler as `onMouseup`. Measured: dragging inside gave `rotate(-17.354deg)`;
   moving the pointer outside the container and continuing to sweep left it at
   `rotate(-17.354deg)` — **the Wheel simply stopped following.** [VERIFIED-BROWSER] Since you
   naturally grab near the rim of a disc that is inscribed in its own bounding box, this fires
   constantly. A pointer-capture (or listening for `pointerup` on the window instead) is the fix. If
   we build rotation, this is the first bug to not have.
2. **The 768–1023 px band is broken.** `-114%` resolves against a containing block that grows with
   the viewport, so the framing is only exactly right at ~390 px. At 768 px and 1000 px the Wheel's
   centre is 26–43 px *past* the left edge, so you lose the inner rings off-screen while a large
   empty area sits to the right of the Wheel. [VERIFIED-BROWSER]
3. **The touch rotation pivot is wrong.** `ge`/`pe` compute the finger angle as
   `Math.atan2(touch.clientY - el.offsetTop, touch.clientX - el.offsetLeft)` — mixing viewport
   coordinates with layout-offset coordinates, and using the element's top-left corner rather than
   its centre. Measured on mobile: `offsetLeft = -350, offsetTop = 24`, while the true on-screen
   centre is `(0, 762)`. [VERIFIED-SRC + VERIFIED-BROWSER] Combined with the 3× gain, touch
   rotation is not a physical grab at all; it is "flick to spin". Whether that reads as *broken* or
   merely as *a different model* I can't say without a human thumb (see Could Not Determine).
4. **`de()` rewrites all 130 Label transforms — plus their `id` and their truncated `text` — on every
   single `mousemove`.** Re-running text truncation and `textContent` writes at pointer frequency is
   a lot of layout churn for a flip that changes for at most a handful of Labels per frame.
   [VERIFIED-SRC] Our `arcsFor()` already re-derives 130 arcs per frame, so the budget is probably
   comparable — but if we adopt live flip correction, only the flip needs recomputing, and only for
   Labels near the boundary.
5. **Mobile is detected by user-agent, once, at setup.** Not touch capability, not viewport width,
   not a media query, and never re-evaluated. Two consequences [INFERRED from source, not tested on
   real hardware]: an **iPad is classified as desktop** (the tablet branch of the UA test is off), so
   its touch handlers all early-return and the mouse handlers are the only path — the Wheel may not
   be turnable on a tablet at all; and the CSS breakpoint (`lg` = 1024 px) and the JS branch (UA)
   can disagree, e.g. a narrow desktop window gets the mobile *layout* with the desktop *gesture*.
6. **The interactive Wheel has no accessibility story.** Measured: the live SVG carries only
   `class`, `width`, `height`, `style` — no `role`, no `aria-label`; and there are **zero** focusable
   or `role`-bearing elements inside it. [VERIFIED-BROWSER] It is mouse/touch-only. Selection is
   driven off `mouseup` on a `<path>`, so there is no keyboard path to a Selection. Our accessibility
   twin is a real advantage here, and the map is right to call Focus load-bearing for it.
7. **No URL state.** Rotation, selection and zoom are all ephemeral; nothing is shareable or
   restorable. Our Focus-in-the-share-URL is a capability they simply don't have.
8. **The onboarding wiggle appears not to fire.** In a fresh browser profile with empty
   `localStorage`, I sampled the container every 400 ms for the first 4 s of page life: the
   `.animate` class was never applied and the computed transform stayed `none`. [VERIFIED-BROWSER]
   The likely cause is a Vue lifecycle ordering bug — the parent sets `animateOnMount` in its own
   `onMounted`, which runs *after* the child's `onMounted` reads it — but that is [INFERRED]; I did
   not confirm it. Either way the affordance-teaching animation described in point 3 above is, in
   practice, invisible.
9. **~30 of 130 Labels are sideways at any moment** (§3, §4), which is the structural price of radial
   Labels plus a marker-less reading zone. They never fix this; you are expected to keep turning.

---

## What this implies for our tickets 03, 04 and 06

These are implications, not decisions. A prior-art finding is evidence.

### Ticket 03 — where rotation lives, and the upside-down Label

- **The naive-rotation failure mode is real and they hit it too.** Their `Z()` is our
  `placeLabel()`, flip and all. Confirmation that this is the right thing to have ticketed.
- **Live flip re-derivation demonstrably works.** Zero upside-down Labels measured across a full
  180° sweep on a production site. If we go that way, the shape is: keep the wedge-attached
  `rotate(θ)` untouched, and re-derive only the trailing `rotate(0|180)` against
  `(θ + rotation) mod 360`. That is a ~4-line change to `placeLabel()` plus a rotation input.
- **But it is a discontinuity, and it pops.** Measured: a 180° instantaneous inversion as a Label
  crosses 12/6 o'clock, at the moment the text is most vertical. With ~30 Labels near vertical at
  any time, that is a constant flicker during a drag. If we adopt it, we should decide deliberately
  whether to accept the pop, damp it (animate the flip), or defer it (only re-flip on gesture end).
- **`placeLabel()` computes against the *unrotated* angle and is called from `arcsFor()`.** So the
  cheap version is to thread rotation into the `View` and let `arcsFor()` do it — which keeps the
  pure-transformation property `geometry.ts` currently documents. That is a real argument for
  rotation living *in* the geometry rather than as a CSS transform on the SVG wrapper.
- **The third option nobody ticketed: don't correct at all, crop instead.** (§4.) If the reading
  zone is a half-plane (or less), and the Wheel is positioned so the reading zone coincides with the
  half where radial-outward text is upright, the flip never needs re-deriving. Worth putting in
  front of 03 explicitly.

### Ticket 04 — the reading zone / marker

- **They have no marker at all, and the reading zone is unmarked on desktop.** That is evidence that
  a marker is not strictly required for the gesture to be usable — but also that the reading zone is
  entirely implicit and undiscoverable, and their own copy has to say "turn" in bold to compensate.
- **Their mobile answer is that the viewport *is* the marker.** The reading zone isn't indicated; it
  is the only thing on screen. This is the strongest argument I found for 04 framing the reading
  zone as a *region of the layout* rather than as a *drawn indicator*.
- **3 o'clock is the natural reading zone for radially-laid-out Labels**, and it falls out of the
  geometry rather than being chosen. If we keep radial Labels, our reading zone is 3 o'clock too
  unless we deliberately choose otherwise.
- **Rotation must not be confusable with selection.** Their did-drag flag is the minimum; we have the
  harder version of this problem because our tap already means "Focus or settle" via
  `descendsInto()`.
- **The centre readout question (map: "Not yet specified") gets a data point.** They have no centre
  readout at all, so they dodge it. Our `.centre` is an HTML overlay — the fact that they put their
  selection list *outside* the Wheel entirely, in normal page flow, suggests keeping the readout
  fixed and non-rotating is at least defensible.

### Ticket 06 — mobile

- **The single most transferable idea is the half-viewport framing.** Wheel centre on the viewport's
  left edge, right hemisphere visible, no Label flip needed, no marker needed. It is cheap and it
  composes with rotation for free.
- **They never scale the Wheel down on a phone.** 700 px fixed, deliberately overflowing. That is the
  opposite of our ADR-0001 response to the same constraint (re-root so nine Labels fit). Both are
  coherent; ours preserves "see everything at this level", theirs preserves "the poster is the
  poster". The map already rules "replace Focus with pure zoom/pan" out of scope, and nothing here
  argues to reopen that — but the framing trick is separable from the re-rooting question and can be
  adopted without it.
- **Momentum plus 3× gain is their answer to "a thumb can only sweep so far".** If rotation lands on
  mobile, gain > 1 is a real design parameter, not an oversight. Our Rings question interacts:
  with one ring, a 4.4°-per-wedge problem becomes ~40°, and 1:1 may well be right.
- **The same author chose drill-down for his native phone app.** This is the sharpest evidence in
  the whole document, because it is the same person, the same taxonomy, and a phone-first brief:
  <https://apps.apple.com/us/app/the-feelings-wheel/id6756626873> — *"Start broad with emotions like
  happy, surprised, angry, or fearful, then tap deeper to find what truly fits."* 5.0★ from 35
  ratings. The rotation model appears to be a *web-poster* answer, not a *phone* answer. That is a
  point in ADR-0001's favour, not against it.
- **UA sniffing for the platform branch is a mistake to not repeat.** Their CSS breakpoint and JS
  branch can disagree. Whatever we do, one source of truth (our existing `wide.current` media query)
  should drive both layout and gesture.

---

## Could not determine

Honest gaps. None of these were established, and I am not going to guess at them.

1. **How the touch rotation actually feels under a real thumb.** I drove it with synthesised
   `TouchEvent`s in an emulator. The 3× gain, the wrong pivot and the momentum are all confirmed in
   source and in measured transforms, but whether the result feels like a satisfying flywheel or
   like a wheel that runs away from you is a question about human hands. **Needs a human to open
   <https://feelingswheel.app/> on a real phone and turn it.**
2. **Whether the Wheel can be rotated at all on an iPad.** The UA test's tablet branch is off, so an
   iPad should take the desktop path, whose `mousedown`/`mousemove` handlers are not reliably driven
   by iOS Safari touch. This is a strong reading of the source but I could not test it. **Needs a
   human with an iPad**, or a real-device cloud.
3. **Whether tapping a wedge selects it on a real touch device.** I confirmed selection works via a
   synthesised `mouseup` on a wedge, and the handler is bound to `mouseup` rather than `click` or a
   touch event. Whether iOS/Android synthesise that `mouseup` after a tap — given `touchmove` calls
   `preventDefault()` — I did not establish. **Needs a real device.**
4. **Whether there is a public repository.** I found the author's GitHub (<https://github.com/paprotsky>)
   but no repository for this app, and the bundles carry no source maps and no repo URL. My
   conclusion is that it is closed-source, but I did not exhaustively search.
5. **Any changelog, blog post or design write-up explaining *why* rotation.** I searched and found
   none. The App Store version notes are the only release history I located, and they describe the
   native app, not the web one.
6. **User reception of the rotation model.** The iOS listing shows 5.0★ from 35 ratings with no
   review text surfaced, and I could not retrieve the Google Play listing content
   (`com.roman703.feelingswheel`) — the fetch returned only Play Store chrome. So I have **no
   evidence at all** about whether real users find turning pleasant or annoying.
7. **Behaviour at very large viewports, in dark mode, and in the RTL-ish locales.** Only tested
   light mode, English, at the widths tabulated in §6.
8. **How the printable PDF and the "Fullscreen" page relate to the main Wheel in practice.** I read
   the zoom slider's implementation but did not evaluate whether 0.5×–1.5× is actually enough range
   to be useful.
9. **Whether their `de()` recompute causes measurable jank on a low-end phone.** It is desktop-only,
   so probably moot — but I did no performance measurement anywhere in this investigation.

## Sources

- <https://feelingswheel.app/> — the artifact; served HTML and JS/CSS bundles inspected directly
- <https://feelingswheel.app/en/feelings-wheel-full-screen> — the zoom page
- `https://feelingswheel.app/build/assets/FeelingsWheel-CPzlRkI7.js` — the wheel component
- `https://feelingswheel.app/build/assets/FullScreen-DZFfvaG2.js` — the zoom slider
- `https://feelingswheel.app/build/assets/AppLayout-BQKQJ_GX.js` — the UA mobile test
- `https://feelingswheel.app/build/assets/AppLayout-DH9s5aJR.css` — `rotateBackAndForth` keyframes
- <https://apps.apple.com/us/app/the-feelings-wheel/id6756626873> — the same author's native iOS app
- <https://romanpaprotsky.com/> and <https://github.com/paprotsky> — the author
- <https://observablehq.com/@d3/zoomable-sunburst> — the model ADR-0001 describes, for contrast
- Other implementations surveyed but not inspected in depth: <https://openemotionwheel.com/>,
  <https://allthefeelz.app/>, <https://emotionwheel.app/>, <https://www.afeelwheel.com/>,
  <https://github.com/epleaner/emotions-wheel>

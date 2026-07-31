# 05 — Does a reader control how many rings are drawn?

**Type:** grilling — _retyped from `prototype`._ It was typed to compare two interaction models and
there are no longer two; §3's arithmetic is settled on paper and needs arguing, not building.

**Blocked by:** 01 — resolved, and it gave this ticket nothing. See **What 01 handed over** below.

**Status:** resolved

> **Cut down after the descope**, the way 01 was. This was written as _"Do optical zoom and Rings
> merge into one control, or stay two?"_ — and **both** of its options presuppose optical zoom, which
> the descope took. What survives is the question underneath them: does a reader control Rings at
> all? The original text is kept under **As originally written**.

## Question

`rings` — how many levels are drawn outward from the Focus — is a breakpoint, not a choice:

```
const rings = $derived(wide.current ? 3 : 1);   // +page.svelte:102
```

The ask was to make it a reader's choice, _"so a phone can show the whole Wheel small"_. With no
optical zoom to fold it into, there is no longer a question of one control or two. There is only:

### 1. Is it a reader's control at all?

The null answer is that `wide.current ? 3 : 1` stays, and this ticket closes having decided that the
breakpoint was right. That is a real possible outcome and this ticket should be willing to reach it —
the two tickets before it both closed by ruling that something chartered was not wanted.

What would argue for it: someone on a phone who wants the poster view, and someone on a desktop who
finds three rings too dense at the Cores.

### 2. What is the control, if there is one?

The original assumed the answer was "the zoom gesture, or a slider beside it". Neither exists. So the
control has to be its own thing — a stepper, a two-state "show more / show less", a segmented 1/2/3
— and it has to find somewhere to live on a page that `wheel-prune` deliberately stripped to the
Wheel, the title and a header. Adding a control back is against that grain and needs to earn it.

### 3. Does the Framing move with it? — **and this is now the crux**

The map flagged this as fog: _"If Rings becomes a reader's control, a phone showing 3 rings and a
phone showing 1 may not want the same frame."_ It is worse than fog. It may be the whole answer.

**The original ask cannot be met by Rings alone.** A phone is framed on the right half-disc (ticket
11). Setting `rings: 3` there shows three rings *of half the Wheel* — never the whole Wheel, at any
ring count, because it is the Framing that crops it and not the ring count. To actually "show the
whole Wheel small" on a phone, the Framing has to go back to `WHOLE`.

And that is exactly where the arithmetic bites:

| Phone at 390px | Radius | Tertiary arc |
| -------------- | ------ | ------------ |
| `HALF` (today) | 262px  | ~17px        |
| `WHOLE`        | 179px  | **12px**     |

The ~17px this ticket is told to plan against exists **only because the half-disc gave up half the
Wheel**. Ask for the whole disc back and you are returned precisely to ADR-0001's 12px — _"below any
legible font size, with no typographic trick available"_ — which is the exact number the ADR used to
rule the whole-Wheel mobile view out in the first place.

So the shape of the answer may be forced: a reader can have the whole Wheel on a phone, or they can
have legible Labels, and Rings is not the lever that trades between them. Test that before assuming
it, but do not prototype "show me everything small" as though 11 had made it viable. It did not — it
made the *half* viable.

### 4. Still to settle, if 1 comes out yes

- Does a chosen ring count survive a Focus change, or reset with it?
- Does the breakpoint stay the *initial* value that a reader then overrides?
- Is there a floor below which Labels are simply left off? `MIN_LABEL_ARC` and `MIN_FONT_SIZE` in
  `geometry.ts` already do this, so the unreadable band already degrades gracefully — the question is
  whether a band of unlabelled colour is worth offering or is just noise.
- Where does a chosen value live? Not the URL — there isn't one (ADR-0005). The precedent set by
  `wheel-prune` is `localStorage` for a preference, and nothing at all for a position. Which is this?

## Notes

HITL. Use `/grilling`, then `/domain-modeling` if §1 comes out yes and a term has to be coined.

**Retyped from `prototype`, deliberately.** It was a prototype ticket because it compared two
interaction models — and the descope took both. What is left does not want building: §1 is a
judgement about whether anyone wants the control, and §3 is arithmetic that is already done and only
needs arguing with. Building either model to find out would be prototyping a conclusion the numbers
have already reached.

The bar for reopening it as a prototype: if §3's table is disputed on grounds a measurement could
settle — say, that 12px of arc is more legible in practice than ADR-0001 assumed, or that the
right-hand space on a phone changes the fitted radius — then build that one measurement rather than
either interaction model.

Answering this unblocks 09, and it is what ADR-0001's fate turns on. _(It once unblocked 06 and 07
too; both are closed — 06 descoped with the gesture work, 07 dissolved when the URL was deleted.)_

**The figure to plan against is 17px, not 24px.** This ticket originally recorded half-disc framing
as buying **twice the diameter**, taking a Tertiary from 12px to ~24px. Ticket 11's Answer corrected
it: a *fitted* half-disc takes its radius from the box's height, so the gain is the column's
height-to-width ratio, not a flat 2×. Measured on a 390×844 phone, radius goes 179px → 262px, about
**1.46×**, i.e. **~17px**. The 24px figure is dead.

**What this owes 09.** ADR-0001 records _"the at-a-glance overview is genuinely lost on mobile. This
is a real cost."_ If §3's table holds, this effort does **not** give that back, and 09 should be told
so plainly — that is the difference between amending ADR-0001 and leaving it alone.

**Prior art, from ticket 02:** `feelingswheel.app` has no gesture zoom at all. Its only zoom is a
`0.5×–1.5×` range slider on a separate `/full-screen` page, decoupled from rotation and **absolute
rather than focal** — it scales about the element's origin and does not zoom toward a point you
indicate. So the reference is no help on the one-control-versus-two question; it ducked it by putting
zoom on another page. Its author's own phone app drills down instead of scaling, which is evidence
for §1's null answer as much as ADR-0001's.

## What 01 handed over

**Nothing, by design.** 01 was chartered to name this thing before this ticket had to discuss it, and
it ruled that no term is warranted yet: `rings` stays implementation vocabulary and `CONTEXT.md`
gains no entry. Its reasoning was that a word for a hard-wired constant is a word for nothing, and
that whether anyone can choose it is precisely what this ticket has not decided.

So the naming is **this ticket's output**, and only if it rules that a reader controls it. Two things
01 found that constrain the choice:

- **`Ring` is already discouraged in this vocabulary.** `CONTEXT.md` puts "ring 1", "ring 2" and
  "ring 3" on Core's, Secondary's and Tertiary's `_Avoid_` lists. Promoting `Rings` contradicts them
  in the default view, where "ring 1" means exactly the Cores — so it costs an amendment to three
  existing entries, not just a new one.
- **A non-colliding word costs a rename.** _Horizon_, _Reach_ and the like sidestep that, but `rings`
  runs through `geometry.ts`, `Wheel.svelte` and `+page.svelte`, and nothing else in this repo lets
  code and vocabulary diverge.

Whatever it is called, it must not read as a synonym for **Focus**. Focus is which Node fills the
circle; this is how far past it we draw. Someone conflating them reads "three rings" as "three levels
down", which is a different thing.

---

## Answer

**No reader's control — but the desktop default was wrong, and is changed.** `wide.current ? 3 : 1`
becomes `wide.current ? 2 : 1`. Nothing is added to the page.

### The measurements this turns on

Run against the real `geometry.ts` and `Wheel.svelte`'s `fontSize()`, Portuguese, rendered px:

```
DESKTOP (1440x900, WHOLE)          n     min   median   max
  Cores view, rings 3 (was)       130    7.8    12.1    15.0
  Cores view, rings 2 (now)        48   13.6    20.4    22.5
  Cores view, rings 1               7   40.9    45.0    45.0
  focused on a Core                18   10.8    18.8    20.8
  focused on a Secondary            2   23.0    34.4    34.4

PHONE (390x844, HALF, rings 1 — unchanged)
  Cores view                        7   29.5    32.6    32.6
  focused on a Core                 6   19.8    27.2    30.0
  focused on a Secondary            2   16.6    24.9    24.9

PHONE at ring counts it will not get
  Cores view, rings 2              48    9.8    14.8    16.3
  Cores view, rings 3             130    5.6     8.8    10.9
PHONE, whole disc — what "show it all" would have cost
  Cores view, rings 3             130    3.8     6.0     7.3
```

### §3 — the whole Wheel on a phone is dead, and ADR-0001 is confirmed rather than re-litigated

No ring count shows the whole Wheel on a phone, because it is the Framing that crops it. Returning
to `WHOLE` drops the radius from 262px to 179px and the Labels to **3.8–7.3px, median 6.0** — half
the size of the desktop poster that was itself judged too small. ADR-0001 ruled this out on 12px of
arc; the ruling holds, and now has the font sizes it never had.

**The effort does not give back the at-a-glance overview ADR-0001 mourned.** 09 should be told
plainly rather than left to infer it.

### §1 phone — more rings under the half-disc earns nothing

`rings: 3` under `HALF` is 5.6–10.9px, median 8.8. A reader gains ~41 Tertiaries they can barely
read and — per ADR-0006 — cannot tap, since a Tertiary is not interactive. It is paid for by every
Secondary getting thinner. The model is drill-down, and the Tertiary you want is one tap away at
19.8–30px.

### §1 desktop — no control, but the default was the bug

`rings: 3` at the Cores was the only state in the app with unreadable type: 7.8px at worst,
`Sobrecarregado` drawn as a smudge. `rings: 2` gives 13.6–22.5px while still showing every Core and
every Secondary — 48 Nodes, a real overview.

**The change touches exactly one view.** `ringsBelow` clamps to what the tree has left
(`max(1, min(rings, 2 - depth))`), so a Focus on a Core already ran at two rings and a Focus on a
Secondary at one. Three and two differ only when nothing is focused. That is why this is a one-line
change and not a re-tuning.

A reader's control was rejected because the case for it evaporated once the default was fixed: the
phone side is illegible at any count above 1, and the desktop side is a default, not a taste. Adding
a control would have put chrome back on a page `wheel-prune` stripped to the Wheel, to let a reader
choose between one good state and one bad one.

### Ruled out along the way

- **Wrapping long Labels onto two lines.** 62 of 82 Tertiaries are bound by label length against ring
  thickness, not by arc, so wrapping looks like the obvious fix. It is not: two lines halve the
  arc-height budget, and `Sobrecarregado` goes from 7.8px on one line to **7.35px** on two. At poster
  density the arc binds the moment you wrap.
- **`MIN_FONT_SIZE` as a floor.** §4 assumed it protects small screens. It cannot: it is `0.019` in
  *Wheel units*, so it scales with the box — 5.0px on a phone, 6.9px on a desktop — and suppressed
  **zero** Labels in every configuration measured. It is a relative threshold doing a job that needs
  an absolute one. **Not fixed here** — see What this hands on.

### §4, the settle-ups

Moot. There is no chosen value, so nothing survives a Focus change, nothing overrides a default, and
nothing needs storing. The floor question is answered above and handed on.

### What this hands on

- **09** gets two things. ADR-0001's _"desktop opens the same component already expanded"_ is now
  falsified by this effort's own change rather than only by Framing — and the ADR's headline
  consequence, _"the at-a-glance overview is genuinely lost on mobile"_, is **confirmed, not
  reversed**. That is the difference between amending ADR-0001 and leaving it alone, and 09 now has
  the numbers to rule with.
- **A new ticket is owed** for `MIN_FONT_SIZE`: a unitless threshold cannot protect a small viewport,
  and its own comment claims it does. Out of scope here — it needs its own measurement pass across
  framings and locales.
- **The build exception was taken a second time.** See the map's premise; this is recorded there.

---

## As originally written

> # 05 — Do optical zoom and Rings merge into one control, or stay two?
>
> ## Question
>
> The heaviest question on the map, and the one most likely to reshape the rest of it.
>
> Rings — how many levels are drawn outward from the Focus — is currently a breakpoint, not a choice:
> `const rings = $derived(wide.current ? 3 : 1)` in `+page.svelte:36`. The ask is to make it a
> reader's choice, so a phone can show the whole Wheel small. There are two ways to give it to them,
> and they are not variations of the same design.
>
> **Two controls.** Optical zoom scales the rendered poster; a separate control says how deep it
> draws. Orthogonal, predictable, honest about the fact that these are different things. Costs a
> second control and a reader who has to understand the difference between "bigger" and "deeper".
>
> **One control.** Rings falls out of the zoom level, the way a map's detail falls out of its scale:
> zoom out and you see all three rings small; zoom in and outer rings appear as they become legible.
> One gesture, no explaining, and it makes "show me everything, small" the natural resting state
> rather than a mode. But it couples optical scale to tree depth, which means `arcsFor()` is
> re-deriving arcs *and* changing how many exist during a live pinch, and it takes the reader's
> explicit control away — they can no longer say "three rings, but small".
>
> If the answer is **one control**, this is the centre of the effort and rotation is a sideshow. If it
> is **two**, this is a smaller feature and rotation stays the headline. That is why four tickets hang
> off this one.
>
> Also settle:
>
> - Does a chosen Rings value survive a Focus change?
> - Does the breakpoint default stay as the *initial* value even if the reader can override it?
> - At `rings: 3` on a 360px phone, a Tertiary is 12px of arc (ADR-0001). Is it drawn as an
>   unreadable band you zoom into, or is there a floor below which Labels are simply left off — which
>   `MIN_LABEL_ARC` and `MIN_FONT_SIZE` already do?
>
> Notes: HITL. Use `/prototype`. Both models want building — this is a comparison, not a validation
> of a favourite.

**What voided what.** Both branches of the central question died with the optical layer: "one
control" folds Rings into a zoom level that does not exist, and "two controls" pairs it with an
optical zoom that does not exist either. The stakes framing went with them — _"rotation is a
sideshow"_ / _"rotation stays the headline"_ names a rotation that was descoped, and _"four tickets
hang off this one"_ is now one, ticket 09. Of the three "Also settle" bullets, the first two survive
verbatim and the third loses its "band you zoom into" half.

What survives intact is the question the two options were competing to answer, and it turns out to
have a harder edge than either of them: **§3**, where the whole Wheel on a phone costs the legibility
the half-disc bought.

The Notes' stale arithmetic (24px) and stale unblocks-list (06, 07) were corrected separately, in the
commit that resolved 01.

**The phone half of this is reversed by ADR-0010 — on evidence this ticket could not have had.**
"The phone keeps one ring" was correct against the framing that existed: a second ring under the
half-disc is 11.3px median, worse than the desktop three-ring state this ticket had just killed at
12.1px. Nothing about that measurement was wrong.

What it could not see is that the half-disc's radius was an accident rather than a constraint. A
frame 2 units tall forces a box twice as tall as it is wide, which has to be fitted to the screen's
height — so the Wheel sat in 226px of a 398px column with the rest empty. At a 1.2-unit frame the
width binds instead, the radius reaches 380px, and the same second ring arrives at **19.1px median**,
against the desktop's 19.8px.

So the ruling stands where it was argued — no reader's control over rings, and three is still dead —
and the phone's count moves from one to two because the thing it was measured against moved. The
ticket's real finding survives intact: ring count is decided by measurement, not by screen size.

Its §3 finding also survives and is sharpened. The whole disc on a phone was rejected at 6.0px
median; measured again at one ring it is 24.8px for the 7 Cores, which is legible — but it cannot
carry a second ring (11.2px), so it loses to the fan on exactly the axis this ticket cared about.

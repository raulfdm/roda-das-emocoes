# 01 — Name what shipped, and name what Rings becomes

**Type:** grilling

**Blocked by:** —

**Status:** resolved

> **Cut down after the descope.** This was written as _"Name the Viewport"_, against a map heading
> for an optical layer with scale, pan and rotation. Ticket 11 shipped a static Framing instead and
> the gesture tickets closed, which voided two of the four questions below outright and hollowed a
> third. The original text is kept under **As originally written** — this ticket answers less than it
> was chartered to, and the record should say so rather than quietly shrink.

## Question

Two things, and the second is the one with a customer waiting.

### 1. Is there a layer above the Framing, or is Framing the whole of it?

`Viewport` was the working name for an optical layer with three degrees of freedom. One degree of
freedom shipped, as a constant: a phone gets `HALF`, a desktop gets `WHOLE`, chosen off a breakpoint
and never touched again. `CONTEXT.md` already carries **Framing** for exactly that rectangle, with an
`_Avoid_` list that reserves "Viewport" — deliberately, to stop the narrow word being borrowed for
the larger idea before this ticket ruled.

So the ruling is: does the larger idea still exist?

- If **no** — `Viewport` never enters `CONTEXT.md`, and Framing's entry loses the forward reference
  to this ticket. The `_Avoid_: Viewport` line stays, but as a plain warning against a tempting
  synonym rather than a placeholder for a term that is coming.
- If **yes** — what is the layer, given it currently has one static member? Naming a category that
  holds exactly one thing, with no prospect of a second, is the **Speculative Generality** smell in
  vocabulary form.

### 2. What is Rings called when a reader controls it?

The live one. `rings` is `$derived(wide.current ? 3 : 1)` — how many levels are drawn outward from
the Focus. Ticket 05 asks whether a reader gets to choose it, and 05 cannot state its own question
without a word for the thing being chosen.

- Is it **Rings**, promoted from an implementation detail to a domain term with an `_Avoid_` list?
- Is it **Depth** — which reads better as a reader's control but collides with `node.depth`, a
  different quantity already in the code?
- Something else, and what does it avoid?
- Does it belong in `CONTEXT.md` **now**, or only if 05 decides a reader really does control it? A
  term for a hard-wired constant may be a term for nothing.

The trap to watch: whatever this is called must not read as a synonym for **Focus**. Focus is which
Node fills the circle; this is how far past it we draw. Someone who conflates them will read
"three rings" as "three levels down", which is a different thing entirely.

## Output

A `CONTEXT.md` diff — each new term with its `_Avoid_` list, in the voice of the existing entries —
or an explicit finding that no new term is warranted, and why. A ruling that adds nothing to
`CONTEXT.md` is a real answer here, not a failure to reach one.

Whichever way it goes, Framing's entry loses its "still open; see this ticket" note, because after
this it is not.

## Notes

Still blocks 05, and through it 09 and 10 — but for less than it used to. What 05 needs from here is
the word in §2 and nothing else; §1 is tidying the vocabulary after a descope.

Use `/grilling`, then `/domain-modeling` to land the diff. HITL: this is a naming decision, and
naming decisions in this repo are the user's.

**Prior art in this repo for the "no new term" answer:** the descope retired **Selection** outright
rather than repurposing it (ADR-0006), and `CONTEXT.md` records the retirement with a note explaining
that the word is retired rather than free. That is the shape a negative ruling takes here.

---

## Answer

**No new terms. `CONTEXT.md` gains nothing.** Both questions ruled negative, for related reasons.

### §1 — Framing is the whole of it

There is no layer above the Framing, and `Viewport` never becomes a term.

The map's own settled premise names three orthogonal axes — Focus, Rings, Framing — so the surviving
candidate for "the layer" was never the dead optical one. It was the pair **{Rings, Framing}**, which
today is two lines of the same breakpoint:

```
const rings   = $derived(wide.current ? 3 : 1);
const framing = $derived(wide.current ? WHOLE : HALF);
```

Both are props to `<Wheel>`, both answer "how is the Wheel drawn for this screen" as against Focus's
"which Node". That is a real pair. It is also, on the evidence, an accidental one: if 05 hands Rings
to the reader, Framing stays screen-derived and Rings does not, and the pair splits. A term binding
them would be recording today's implementation, not the domain — **Speculative Generality** in
vocabulary form, naming a category with one-and-a-half members and no prospect of a second.

Deciding it: **"viewport" already means the browser's viewport in this codebase** — `app.html:5`,
`Wheel.svelte:185`, `+page.svelte:285`, and some twenty measurements in
`research/feelingswheel-app.md`. Promoting it would make one word mean two things in the same files.

`CONTEXT.md`'s Framing entry keeps its definition and `_Avoid_` list untouched; only the trailing
note changes, from reserving a term to recording that there is none.

### §2 — Rings stays implementation vocabulary

No term for it, and no term for what it becomes. If 05 rules that a reader controls it, coining the
word is **05's output**, against a referent that exists.

Two findings pushed this:

**`Ring` is already a discouraged word here.** `CONTEXT.md` puts it on three `_Avoid_` lists — Core
avoids "ring 1", Secondary "ring 2", Tertiary "ring 3". Promoting `Rings` produces a contradiction in
the default view, where "ring 1" means exactly the Cores. It would require amending three existing
entries to add a fourth, and the alternative — a non-colliding word like _Horizon_ or _Reach_ —
would need `rings` renamed through `geometry.ts`, `Wheel.svelte` and `+page.svelte` so that code and
vocabulary do not diverge, which nothing else in this repo does.

**This ticket's stated premise was false.** It claimed 05 "cannot state its own question without a
word for the thing being chosen". 05 is already written, and states it fine as a common noun: _"Rings
— how many levels are drawn outward from the Focus — is currently a breakpoint, not a choice."_ So
01 was never the blocker it was charted as. It resolves by lifting the block rather than satisfying
it.

The reasoning behind the negative: `CONTEXT.md` names what the product is *about*. `rings` is
hard-wired, never spoken to a reader, and appears in no UI text. It becomes a domain concept when
someone can choose it, and whether anyone can is precisely what 05 has not decided.

### What this hands on

- **05 is the frontier**, unblocked. If it rules for a reader's control, it owns the naming, and the
  `ring 1/2/3` collision above is its inheritance.
- **09 loses an ADR candidate.** Its docket lists "that the Wheel has a Viewport at all" among the
  ADRs this effort might owe. There is no Viewport, so there is nothing to record.
- **Whether the descope itself owes an ADR is left to 09**, which owns that question. Deciding it
  here would be the same trespass 11 declined to make on ADR-0001.

---

## As originally written

> ## Question
>
> What do we call the optical layer, and what do we call its three degrees of freedom?
>
> `CONTEXT.md` defines the Wheel's language and every term carries an _Avoid_ list. This effort adds
> a concept that collides with words already spoken for — "zoom" currently means moving the Focus,
> and "Focus" itself is defined as "the Node currently expanded to occupy the full circle". A
> Viewport that also zooms will wreck that unless the words are settled first.
>
> Resolve:
>
> - The name for the layer as a whole. `Viewport` is the working term and is not yet in `CONTEXT.md`.
> - The name for each axis: scale, pan, rotation. Is rotation a _Turn_? A _Bearing_? Is scale
>   _Magnification_, to keep "zoom" free — or is "zoom" retired entirely as ambiguous?
> - The name for what Rings becomes once a reader controls it. `CONTEXT.md` has no term for it today;
>   the code calls it `rings` and derives it from a breakpoint.
> - Whether "the readable region" — the part of the Wheel currently in a comfortable orientation —
>   needs a name of its own, or whether it only exists once ticket 04 says what it is.
>
> Output is a `CONTEXT.md` diff, each new term with its _Avoid_ list, in the same voice as the
> existing entries.
>
> ## Notes
>
> This blocks most of the map because the other tickets cannot state their own questions precisely
> without these words.

**What voided what.** The axis-naming bullet died with tickets 03, 04 and 06 — there is no scale, pan
or rotation to name. The "readable region" bullet was contingent on 04 defining the region, and 04
closed out of scope. The layer-naming bullet survives only as the reduced §1 above. The Rings bullet
is untouched, and is now the ticket's centre of gravity.

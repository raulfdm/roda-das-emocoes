# 09 — ADR-0001: amended, superseded, or untouched?

**Type:** grilling

**Blocked by:** 05

**Status:** resolved

## Question

ADR-0001, _"The Wheel zooms; it is not rendered whole"_, rules out the whole-Wheel mobile view on one
specific ground:

> 82 Tertiaries over 360° is 4.4° per wedge, which on a 360px-wide screen is **12px of arc** — below
> any legible font size, **with no typographic trick available**.

A Viewport with scale and rotation is not a typographic trick, but it is an answer to the same
problem the ADR was solving, and it makes "show me all of it, small" a coherent thing to offer. The
ADR's reasoning is not refuted — 12px is still 12px at fit-to-screen — but its conclusion may no
longer be the whole story.

Decide:

- **Amended, superseded, or untouched?** Amended if the Viewport is an addition the ADR did not
  foresee but does not contradict. Superseded if the reader can now genuinely choose the whole Wheel
  on a phone and the ADR's conclusion is simply no longer what the app does. Untouched if 05 landed
  on two separate controls and the mobile default never changes.
- **The consequence that matters most.** ADR-0001 records _"The at-a-glance overview is genuinely
  lost on mobile. This is a real cost."_ If this effort gives it back, that is the headline, and it
  deserves saying in the ADR rather than being buried in a spec.
- **What new ADRs this effort owes.** Candidates: ~~that the Wheel has a Viewport at all~~ (struck —
  01 ruled there is no Viewport and no layer above the Framing, so there is nothing to record);
  ~~where rotation lives (03)~~ (struck — descoped); ~~whether Viewport is shareable state (07)~~
  (struck — ADR-0005 deleted the URL). Every original candidate is gone. What is left in its place:
  does the **descope itself** owe an ADR — that the Wheel gets a static Framing and no optical layer
  — and is that load-bearing enough to be an ADR rather than spec detail? 01 deliberately left this
  here rather than settling it in passing.

## Notes

Blocked by 05 alone: whether ADR-0001 moves at all turns entirely on whether the whole Wheel becomes
reachable on a phone.

**Evidence from ticket 02 that cuts toward leaving ADR-0001 alone.** The author of
`feelingswheel.app` — the rotating, whole-poster, no-drill-down reference this effort was pointed at
— shipped a **native phone app that drills down instead**. Its App Store copy: *"Start broad with
emotions like happy, surprised, angry, or fearful, then tap deeper to find what truly fits."* Same
person, same taxonomy, phone-first brief, and he arrived at ADR-0001's model rather than his own web
one. That is about as direct a piece of evidence as this space offers that **rotation is a
web-poster answer and drill-down is the phone answer** — which is exactly what ADR-0001 claims.

It does not settle anything on its own; he may simply have followed platform convention. But if 05
lands on "the whole Wheel is now viable on a phone", this is the strongest thing arguing the other
way, and the ADR should engage with it rather than quietly overturn a decision that independent prior
art keeps re-deriving.

Write the ADRs here, in `docs/adr/`, in the voice of the existing four — a claim as the title, the
reasoning, then Consequences.

## Comments

**The conflict is now concrete, not hypothetical.** Ticket 11 landed half-disc framing on phones, and
in doing so falsified one of ADR-0001's stated consequences directly:

> "Desktop opens the same component already expanded... **The two platforms differ only in starting
> depth, not in code.**"

They now differ in Framing as well — `+page.svelte` picks `WHOLE` or `HALF` off the same breakpoint
that picks the ring count, the cropped box has its own CSS, and the phone renders a Path readout
above the Wheel that the desktop never draws.

**No ADR was written for this, deliberately.** Deciding ADR-0001's fate is this ticket's whole job,
and this ticket is blocked on 05. Writing an amendment while landing 11 would have answered 09 in
passing, from the wrong seat. So the code went in and the debt is recorded here instead.

What 09 now has to settle has grown by one line: not just whether ADR-0001's *arithmetic* survives
(11 improved it, but by ~1.46x rather than the 2x the ticket hoped — see 11's Answer), but whether
its "differ only in starting depth" consequence is amended or dropped outright.

---

**The pruning pass widens that same crack, and settles nothing here either.**
`.scratch/wheel-prune/` went at a first-paint flash — a desktop reload was painting a half-disc with
7 Cores and then replacing it with a whole disc and 130 — and its first answer was to prerender
**both** Wheels, one `lg:hidden` and the other `hidden lg:block`, with CSS choosing before the first
paint. That shipped, and then ADR-0007 took it back: no media query can answer for the Locale, which
lives in `localStorage`, and Portuguese turning into English a frame later was the flicker that
actually got noticed. The page now waits behind a loader and renders **one** `<Wheel>`.

So the divergence 09 has to weigh is *smaller* than the version recorded here before, not larger.
The two platforms still differ in starting depth and in Framing — `+page.svelte` picks `WHOLE` or
`HALF` and `3` or `1` off one breakpoint, and the cropped box has its own CSS and its own Path
readout — but they are no longer two separately rendered subtrees. One component, one render path,
two sets of arguments.

Whether that reads as an ADR-0001 amendment, a supersession, or simply spec detail that never
belonged in a consequences list is **still 09's call**. It is noted, not answered.

The episode is itself evidence for the ruling, and 09 should weigh it: the "two prerendered subtrees"
divergence was real for exactly one session before being undone. A Consequences list that has to be
rewritten every time an implementation detail moves may be recording the wrong altitude of thing.

**A third ADR-0001 consequence has lost its subject.** ADR-0001 lists _"Focus and Selection must stay
distinct in the state model — someone passes through many Focuses on the way to one Selection."_
Selection is deleted (ADR-0006); there is one piece of state and nothing to keep distinct from it.

That makes three of ADR-0001's four consequences now false or subjectless — the platforms differ in
more than starting depth (twice over), and Focus/Selection distinctness has no referent. Only the
tap-target arithmetic and the "at-a-glance overview is lost on mobile" cost still stand as written.
09 should probably now be asking whether ADR-0001's *Consequences* section is worth amending at all,
or whether the decision itself — the Wheel zooms, it is not rendered whole — is the only part that
was ever load-bearing.

**05 resolved, and it hands 09 measurements rather than arguments.** Two things bear directly on the
ruling:

**The headline consequence is confirmed, not reversed.** ADR-0001 records _"the at-a-glance overview
is genuinely lost on mobile. This is a real cost."_ 05 measured what getting it back would cost: the
whole disc on a 390px phone puts Labels at **3.8–7.3px, median 6.0** — half the size of a desktop
poster that 05 judged too small at 12.1px. No ring count changes this, because it is the Framing that
crops a phone, not the ring count. So this effort does **not** give the overview back, and the bullet
in the Question above — _"if this effort gives it back, that is the headline"_ — resolves to no.
ADR-0001's arithmetic and its conclusion both survive contact with ticket 11's improvement.

**But a fourth consequence has now been falsified, by this effort's own hand.** ADR-0001 says
_"Desktop opens the same component already expanded"_ — and 05 changed the desktop default from three
rings to two, because three was the only state in the app with unreadable type (7.8px at worst). The
desktop no longer opens fully expanded. That is not a Framing difference or a rendering-strategy
difference; it is a change to the thing ADR-0001 describes.

So the tally the comment above reached — three of four consequences false or subjectless — is now
four of four, and one of them was falsified deliberately, with measurements, in the effort 09 is
meant to be ruling on. That strengthens the reading that ADR-0001's *Consequences* section was
recording implementation detail at the wrong altitude, and that only its decision — the Wheel zooms,
it is not rendered whole — was ever load-bearing. **Still 09's call.**

**ADR-0005 was written, and it is not this ticket's.** _The Wheel's place is not addressable_
records the URL's deletion. It reverses a spec section rather than an ADR and touches nothing
ADR-0001 claims, so writing it did not trespass on 09 the way an ADR-0001 amendment would have. The
one thing it does hand over: 07 is gone, so the "what new ADRs this effort owes" bullet in the
Question above has one fewer candidate.

---

## Answer

**Amended in place. The decision stands; three of its four consequences do not.** And one new ADR is
owed, not three.

### ADR-0001 — amended, not superseded

Superseding would have been wrong. Supersession is for a decision that was reversed, and this one was
vindicated: the effort chartered to make "show me all of it, small" viable measured what that would
cost and found ADR-0001's arithmetic intact. See ticket 05's Answer for the numbers.

What was wrong was everything *around* the decision, so a `## Correction` section goes into
`docs/adr/0001-*.md` in ADR-0003's style — original text untouched, the correction beneath it.

**The finding that shaped the whole ruling: ADR-0001 undercut its own title from the day it was
written.** The title is _"The Wheel zooms; it is not rendered whole"_. Consequence 2 then grants
_"desktop opens the same component already expanded, so the poster view survives"_ — and the poster
**is** the Wheel rendered whole, all 130 Nodes across three rings. The ADR forbade a thing and then
permitted it one paragraph later, on the platform where the constraint did not bite.

That exception is now gone, and nobody set out to remove it. 05 dropped the desktop to two rings on
typographic grounds. **Nothing renders the Wheel whole any more, so ADR-0001's title is more true
today than when it was written.**

Consequence by consequence:

| # | State |
| - | ----- |
| 1 | **Partly subjectless.** Cores and Secondaries hold, and ≤9 Labels on a phone holds. But a Tertiary is not interactive (ADR-0006), so "534px (Tertiaries)" is a tap target for a control that does not exist. |
| 2 | **False**, and self-contradicting as above. The platforms differ in Framing, not only in depth, and "expanded" now means two rings. |
| 3 | **Intact and strengthened.** Confirmed by measurement — the whole disc on a phone is 6.0px median. |
| 4 | **Fully subjectless.** Selection is deleted (ADR-0006). |

### The consequence that mattered most: no headline

The Question's second bullet asked what happens _"if this effort gives back the at-a-glance
overview"_. It does not. 05 measured the recovery cost at 3.8–7.3px, median 6.0 — half the size of a
desktop poster already judged too small — and no ring count changes it, because a phone is cropped by
its Framing rather than by its depth.

**The direction of travel was the surprise.** The gap between the platforms did narrow, but not
because a phone gained an overview. Because the **desktop gave one up**. That belongs in the
Correction and it is not something any ticket predicted.

### What this effort owes: one ADR, not three

Every original candidate was struck before this ticket resolved. What replaced them is a single
record covering the two halves of one decision — **ADR-0008, _The Wheel is framed, not manipulated_**:
the half-disc that shipped, and the optical layer that was chartered, researched and abandoned.

They are one ADR rather than two because the reject is what gives the accept its force. A static
Framing reads as an under-ambitious answer until you see it is the *complete* answer to the question
the ambitious one was chasing — every Label on a phone is upright by construction, so nothing needs
turning.

The two-ring desktop does **not** get its own ADR. Its work is falsifying ADR-0001's consequence 2,
so it is recorded in the Correction, where a reader meets it in the context that makes it matter.

### A finding about ADRs, carried into ADR-0008

The three dead consequences all recorded facts about the implementation — pixel counts, which
component holds what, the shape of the state model. The survivor recorded what the decision **costs a
reader**. That is the altitude that lasted four ADRs, and ADR-0008's Consequences are written to it
deliberately: costs and constraints, no measurements, no file structure. Numbers live in tickets,
which are dated; ADRs are not.

This is the same lesson the pruning episode taught from the other end — a "divergence" that was real
for one session before being undone. Recorded here so the next ADR does not have to relearn it.

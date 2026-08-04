# The desktop lights a Path instead of descending

A desktop draws all three rings — Roberts' poster, whole, 130 Nodes at once — and tapping a Node no
longer moves the Focus there. It lights the Path down to that Node and takes strength away from
everything off it. A phone is unchanged: one ring, and every tap descends.

This reverses the ring count ADR-0001 arrived at by a different route than the one it was cut on, and
it restores the view-conditional tap rule that was deleted for being invisible.

## The two halves are one decision

They have always been coupled and were shipped apart, which is why both looked wrong.

**Three rings without a highlight** is what shipped first, and it was cut for legible type: at the
Cores on a 1440x900 desktop, three rings puts Labels between 7.8px and 15px against two rings' 13.6px
to 22.5px. `Sobrecarregado` at 7.8px is a shape, not a word.

**A highlight without three rings** is what the tap rule was. A Node whose children were already drawn
did not descend, it settled — and settling drew nothing, so a desktop where a Core's Secondaries were
on screen from the start had a Core you could click at forever with no reply. The rule was deleted and
descent made unconditional, which fixed the silence by giving every tap somewhere to go.

Neither half stands up alone. Together they do, because each answers the other's objection:

- Three rings makes descent pointless — there is nothing left to reach — so the tap is free to mean
  something else.
- The highlight makes three rings legible in the way that matters, by changing what the rim is *for*.

## What the rim is for

Under two rings the rim was a promise. A Tertiary was reached by descending to it, so the words out
there had to be readable to be worth aiming at, and 7.8px was a broken promise.

Under three the rim carries the *shape* of a branch — which Core a feeling belongs to, how wide Feliz
is against Enojado, where the eight faces of Raiva sit relative to each other. That is Roberts' poster
doing the thing a poster does, and it survives type too small to read one word at a time.

The word itself is not read off the rim at all. It comes up beneath the Wheel at 30px, where it always
did. **The small type was only ever a problem because nothing else was saying the word.**

## The rule, stated once

> A tap on a Node whose children are not on screen descends into it. A tap on a Node with nothing left
> to open reads it.

The second clause is ADR-0009's, widened. That ADR gave a Tertiary a tap on the grounds that it has
nothing to open, so being read is the only thing tapping it can mean — and a Core on a Wheel drawing
every ring is in exactly that position. The reasoning did not change; the set it applies to did.

So a Reading is now any Node rather than only a Tertiary, and the dimming follows the whole Path:
everything that is not the Node being read, an ancestor of it, or a descendant of it. Read `Raiva`
and the other six Cores go with their branches entire while Raiva's own Secondaries and Tertiaries
stay. Read `Agressivo` and Raiva's other Secondaries go too, each taking its two Tertiaries.

**This is still not Selection** (ADR-0006). Nothing is kept, nothing is copied, nothing outlives the
next move, and there is nowhere to take it. A Reading is a way of looking at the Wheel — the same act
ADR-0009 named, now able to point at a branch as well as at a word.

## Consequences

- **A desktop has no Focus.** Nothing descends, so `focus` stays null, the zoom never runs, the centre
  never ascends and the row of ways back below the Wheel never appears. `backToCores` and `back` are
  phone controls now, and the words on them stay as they are because they are never shown where they
  would read wrong.
- **The centre gains a third state**: clear the Reading. It is the only way out besides tapping the
  lit Node again, since the ways-back row is keyed on a Focus there has not been.
- **Turning is withdrawn for a Tertiary Reading only**, not for any Reading. Reading a Core is not the
  end of a descent and the reader may well want to bring the branch round to somewhere comfortable.
- **Squaring up is scoped to a Secondary Focus.** It fired on any withdrawal of turning, which under
  this change means a desktop Wheel would lurch up to 90° at the moment someone settled on a word.
- **Search points rather than moves**, wherever the result is already drawn and has nothing to open.
  Throwing away a Wheel the reader can see in order to answer *where is Sobrecarregado* is the wrong
  trade when the answer is to light it where it stands.
- **The list twin follows**, because it is handed the same view and asks the same question. On a
  desktop all 130 of its buttons read rather than open.
- **The type is genuinely small and this ADR does not pretend otherwise.** If it proves unreadable in
  use, the lever to reach for first is the band weighting — the three rings split the radius equally,
  and the Tertiaries are the ones whose Labels are length-limited.

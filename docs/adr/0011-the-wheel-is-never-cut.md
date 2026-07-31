# The Wheel is never cut

The Wheel is drawn whole on every screen. There is one Framing — the whole disc — and a phone shows
all of it: seven Cores, a complete circle, no straight edge anywhere.

This reverses ADR-0010 and, with it, the last of ADR-0008's half-disc. Both were built on the same
bet: that showing less of the Wheel buys radius, and radius buys legible Labels. The bet paid, and
the thing it was paid with turned out not to be for sale.

## What a crop actually looks like

A Framing is a rectangle of the Wheel's plane, and the argument for cropping was always made in that
vocabulary — a window onto a Wheel larger than the page. On a phone it does not read that way. A
straight edge through a block of flat colour reads as a Wheel that *failed to draw*, and no amount of
being right about the geometry changes what the eye reports. Three attempts confirmed it:

- **The half-disc** cut the left, and hid four of the seven Cores so completely that *Happy* could not
  be reached by pointing at all (ADR-0009).
- **The fan at 1.2** cut left, top and bottom for a 380px radius, and left broad areas of colour with
  no word in them — 12 Labels across 48 wedges.
- **The fan at 1.4** gave two Labels back and softened the cut edges with a fade. Still cut.

The fade was the tell. Softening an edge so it stops looking like damage is a way of apologising for
the crop, not a way of fixing it.

## What it costs, exactly

The whole disc is the *smallest* of the three radii, because a circle is square in its box and the
box is capped by the column's width: 199px, against the half-disc's 226px and the fan's 323px.

That is a real loss and it lands in one specific place: **the phone goes back to one ring.** All 48
Cores and Secondaries on a whole disc at this radius is 11.2px median, which is the unreadable state
ticket 05 exists to prevent. So the two-phases-at-once view — Cores with their Secondaries, then
Secondaries with their Tertiaries — is withdrawn on phones and survives on desktop.

**Two phases at once and an uncut Wheel cannot both be had in a 398px column.** That is arithmetic,
not preference, and it should have been said before the fan was built rather than discovered by
building it.

## What the smaller radius buys back

Every Core on screen, which neither cropped framing ever managed:

| | radius | Cores visible | Labels | median |
| --- | --- | --- | --- | --- |
| half-disc | 226px | 3 of 7 | 3 | 28.1px |
| fan (1.4) | 323px | 3 of 7 | 14 | 16.2px |
| whole disc | 199px | **7 of 7** | 7 | 24.8px |

Descending is unchanged and stays comfortable: a Core's Secondaries arrive at 18.4px median, and a
Secondary's two Tertiaries at 20.9px.

The page also now ends where it ends. At this size the whole thing — header, Wheel, list twin,
credit — fits a 430×729 phone viewport with **no scrolling at all**.

## Labels sit where the wedge balances, not at the middle of its thickness

Drawing the Wheel whole made a placement bug visible that the cropped framings had been hiding: the
type read as drifting toward the hub. It was not an alignment fault — each word is exactly centred on
its anchor — it was the anchor. A Label sat at the midpoint of its band's *thickness*, and a wedge is
not a rectangle. It widens as it goes out, so on the single-ring Cores view a word at 0.65 in a band
running 0.3 to 1.0 had roughly **twice as much colour outside it as inside**.

The fix is the radius with equal area either side of the drawn word, which solves to
`sqrt((r0² + r1²) / 2 - w²)` for a word of half-length `w`. Measured across all seven Cores, the
colour either side now comes out at 1.00x for every one of them.

**The `w` term is most of the answer, not a refinement.** Aiming at the wedge's centre of mass, which
needs no `w` and so needs nothing from the Locale, was tried first and is right only for short words:
it placed `Mal` and `Medo` almost perfectly and drove `Surpresa` to within 6px of the rim with five
times as much colour behind the word as in front — the same fault, in the other direction. The
formula tapers on its own, which is why it is worth having: short words sit well out, and a word that
nearly fills its band falls back toward the middle because there is nowhere else for it to go.

This costs `geometry.ts` a little of its independence. It cannot measure a word — that needs the
Locale and the type size — so it takes a `Reach` callback and the component answers with the same
`fontSize` and `inkOf` the Labels are actually drawn with. Handing back a different guess than the
one on screen would misplace every Label by the difference.

## Consequences

- **`FAN` is unused**, and `framing` is a constant rather than a breakpoint. ADR-0010 is superseded
  in full; ADR-0008's half-disc was already gone.
- **Turning survives, and on its original grounds.** ADR-0009 was argued from reachability — the four
  Cores a phone could not reach — and the whole disc fixes that outright. But reachability was never
  the ask; _"spin my wheel so I can read the items better"_ was, and a Label at 8 o'clock still reads
  more comfortably brought round to 3. The turn is now a reading convenience rather than a
  navigational necessity, which is what it was asked for.
- **The Label flip is load-bearing on every screen again**, since every screen can now show negative
  x. The correction is derived from the frame, so this needed no change — which is the point of
  having derived it.
- **The centre carries the Path on a phone again**, because nothing crops it. The separate readout
  line above the Wheel is now only used for a Reading.
- **`slices` and its two-axis ink test have no live caller.** They are kept rather than deleted: the
  mechanism is what makes a cropping Framing *possible*, and the decision here is that we do not want
  one, not that one could never be expressed. Anyone reviving it should read this ADR first.

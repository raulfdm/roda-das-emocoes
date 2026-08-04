# Roda das Emoções

A Portuguese-first interactive rendering of Geoffrey Roberts' *Emotion Sensation Feeling Wheel* — a
taxonomy of 130 feelings that helps someone move from a vague "I feel bad" to a precise word.
Published Portuguese, Spanish and English renderings all share Roberts' exact structure, so the same
taxonomy carries all three languages.

## Language

### The taxonomy

**Wheel**:
The complete taxonomy — one canonical tree of 130 Nodes, independent of any language.
There is exactly one Wheel.
_Avoid_: Chart, diagram, graph

**Node**:
A single feeling within the Wheel. Identified by its Path, never by its word — words repeat across
the Wheel and change between Locales.
_Avoid_: Emotion, item, entry, segment

**Core**:
One of the 7 Nodes at the centre of the Wheel: the broadest feelings, each the root of a branch.
_Avoid_: Primary, base, category, ring 1

**Secondary**:
One of the 41 Nodes in the middle ring, each belonging to exactly one Core. Cores hold uneven
numbers of these — from 4 to 9 — which is why the Wheel's branches differ in width.
_Avoid_: Sub-emotion, ring 2

**Tertiary**:
One of the 82 Nodes at the rim, the most precise feelings. Every Secondary has exactly two.
_Avoid_: Leaf, specific, ring 3

**Path**:
The chain from a Core down to a Node — `Mal-estar › Estresse › Sobrecarga`. A Node's identity and
the unit that gets shared. Paths are unique even where words are not.
_Avoid_: Chain, trail, breadcrumb, ancestry

### Language and words

**Locale**:
One of the three languages the Wheel is published in: Portuguese (canonical), English, Spanish.
Only one is ever on screen at a time.
_Avoid_: Language, translation, i18n

**Label**:
The word for one Node in one Locale. Purely presentational — changing Locale swaps every Label
while the Wheel, its Nodes, and their Paths stay identical.
_Avoid_: Name, title, word, term

**Collision**:
Two or more Nodes wanting the same Label in a given Locale. English has several (*Overwhelmed*,
*Inferior*, *Embarrassed*, *Disappointed*); Portuguese and Spanish have more, because they collapse
distinctions English keeps. Each one is an editorial decision, not a translation problem.
_Avoid_: Duplicate, conflict, clash

### Using the Wheel

**Focus**:
The Node currently expanded to occupy the full circle, with its children spread around it. Moving
the Focus is how someone descends into the Wheel, and it is where you are in the taxonomy. A Tertiary
can never be the Focus — it has no children to spread.
_Avoid_: Root, zoom target, current node, active, selection

> **A desktop has no Focus at all** (ADR-0013). It draws all three rings, so there is nothing out of
> sight to descend to and nothing ever moves the Focus off the whole Wheel. Descending is a phone
> mechanism now; a desktop reads the Wheel where it stands.

> **Selection is gone** — the Node someone had settled on, kept distinct from Focus. Nothing is
> chosen, marked or copied any more; the Wheel is navigated, not answered. See ADR-0006. The word is
> retired rather than free: do not reintroduce it for the Focus, which is what the _Avoid_ above is
> guarding — nor for the Reading below, which is a near neighbour and the likelier slip.

**Reading**:
The Node someone has tapped, whose Path the Wheel lights while everything off it dims, and whose Label
comes up beside the Wheel at a size the rim cannot give it. Reading is what a tap means wherever there
is nothing left to open — which was only a Tertiary while every screen drew fewer rings than the tree
has, and is any Node on a desktop drawing all three (ADR-0013). A Reading lasts until the next move
and no longer — descending, ascending, clearing it or returning to the Cores all drop it (ADR-0009).
_Avoid_: Selection, chosen, picked, answer, result, highlight

> **A Reading is not a Selection**, and the difference is not a shade of meaning. Something is dimmed
> on the Wheel, but nothing is kept, and nothing can be taken away. The noun is deliberately an act rather than
> a status: you read a Node, a Node is never "the reading" in the way it would have been "the
> selection".

**Turn**:
How far the Wheel has been rotated about its centre, and the third thing it remembers about where you
are — alongside Focus and any Reading. Someone turns the Wheel by dragging it, to bring a region
round to where it is comfortable to read; on a phone it is also the only way to reach the Cores the
Framing crops. Orthogonal to both the others: turning changes nothing about which Node is expanded
and nothing about which rectangle is on screen.
_Avoid_: Rotation angle, spin, orientation, viewport

> A Turn survives a Focus change, which is the surprising half. Someone who has turned the Wheel to
> somewhere comfortable does not expect descending to snatch it back.

**Framing**:
The rectangle of the Wheel's plane that is on screen. The Wheel is always drawn whole, as a disc of
radius 1; the Framing decides how much of that drawing you get. **Every screen gets all of it**
(ADR-0011). Orthogonal to Focus: Focus changes which Node fills the circle, Framing changes how much
of the circle you are looking through.
_Avoid_: Viewport, crop, window, box

> **There is only one Framing, and the term is kept anyway.** A phone had the right half-disc
> (ADR-0008) and then a fan of it (ADR-0010), both trading visible Wheel for radius. Both were
> rejected: a straight edge through the Wheel reads as a drawing that failed rather than as a window
> onto something larger, and the second ring of Labels the radius bought was not worth it. The word
> survives because the mechanism does — a Framing that crops is still expressible, and `flips` is
> still derived from it. What is decided is that we do not want one.

> **There is still no layer above this, but it is no longer the only optical term** (ADR-0008, amended
> by ADR-0009). Framing was chartered as the narrow word for one axis of a **Viewport** — an optical
> layer that would also scale, pan and rotate — with the larger term held open. Scale never shipped
> and the pan that shipped is a constant; **Turn** did ship, and has its own entry above rather than
> being folded in here. The two stay separate on purpose: a Framing follows the screen and is never
> the reader's, a Turn is nothing but the reader's. Nothing groups them, so `_Avoid_: Viewport` still
> guards a tempting synonym rather than reserving a term that is coming — and "viewport" already
> means the browser's viewport throughout the code, which is a second reason not to spend it here.

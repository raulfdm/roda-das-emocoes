# Wheel Explorer

Status: ready-for-agent

## Problem Statement

Someone feels something and can't name it. "I feel bad" is as far as they get, and a vague feeling is
hard to act on, hard to communicate, and hard to move past. Geoffrey Roberts' Emotion Sensation
Feeling Wheel solves exactly this — it walks you from a broad feeling to a precise one in three steps
— but it exists mainly as a poster, and the poster does not survive a phone. 82 Tertiaries around a
circle is 4.4° per wedge, about 12px of arc on a 360px screen, so the printed Wheel is unreadable on
the device someone actually has in their hand when they feel bad.

Faithful Portuguese, Spanish and English renderings of the Wheel all exist on paper. None of them is
interactive in Portuguese, and none lets someone move between the three languages without losing
their place.

## Solution

A single-page interactive Wheel, Portuguese by default, that opens on a phone showing only the 7
Cores as large tappable wedges. Tapping one makes it the Focus: its Secondaries spread around the
full circle at comfortable size, with the Path so far readable at the centre. Tapping again descends
to the Tertiaries. Three taps from "I feel bad" to `Sobrecarregado`, with nothing on screen that
isn't relevant.

Landing on a Node gives you the word, its full Path, a copy button, and a shareable link that
reopens the Wheel exactly there. A Locale switcher moves between Portuguese, Spanish and English
**without losing the Selection** — the three published wheels share Roberts' exact structure, so
every Node has a counterpart in every language. A search field lets anyone who half-remembers a word
jump straight to it.

On desktop the same component opens fully expanded — the whole poster, all 130 Nodes, clickable.

## User Stories

1. As someone who feels bad but can't name it, I want to open the app and see only 7 broad feelings, so that I'm not confronted with 130 words at once.
2. As a phone user, I want each Core to be a large tappable wedge, so that I can hit the one I mean without zooming or missing.
3. As someone narrowing down, I want tapping a Core to make it the Focus and spread its Secondaries around the full circle, so that every option is legible at a glance.
4. As someone narrowing down further, I want tapping a Secondary to spread its two Tertiaries around the full circle, so that the final choice is unmissable.
5. As someone who has descended two levels, I want the Path so far shown at the centre of the Wheel, so that I never lose track of where I am.
6. As someone who took a wrong turn, I want to tap the centre to move the Focus back up one level, so that I can correct without starting over.
7. As someone who took several wrong turns, I want a way back to the 7 Cores in one action, so that I can restart cheaply.
8. ~~As someone who has arrived at a Tertiary, I want it marked as my Selection distinctly from merely having it in Focus, so that I know I've arrived rather than passed through.~~ **Withdrawn — ADR-0006.**
9. ~~As someone who only needs a broad word, I want to make a Selection at a Core or Secondary without descending to a Tertiary, so that the tool doesn't force more precision than I have.~~ **Withdrawn — ADR-0006.** Stopping early now means simply not descending further.
10. ~~As someone who has made a Selection, I want to see the full Path from Core to Node, so that I understand where my feeling sits in the taxonomy.~~ **Withdrawn — ADR-0006.** The Focus's Path is still read above the Wheel or at its centre; what is gone is a second Path for a settled Node.
11. ~~As someone who has named a feeling, I want to copy the word and its Path to my clipboard, so that I can paste it into a journal or a message.~~ **Withdrawn — ADR-0006.** With ADR-0005 this leaves no export route of any kind.
12. ~~As someone who has named a feeling, I want the address bar to carry my Selection, so that the link I copy reopens the Wheel exactly where I am.~~ **Withdrawn — ADR-0005.**
13. ~~As someone who receives such a link, I want the Wheel to open with that Node already selected, so that I don't have to navigate there myself.~~ **Withdrawn — ADR-0005.**
14. ~~As someone mid-exploration, I want the browser back button to undo my last descent, so that navigation behaves the way the rest of the web does.~~ **Withdrawn — ADR-0005.** Tapping the centre and `Ver a roda inteira` are the ways back up.
15. As a Portuguese speaker, I want the Wheel in Portuguese by default, so that I can use it without translating in my head at the moment I'm least able to.
16. As a bilingual user, I want to switch Locale at any point, so that I can read a feeling in whichever language names it better for me.
17. As a user switching Locale mid-descent, I want to keep the exact same Node, so that switching is a change of language and never a loss of place. _(Was "mid-Selection" — the Focus is what is now kept.)_
18. ~~As a user switching Locale, I want the shareable link to update to the new language's words, so that what I share reads naturally to whoever receives it.~~ **Withdrawn — ADR-0005.** Story 17 survives: switching Locale still keeps the exact same Node, now in memory.
19. As a Portuguese speaker, I want the words that appear on the Portuguese wheel people already circulate, so that the tool matches what I may have seen before.
20. As a Spanish speaker, I want the published Spanish vocabulary for the same reason.
21. As an English speaker, I want Roberts' original words, so that the app matches the poster and his own app.
22. As someone who half-remembers a word, I want to search for it, so that I don't have to descend the Wheel to find something I nearly know.
23. As a Portuguese or Spanish speaker searching, I want to type without accents and still get results, so that I'm not fighting my keyboard.
24. As someone searching, I want each result shown with its full Path, so that I can tell apart Nodes that share a word — and several do.
25. As someone who searched, I want tapping a result to move the Focus to that Node on the Wheel, so that I see where it sits rather than just getting a word. _(Still holds; it no longer also marks the Node.)_
26. As a desktop user, I want the Wheel to open fully expanded with all 130 Nodes visible, so that I get the overview the poster gives.
27. ~~As a desktop user, I want clicking any Node at any ring to highlight its Path and dim the rest, so that I can read the chain without losing the whole picture.~~ **Withdrawn — ADR-0006.** This story is what made `descendsInto` conditional, and that conditional is what left a desktop click on a Core doing nothing. Clicking now descends, on both platforms.
28. As a keyboard user, I want to traverse the Wheel without a mouse or touch, so that the tool is usable without pointing.
29. As a screen-reader user, I want the Wheel exposed as a nested list of feelings, so that I can navigate the taxonomy structurally rather than fighting a graphic.
30. As a returning user, I want the app to load fast from anywhere, so that reaching for it is never a wait.
31. As someone curious about the source, I want Geoffrey Roberts credited with a link to his site, so that I can find the original and the versions in other languages.
32. As the maintainer, I want the Wheel's structure verified automatically, so that a mistranscribed or missing Label among 390 doesn't ship silently.
33. As the maintainer, I want Node identity independent of the words, so that correcting a Label never invalidates an existing shared link.

## Implementation Decisions

### The Wheel as data

- The Wheel is a **single canonical tree of 130 Nodes**, defined as static data compiled into the
  app. No backend, no database, no runtime fetching.
- Structure is fixed and regular: 7 Cores, 41 Secondaries, 82 Tertiaries. Cores hold uneven numbers
  of Secondaries — Happy 9, Angry 8, Fearful 6, Sad 6, Surprised 4, Bad 4, Disgusted 4 — and every
  Secondary holds exactly 2 Tertiaries.
- **All three Locales share this one tree.** The published Portuguese and Spanish wheels preserve
  Roberts' structure branch for branch and position for position, so every Node has a counterpart in
  every language. This is what makes Locale switching lossless, and it is a property to protect: any
  future Locale must map onto this structure or be rejected.
- Each Node carries one Label per Locale, adopted **verbatim** from the published wheels (ADR-0004).
  No Label is authored.
- A Node's identity is its position in the tree — never its Label. **Labels are not unique**, by
  design and in the source data. Portuguese `Desapontado` sits on three separate Nodes; `Rejeição` on
  two different Secondaries; `Confiança`, `Satisfação`, `Excitação` and `Ansiedade` each appear at
  two different depths. Spanish adds `Aislado` and `Impotente`. English has `Overwhelmed`,
  `Inferior`, `Embarrassed` and `Disappointed`. Nothing may assume Label uniqueness.

### Rendering

- The Wheel is SVG. Not canvas, not CSS shapes. Segments must be real DOM nodes so they can be
  focused, labelled, and read by assistive technology, and text must stay crisp through zoom.
- Geometry is derived from the tree and the current Focus: a pure transformation from
  (tree, Focus) to the set of visible arcs. It holds no state of its own.
- **`d3-shape` is used as a math library only** — its arc generator produces the annular path
  strings, which are fiddly to hand-roll correctly (large-arc and sweep flags, the degenerate full
  circle, inner-edge winding). Nothing else from d3 is used. Svelte owns every DOM node via `{#each}`
  and drives the zoom with its own tweening. D3 selections and data joins are forbidden — they
  compete with Svelte for ownership of the DOM. The layout math itself (angles from leaf counts,
  radii from depth, re-rooting on Focus change) is ours, because the zoom re-roots the tree and
  `d3-hierarchy`'s partition layout would have to be unpicked to do it anyway.
- Colour is data, not design tokens. Each Core owns a hue; its Secondaries and Tertiaries are tints
  of that hue derived outward. These live as CSS custom properties computed from the tree, never
  duplicated as Tailwind tokens — one source of truth.

### Interaction and state

- ~~**Focus** and **Selection** are separate pieces of state. Focus is the Node currently expanded to
  fill the circle; Selection is the Node the user settled on. A user passes through many Focuses to
  reach one Selection. Conflating them is the main modelling risk in this feature.~~ **Reversed —
  ADR-0006.** There is one piece of state: the Focus. The risk this bullet guarded against cannot
  arise, because there is no second thing to conflate it with.
- Moving the Focus down is tapping a Node with children — unconditionally, on both platforms. Moving
  it up is tapping the centre. A Tertiary has no children and does not respond to a tap at all.
- Desktop and mobile share one component and differ only in initial Focus depth: desktop opens
  expanded to all three rings, mobile opens at the Cores. _(No longer the whole story. Desktop now
  opens at **two** rings, not three — `wheel-viewport` ticket 05 measured three as the app's only
  unreadable state. They also differ in Framing since ticket 11. They briefly differed in more — the
  pruning pass prerendered both as separate subtrees with CSS choosing between them — but ADR-0007
  undid that, and there is one render path and one `<Wheel>` again. Whether ADR-0001's matching claim
  is amended is `.scratch/wheel-viewport/issues/09-adr-0001-fate.md`'s to rule on.)_

### Application shape and URL state

> **Corrected by ADR-0005, _The Wheel's place is not addressable_.** The query-state design below
> shipped in full and was then removed. The two bullets that survive are marked; the three that were
> reversed are struck through and kept so the reversal is legible rather than invisible. The work is
> `.scratch/wheel-prune/issues/01-delete-the-url.md`.

- **This is a single-page app.** One route. There is no path-based routing and no per-Node page.
  _(Stands.)_
- ~~All shareable state lives in **query parameters**: the active Locale and the current Selection
  Path. Reading them on load restores the Wheel; changing Focus or Selection updates them via history
  so the back button works.~~ **Reversed.** The address bar carries nothing. Focus and Selection are
  component state; Locale — a preference rather than a position — lives in `localStorage`.
- ~~The Selection is expressed in the **active Locale's words**, so a shared link reads naturally to
  whoever receives it. Switching Locale rewrites the parameter to the new language's words for the
  same Node — trivial, because the tree is shared and positional.~~ **Reversed.** There is no link.
  Switching Locale still keeps the same Node, because the tree is shared and positional — that part
  was never about the URL.
- ~~With no Selection, the app opens at the Cores in the default Locale. Query state is additive,
  never required.~~ **Reversed into the general case.** The app always opens at the Cores, in the
  stored Locale or Portuguese.
- The single page is prerendered to static HTML so the Cores are visible before JavaScript runs and
  the app can be hosted anywhere. This means switching the project from `adapter-auto` to
  `adapter-static`. _(Stands, and matters more than it did — with no query string to wait for, the
  prerendered markup is correct rather than provisional. See
  `.scratch/wheel-prune/issues/03-both-wheels-css-chooses.md`.)_

### Search

- Search matches Labels within the active Locale only, case- and accent-insensitively, so that
  typing `estresse` or `ansiedade` without diacritics still gets results.
- Results are rendered as full Paths, not bare words. This is required, not cosmetic — several Labels
  genuinely appear at more than one Node, and the Path is the only thing that distinguishes them.
- Selecting a result moves the Focus to that Node and makes it the Selection.

### Accessibility

- The SVG has a semantic twin: the same tree rendered as a real nested list, exposed to assistive
  technology and keyboard navigation. This is not a second UI — it is the same data in its
  structural form, and it is what makes the graphic navigable without pointing.

### Styling

- Tailwind (v4, CSS-first — no config file) is used for the chrome: Locale switcher, search field and
  results, Path readout, page layout, and the accessibility list. _(There are no share controls —
  ADR-0005 — and no copy control either, ADR-0006.)_
- The Wheel itself is scoped component CSS plus computed attributes. Tailwind expresses no arc
  geometry and learns nothing about the Wheel's palette.

### Attribution

- Geoffrey Roberts is credited prominently with a link to feelingswheel.app. See ADR-0003 for the
  licence posture — we proceed without seeking permission and would honour a takedown request.

## Testing Decisions

This is a personal project and the testing posture is deliberately light. Almost everything this
feature does is immediately visible: if the geometry is wrong, the Wheel looks wrong; if navigation
is broken, the first tap reveals it. Automated coverage of visible behaviour would cost more to
maintain than it catches.

**One seam: the Wheel data module.** A good test here asserts the data contract — the shape the rest
of the app relies on — not how the tree is constructed or stored. The invariants worth guarding are
the ones a human cannot eyeball across 390 transcribed Labels:

- Exactly 7 Cores, 41 Secondaries, 82 Tertiaries.
- Every Secondary has exactly 2 Tertiaries; Core Secondary counts are 9/8/6/6/4/4/4.
- Every Node has a non-empty Label in all three Locales — no blanks, no placeholders, no Label
  accidentally left in English.
- The tree is identical across Locales: same Node count, same shape, same parent-child relationships.
  A Locale that has drifted structurally is a bug.

**Explicitly NOT an invariant: Label uniqueness.** Duplicate Labels within a Locale are correct
source data (ADR-0004). A test asserting uniqueness would fail on faithful data and must not be
written.

**Explicitly not tested:** navigation, zoom, Focus and Selection behaviour, Locale switching, search,
query-state round-tripping, rendering, and geometry. No end-to-end suite, no component tests, no
visual regression. These are verified by using the app.

There is no prior art — this is the first test in the repo, and it establishes Vitest.

## Out of Scope

- **Capture, check-in, or mood tracking.** No recording what you felt, no history, no patterns over
  time, no charts. Acknowledged as a likely future direction; the shareable query state is the
  natural hook for it, and nothing here should preclude it.
- **Definitions or reflective prompts per Node.** The payoff is the word and its Path.
- **Path-based routing or a page per Node.** Explicitly rejected — this is a single-page app.
- **Accounts, persistence, or any backend.** The app is static.
- **Locales beyond pt, es and en**, despite Roberts publishing eleven.
- **Authoring or normalising any Label.** All three sets are adopted verbatim; see ADR-0004 and the
  superseded ADR-0002.
- **Contributing anything upstream to Roberts**, and resolving the licence.
- **Visual regression or geometry tests.** Revisit if the geometry stops changing and bugs recur.
- **Native apps.** Roberts already ships iOS and Android.
- **3D.** The taxonomy has no third axis; any 3D would be decoration on a 2D structure.

## Further Notes

**The main content risk is now transcription, not authorship.** Adopting the published wheels
removed all editorial judgement, but 390 Labels still have to be read off three images and entered
correctly, in the right positions, with correct diacritics. A Label in the wrong branch is invisible
to the eye and fatal to Locale switching — it will silently take someone to the wrong feeling. The
data-invariant test is the guard rail for exactly this, which is why it checks structural identity
across Locales rather than just counts.

**The source images live in the repo** at `docs/wheels/portuguese.png`, `docs/wheels/english.png` and
`docs/wheels/spanish.png`. They are the authority for every Label. Transcribe from them directly;
do not reconstruct Labels from memory or from any other wheel found online.

**Source images** — three wheels, all sharing Roberts' 7/41/82 structure:

- **English** — Roberts' original.
- **Portuguese** — mixed register: nouns (`Cansaço`, `Solidão`, `Humilhação`, `Frustração`) beside
  adjectives (`Assustado`, `Ocupado`, `Magoado`). Preserved as-is.
- **Spanish** — masculine adjectives throughout (`Cansado`, `Estresado`, `Asustado`, `Rechazado`).
  Preserved as-is. Note: an earlier Spanish image was a **different wheel** — the Willcox 6-core
  variant with 114 Nodes and no `Mal` branch, mislabelled as Plutchik. It is not usable and must not
  be reintroduced. Spanish resources for other wheel variants are a trap.

Relevant records: `CONTEXT.md` for vocabulary, ADR-0001 (zoomable sunburst), ADR-0003 (Portuguese
default, Roberts attribution and licence posture), ADR-0004 (Labels verbatim). ADR-0002 is superseded
but retained.

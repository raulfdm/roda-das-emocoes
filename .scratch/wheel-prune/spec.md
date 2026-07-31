# Wheel Prune

Status: ready-for-agent

## Problem Statement

The Wheel is the thing this app is for, and it is not what the page leads with. Above it sit a
full-width search field with its own heading, a bordered input carrying `shadow-sm`; beside it sits a
`lg:w-80` card headed **A sua escolha**. On a phone the search field and the Path readout compete for
the same strip of screen directly above the Wheel — which explorer issue 08 had already ruled against
in its own acceptance criteria (_"search works on a phone without the field obscuring the Wheel"_).
The field is getting credit the Wheel earned.

Two further things are wrong with the page as it stands.

**Reloading flashes.** The page is prerendered to a static file, and a static file cannot know the
screen width. `+page.svelte:33` declares `new MediaQuery('(min-width: 64rem)', false)`, so the served
HTML is always the phone view. On a desktop the first paint is a half-disc showing 7 Cores; hydration
replaces it with a whole disc showing all 130 Nodes. It is not merely a crop change — `rings` goes
1 → 3, so the content differs too, which is why the jump is so visible. A second, smaller flash comes
from the `live` gate at `+page.svelte:28`, which renders the default Locale and no Focus until the
real URL can be read after mount.

**Three Locales disagree about quotation.** `words.ts` wraps a Label in `«»` for Portuguese and
Spanish (`51`, `52`, `105`, `106`), in `“”` for English (`78`, `79`), and in nothing at all for the
accessibility twin's own labels (`61`, `62`) — three conventions in one file. `«»` is the European
convention and reads as foreign in a Portuguese-first app.

## Solution

Strip the page back to the Wheel, and make the first paint correct on both platforms.

The **A sua escolha** card goes. Selection is not deleted — it stays a distinct concept with its own
highlight and its own buttons — but it stops being a column and becomes a single line below the
Wheel, appearing only once something is chosen: the Label, its Path, an inline copy affordance, and a
small `×` to clear. That line renders identically on a phone and a desktop, which also closes a hole
the card was quietly covering: the Focus readout above the Wheel is gated by `cropsCentre(framing)`
and therefore does not exist on a desktop at all.

**Search moves into the header**, beside the Locale switcher, as a compact field with no visible
label and no shadow. The header is chrome; search becomes chrome. The Wheel becomes the first thing
below the title.

**The URL goes entirely** — see ADR-0005. Focus and Selection become ordinary component state, Locale
moves to `localStorage`, and the `live` gate disappears with the query string it existed to wait for.

**The first paint is fixed by sending both Wheels** and letting CSS choose between them, rather than
by waiting for JavaScript. _(**Reversed by ADR-0007** — see the First paint decision below. This
paragraph is the record of what was tried; the page now waits behind a loader and renders one
`<Wheel>`.)_ The phone Wheel and the desktop Wheel are both prerendered, one
`lg:hidden` and the other `hidden lg:block`; the media query resolves before the first paint, so
there is no flash and no spinner, and the page is correct with JavaScript disabled. Tailwind's
`hidden` is `display: none`, which removes the unused copy from the tab order and the accessibility
tree, so the duplication is invisible to a screen reader. After mount the page collapses to a single
instance so a tap does not re-render a hidden 130-node SVG.

**Quotation marks are dropped in all three Locales**, matching `words.ts:61-62`, which already do
this and which nobody has complained about.

## User Stories

1. As someone opening the app, I want the Wheel to be the first thing I meet, so that the tool leads with what it is for.
2. As someone who half-remembers a word, I want search still available but out of the way, so that it helps me when I need it without taxing me when I don't.
3. As someone reloading on a desktop, I want the Wheel to be right on the first paint, so that the page does not visibly rearrange itself under me.
4. As someone reloading on a phone, I want the first paint to stay as immediate as it is today, so that fixing a desktop problem does not cost me a spinner.
5. As someone with JavaScript disabled or still loading, I want the correct Wheel for my screen, so that the prerendered page is useful rather than provisional.
6. As someone who has settled on a feeling, I want the word and its Path on one line under the Wheel with a way to copy it, so that the payoff is present without being a panel.
7. As someone who chose wrongly, I want a way to clear my choice, so that "nothing chosen" is reachable without reloading.
8. As a Portuguese or Spanish reader, I want the app's own words to read as they would in my language, so that nothing on screen looks imported.
9. As someone who switched Locale, I want that to survive a reload, so that I am not re-picking my language on every visit.

## Decisions

### What Selection keeps and loses

- **Selection stays a concept.** `CONTEXT.md`'s entry is unchanged, the wedge highlight stays, and
  the `Escolher` / `Abrir` buttons stay. Only the card is deleted.
- Selection and Focus stay **visibly separate** — the Focus readout above the Wheel, the Selection
  line below it. The spec's own warning holds: conflating them is the main modelling risk here.
- **Copy copies text, not a link** — `Mal-estar › Estresse › Sobrecarga`, unchanged behaviour, for a
  journal or a message. With no URL there is no link to build, and `encodeShareable` dies with it.
- **Clear survives** as a small `×` rather than a bordered button, honouring explorer issue 04's last
  criterion at a fraction of the visual weight.
- `words.selection` (`A sua escolha` / `Your choice` / `Tu elección`) is deleted from all three
  Locales — it was the card's heading and has no other reader.

### State, after the URL

- `focus` and `selection` are `$state` on `+page.svelte`. There is no second copy of anything,
  because there is now only one copy.
- `locale` reads from `localStorage` after mount and writes on change. It is the only state that
  outlives the visit. Portuguese remains the fallback, per ADR-0003.
- The Locale switcher's active pill and `document.documentElement.lang` settle one frame after the
  first paint. The Wheel does not wait on either.
- Nothing replaces the back button. `Ver a roda inteira` and tapping the centre are the ways back up.

### First paint

> **Reversed by ADR-0007.** The two-Wheels-and-CSS design below shipped, then gave way to a full-page
> loader: it fixed the breakpoint flash but could do nothing about the Locale flash, which was the
> one that read as a fault. Nothing renders until `localStorage` and the breakpoint have both been
> read. The bullets below are the record of what was tried, not what is there.

- Both Wheels are rendered in the prerendered markup, chosen between by a media query, not by
  JavaScript.
- Once mounted, the page drops to one instance. The breakpoint is still read via `MediaQuery` from
  that point on — it only stops being the thing that decides the *first* paint.
- The phone payload carries the desktop Wheel's markup. It is repetitive SVG, it gzips well, and the
  cost is accepted here rather than deferred to a measurement — a correct first paint on both
  platforms is worth more than the bytes.

### Words

- No quotation marks around a Label in any Locale: `Escolher Sobrecarga`, `Choose Overwhelmed`,
  `Elegir Abrumado`.
- The ES tagline is quoting a *phrase*, not delimiting a Label, so it keeps its quotes and takes
  straight `"me siento mal"` to match PT (`words.ts:41`) and EN (`words.ts:68`).
- This touches only the app's own words. ADR-0004 governs Labels and nothing here goes near them.

## Out of Scope

- **Any change to the Framing itself.** Ticket 11's half-disc on phones and whole disc on desktop is
  what gets prerendered twice; it is not being revisited.
- **Rings as a reader's control** — still owned by `.scratch/wheel-viewport/issues/05`.
- **Restoring sharing by another route** — no share sheet, no copy-link button, no short codes.
  ADR-0005 settles this.
- **Persisting Focus or Selection** in `localStorage` alongside the Locale. Locale is a preference;
  where you are in the Wheel is not.

## Further Notes

`.scratch/wheel-viewport/issues/09-adr-0001-fate.md` is still open and still owes a ruling on
ADR-0001. This effort adds to what it must weigh: ADR-0001 claims the two platforms _"differ only in
starting depth, not in code"_, and after this work they differ in Framing, in Path placement, and in
being two separately rendered subtrees selected by CSS. Do not settle that here.

Relevant records: `CONTEXT.md` for vocabulary, ADR-0003 (Portuguese default), ADR-0005 (the Wheel's
place is not addressable). The explorer spec's "Application shape and URL state" section is corrected
by this work, not by a separate pass.

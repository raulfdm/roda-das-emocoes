# 02 — Selection becomes a line, not a card

**What to build:** the `A sua escolha` column is deleted and the Wheel takes its width. What the card
did that still matters — naming the Node you settled on, showing its Path, letting you copy it and
clear it — becomes a single line below the Wheel that appears only once something is chosen.

**Blocked by:** 01

**Status:** wontfix — superseded by ADR-0006 the session it shipped.

> **Superseded.** This shipped exactly as written, and Selection was then deleted outright rather
> than rehoused: nothing is chosen, marked or copied any more. See ADR-0006. The criteria below are
> void, not outstanding — the card is gone, but so is the line that replaced it.
>
> What survives is the reason the line existed at all: the Focus readout is gated by
> `cropsCentre(framing)` and so does not render on a desktop. That is still true, and a desktop still
> reads its Path only inside the Wheel's centre.

- [ ] The `<section>` at `+page.svelte:280-329` is deleted, along with the `lg:w-80 lg:flex-none`
      column and the `lg:flex-row` split that existed to hold it — the Wheel column becomes the page
- [ ] A Selection line renders below the Wheel, in the same region as the existing action row at
      `+page.svelte:250`, showing the Selection's Label and its full Path
- [ ] The line renders on **both** platforms — it is not gated by `cropsCentre(framing)`, unlike the
      Focus readout above the Wheel
- [ ] It is absent entirely when there is no Selection; nothing reserves space for it
- [ ] Copy sits inline on that line, copies `formatPath(selection, locale)` as text, and keeps its
      visible confirmation and 2-second reset
- [ ] Clear sits inline as a small `×` rather than a bordered button, and returns the page to no
      Selection while leaving the Focus where it is
- [ ] The Selection line is visually distinct from the Focus readout above the Wheel; the two are
      never merged into one slot
- [ ] `aria-live="polite"` still announces a new Selection, and the `×` has an accessible name
- [ ] `words.selection` is removed from the `Words` interface and from all three Locales
- [ ] `words.clear` is retitled to something that reads on a bare `×`'s tooltip — `Limpar escolha`
      was written for a button with room

## Notes

**Selection is not being deleted.** `CONTEXT.md`'s entry stands, the wedge highlight stays, and the
`Escolher` / `Abrir` buttons stay. Only the card goes.

The distinction to hold onto: the readout above the Wheel is `formatPath(**focus**, locale)`
(`+page.svelte:232`) — where you are. This line is `formatPath(**selection**, locale)` — what you
settled on. They are different Nodes and the spec calls conflating them the main modelling risk in
this feature. Attaching Copy to the Focus line would copy the wrong thing.

The card was also covering a hole: because the Focus readout is gated by `cropsCentre(framing)`, a
desktop has no Path text on the page at all — only the Path drawn inside the Wheel's centre
(`Wheel.svelte:164`). Putting the Selection line on both platforms is what closes that.

Copy stays text-only. There is no link to build — `encodeShareable` was deleted in 01.

Explorer issue 04's criteria are all still in force; this issue rehouses them, it does not retire
them.

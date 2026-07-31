# 02 — The Portuguese Wheel renders

**What to build:** you open the page and see the Wheel — all 130 Nodes in Portuguese, drawn as a
three-ring sunburst, coloured by Core family. It is a static picture at this point; nothing responds
to clicks yet. This is the tracer bullet: data, geometry and rendering all the way through.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] All 130 Portuguese Labels are transcribed from `docs/wheels/portuguese.png` into the Wheel data
      — 7 Cores, 41 Secondaries, 82 Tertiaries
- [ ] Core Secondary counts are 9 / 8 / 6 / 6 / 4 / 4 / 4 (Feliz, Raiva, Medo, Triste, Surpresa, Mal,
      Enojado) and every Secondary has exactly 2 Tertiaries
- [ ] Each Node's arc is proportional to the number of Tertiaries beneath it, so branches differ in
      width exactly as the source image does
- [ ] Arc paths are generated with `d3-shape`'s arc generator; Svelte renders every element via
      `{#each}`; no d3 selections or data joins anywhere
- [ ] Labels are rotated to their radius and legible at desktop size
- [ ] Each Core owns a hue, with its Secondaries and Tertiaries as tints derived outward, expressed
      as CSS custom properties computed from the tree — not as Tailwind tokens
- [ ] Geoffrey Roberts is credited with a link to feelingswheel.app
- [ ] A data-invariant test covers: the 7/41/82 counts, the per-Core Secondary counts, exactly 2
      Tertiaries per Secondary, and no empty Label

## Notes

**Transcribe from the image, not from memory.** `docs/wheels/portuguese.png` is the authority. A
Label placed under the wrong parent is invisible to the eye and will silently send someone to the
wrong feeling once Locale switching exists.

**Do not add a Label-uniqueness check.** Duplicate Labels are correct source data — `Desapontado`
sits on three separate Nodes, `Rejeição` on two different Secondaries, and `Confiança`, `Satisfação`,
`Excitação` and `Ansiedade` each appear at two different depths. See ADR-0004.

A Node's identity is its Path, never its Label. See `CONTEXT.md` and ADR-0001.

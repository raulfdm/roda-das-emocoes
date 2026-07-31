# 01 — Toolchain: static adapter, Tailwind, Vitest

**What to build:** the project builds to a static, prerendered single page and can run tests. Nothing
user-visible changes — this exists so every later ticket lands on a working foundation instead of
re-litigating setup.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `adapter-auto` is replaced with `adapter-static`, and a production build emits a prerendered
      page that can be served from any static host with no server involved
- [ ] Tailwind v4 is installed and working, configured CSS-first with no config file
- [ ] Vitest is installed and a test command runs green
- [ ] `d3-shape` is installed (used from ticket 02 onward)
- [ ] Runes mode stays forced for project code, as the existing Vite config already does
- [ ] The existing placeholder page still renders

## Notes

Tailwind is for the chrome only — Locale switcher, search, Path readout, controls, layout. The Wheel
itself will be scoped component CSS plus computed attributes, and Tailwind must never learn about the
Wheel's palette. See the spec's Styling section.

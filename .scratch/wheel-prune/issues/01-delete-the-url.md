# 01 — Delete the URL

**What to build:** the address bar stops carrying anything. Focus and Selection become ordinary
component state, Locale moves to `localStorage`, and the machinery that kept the URL in step —
including the gate that made the prerendered page provisional — is removed rather than disabled.

**Blocked by:** —

**Status:** ready-for-agent

- [ ] `src/lib/wheel/url.ts` is deleted, along with `decodeShareable`, `encodeShareable`, the
      `Shareable` interface and the `LOCALE_PARAM` / `PATH_PARAM` / `FOCUS_PARAM` constants
- [ ] `focusShowing` is deleted from `src/lib/wheel/geometry.ts` — `url.ts` was its only caller —
      together with any test that exercises it
- [ ] `focus` and `selection` are `$state` on `+page.svelte`; `go()` and its `goto()` call are gone,
      and the three call sites (`activate`, `ascend`, `pickResult`) set state directly
- [ ] The `live` flag and its `onMount` at `+page.svelte:28-29` are removed, and the comment above
      them describing the prerender/query-string gap goes with them
- [ ] `locale` is read from `localStorage` after mount and written on every change, falling back to
      `DEFAULT_LOCALE` when absent or when the stored value is not one of the three Locales
- [ ] A `?path=`, `?focus=` or `?lang=` link from an older build opens at the Cores in the stored
      Locale without erroring and without the query string affecting anything
- [ ] `document.documentElement.lang` still follows the active Locale
- [ ] `pnpm check` and `pnpm test` pass with no unused imports or dead exports left behind

## Notes

ADR-0005 records this decision and its reasoning; read it before starting. The back button leaving
the app is the intended outcome, not a regression to work around — do not add a history shim.

`pickResult` currently computes its own Focus (`focus: node.children.length ? node : node.parent`)
and does **not** go through `focusShowing`, so nothing about search changes here.

Locale is the only state that outlives the visit. Do not persist Focus or Selection; the spec's
Out of Scope section is explicit about why.

Take care with the `localStorage` read: it must happen after mount, so the Locale switcher's active
pill and `<html lang>` settle one frame late. That is accepted. The Wheel must not wait on it — if
the Wheel's first paint starts depending on Locale-from-storage, that is a new flash and it defeats
issue 03.

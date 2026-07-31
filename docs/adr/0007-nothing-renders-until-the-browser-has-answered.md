# Nothing renders until the browser has answered

Two things the page needs are knowable only in a browser: which Locale the reader last chose, which
lives in `localStorage`, and how wide the screen is, which decides the ring count and the Framing.
A prerendered file knows neither.

Every attempt to render before knowing them showed. Rendering the default and correcting after mount
flashed Portuguese into English a frame later. Shipping both Wheels and letting a media query pick
fixed the width half without a wait — the page was correct on first paint, and correct with
JavaScript off — but it could do nothing for the Locale, which no media query can answer. The
flicker that remained was the one people actually noticed, because words changing under you reads as
a fault in a way a layout settling does not.

So the page renders a loader and nothing else until both answers are in. One render path, one
`<Wheel>`, constructed once with the right Framing and the right Locale.

## Consequences

- **The prerendered HTML is a spinner.** It went from the full Cores view to 4KB that can do nothing
  on its own. `prerender = true` now buys hosting simplicity and a fast first byte, not a usable
  first paint.
- **With JavaScript disabled the app never appears.** It shows the loader forever. This is a real
  regression against the explorer spec's reason for prerendering — "so the Cores are visible before
  JavaScript runs" — and it is accepted rather than mitigated.
- The loader announces itself in Portuguese via `role="status"`, because which Locale the reader
  wants is one of the two things it is waiting to find out. Portuguese is canonical (ADR-0003), so
  it is the honest default rather than an arbitrary one.
- `.scratch/wheel-prune/issues/03-both-wheels-css-chooses.md` is superseded the session after it
  shipped. Its reasoning against a spinner still stands on its own terms — phones were getting a
  correct first paint for free, and now pay a wait for a problem that was originally desktop-only.
  That trade was made knowingly, in exchange for never seeing the language change under you.
- There is no longer a `mounted` gate threaded through `rings` and `framing` to keep them agreeing
  with a server render. Nothing reads them until the client is live, so they read the breakpoint
  directly.

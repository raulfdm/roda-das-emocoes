# 03 — Prerender both Wheels; let CSS choose

**What to build:** the first paint is correct on every screen without waiting for JavaScript. Both
the phone Wheel and the desktop Wheel go into the prerendered markup, a media query picks between
them before the first paint, and the page collapses to a single instance once mounted.

**Blocked by:** 01

**Status:** wontfix — superseded by ADR-0007 the session after it shipped.

> **Superseded.** This shipped and worked: the breakpoint resolved before the first paint, with no
> spinner and no wait, correct with JavaScript off. It could not touch the *other* unknown. The
> Locale lives in `localStorage`, no media query can answer for it, and Portuguese turning into
> English one frame after load was the flicker that actually got noticed — words changing under you
> read as a fault in a way a layout settling does not.
>
> So the page now waits for both answers behind a full-page loader. See ADR-0007. Both Wheels are no
> longer prerendered; there is one render path and one `<Wheel>`.
>
> The reasoning below against a spinner is not disowned — phones did lose a correct free first paint
> to fix a problem that started out desktop-only, and no-JS readers now get nothing at all. That was
> traded knowingly.

- [ ] The prerendered HTML contains both Wheels: `framing: HALF, rings: 1` in a `lg:hidden` wrapper
      and `framing: WHOLE, rings: 3` in a `hidden lg:block` wrapper
- [ ] A desktop reload paints the whole disc with all three rings immediately — no half-disc, no
      7-Core intermediate state, no rearrangement at hydration
- [ ] A phone reload paints exactly what it does today, no slower and with no spinner or skeleton
- [ ] With JavaScript disabled, both platforms still get the right Wheel
- [ ] After mount the page renders **one** Wheel, chosen by `MediaQuery` as it is today, so a tap
      does not re-render a hidden 130-node SVG
- [ ] Only one copy is ever in the tab order or the accessibility tree; a screen reader never meets
      the same wedge twice
- [ ] The Focus readout above the Wheel keeps following `cropsCentre(framing)` and appears on the
      phone Wheel only

## Notes

Tailwind's `hidden` is `display: none`, which removes an element from the tab order and the
accessibility tree — that is what makes the duplication safe rather than a double-announcement bug.
Do not reach for `visibility` or `opacity`, and do not put `aria-hidden` on either copy: which one is
hidden is decided by CSS at paint time and `aria-hidden` is static, so it would be wrong half the
time.

The reason a spinner was rejected: phones currently get a correct first paint for free from the
prerender, and a spinner would make the primary platform (ADR-0001) pay for a desktop-only jump. The
spec records this.

**Framing itself is not being revisited.** Ticket 11's half-disc-on-phones is the input to this
issue, not its subject.

Watch the collapse-to-one step. It must not itself cause a visible change — the instance that
survives has to be the one CSS was already showing, and the reader should not be able to tell the
moment it happens.

**Page size is explicitly not a concern here.** The phone carries the desktop Wheel's markup; it is
repetitive SVG, it gzips well, and it was weighed and accepted when this approach was chosen. Do not
measure it, do not report it, and do not trade the correct first paint away for bytes.

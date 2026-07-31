// One route, prerendered to static HTML. What that buys is hosting simplicity and a fast first byte.
//
// What it can no longer claim is a usable first paint. Prerendering was originally taken for that —
// the Cores on screen before JavaScript runs — and ADR-0007 gave it up: the Locale lives in
// `localStorage` and the breakpoint in the window, neither of which a static file can reach, so the
// page shows a loader until it has mounted and can read them both. What ships from here is that
// loader, and with JavaScript disabled it is all that ever ships.
export const prerender = true;

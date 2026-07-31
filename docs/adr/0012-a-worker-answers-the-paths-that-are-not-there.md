# A Worker answers the paths that are not there

ADR-0005 left the app with one route, so every other path is a typo or a link written by an older
build. Sending those to the Wheel rather than a 404 was implemented as a Cloudflare `_redirects`
catch-all, `/*  /  302`, on the belief that a real file wins first and the rule only ever sees a
miss. Workers Assets does not work that way. Its documentation is explicit: _"redirects are always
followed, regardless of whether or not an asset matches the incoming request."_ The rule therefore
matched `/` itself and answered it with a 302 to `/`, and the deployed site served nothing but a
redirect loop — not a bad 404 path, no page at all.

Exempting each real path with a `200` self-proxy above the catch-all is expressible, and it is a
trap. `/  /index.html  200` reads as the honest spelling and silently does nothing: Cloudflare
resolves `/index.html` back to `/`, reads the rule as a cycle, and drops it. The self-proxy `/  /  200`
survives. Worse, `/_app/*  /_app/:splat  200` is honoured by `wrangler dev` and dropped in
production, so the loop closed over every hashed module while local verification passed — the page
loaded its HTML and then died on `Failed to fetch dynamically imported module`. None of this is
documented, and no local test catches it.

A Worker entry point removes the question instead of answering it. With `main` set and
`not_found_handling` at its default, _"Cloudflare will first attempt to serve static assets if one
matches the incoming request. If an appropriate static asset is not found, Cloudflare will invoke
your Worker script."_ That is precisely "only on a miss", which `_redirects` has no way to say. The
exemption list is not corrected, it is unnecessary.

## Consequences

- `static/_redirects` is deleted. `src/worker.ts` replaces it: a miss gets a 302 to `/`, carrying its
  query string, and `/` itself gets a 404 rather than a redirect to itself — a guard against restaging
  the loop if a build ever ships without its one page.
- **This qualifies ADR-0005's "no server" consequence, and the reading of ADR-0007 that took
  prerendering to mean nothing runs at the edge.** The claim was always about the app: no
  server-rendered content, no request-time data, nothing between the reader and a static file. That
  still holds. The Worker renders nothing, reads nothing, and never runs for a request that resolves
  to a file, so it does not put a server in front of the app — but the deployment is no longer
  assets-only, and `wrangler.toml` now has a `main`.
- Adding files to `static/` is once again just adding files. Under `_redirects` every new asset needed
  a hand-written exemption or the catch-all swallowed it, which is the same class of bug as the
  original, deferred.
- `wrangler dev` is now a faithful test of routing, because asset-first matching behaves the same way
  locally and in production. The `_redirects` divergence is what made the first fix land broken.

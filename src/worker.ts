// Every path the site really has is a file in `build/`, and Cloudflare serves it
// before this Worker is ever invoked: "if an appropriate static asset is not
// found, Cloudflare will invoke your Worker script". So reaching here means the
// request matched nothing on disk, which — the app having one route (ADR-0005:
// the Wheel's place is not addressable) — makes it a typo or a stale link. Send
// it to the Wheel rather than answer a 404.
//
// This replaces a `_redirects` catch-all, which could not express "only on a
// miss". Workers Assets applies redirect rules *before* it looks for an asset,
// so `/*  /  302` also matched `/` itself and every hashed file under `/_app/`,
// and the site served nothing but a redirect loop. Exempting each real path by
// hand needed a `200` self-proxy per path, and the dynamic one
// (`/_app/*  /_app/:splat  200`) is honoured by `wrangler dev` but silently
// dropped in production — a divergence no local test catches. Asset-first
// routing makes the exemption list unnecessary instead of merely correct.
//
// A 302, not a rewrite: a rewrite would serve the prerendered `/` HTML while the
// URL bar still read `/whatever`, and the client router — which knows only `/` —
// would find no matching route on hydration and render its own 404 over the top.
// Redirecting fixes the URL first, so the app boots on the route it was built
// for. The query string rides along; nothing reads it (ADR-0005 emptied the URL),
// but dropping it silently would be a second surprise for anyone who put it there.
export default {
	fetch(request: Request): Response {
		const url = new URL(request.url);

		// `/` is served from `build/index.html` and so never arrives here. If it
		// ever does, the build is missing its one page, and redirecting `/` to `/`
		// would restage the exact loop this file exists to end.
		if (url.pathname === '/') {
			return new Response('Not found', { status: 404 });
		}

		return Response.redirect(new URL(`/${url.search}`, url), 302);
	}
};

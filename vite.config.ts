import adapter from '@sveltejs/adapter-static';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// The app is one prerendered page with no server; see the spec's "Application shape and
			// URL state". Everything shareable lives in query parameters, which adapter-static
			// serves from the same HTML file.
			adapter: adapter()
		})
	],
	test: {
		include: ['src/**/*.test.ts']
	}
});

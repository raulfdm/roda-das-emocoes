<script lang="ts">
	import { WORDS } from '$lib/words';
	import Wheel from '$lib/wheel/Wheel.svelte';
	import WheelList from '$lib/wheel/WheelList.svelte';
	import { WHOLE, cropsCentre } from '$lib/wheel/framing';
	import { descendsInto, focusOn } from '$lib/wheel/geometry';
	import {
		DEFAULT_LOCALE,
		LOCALES,
		LOCALE_NAMES,
		formatPath,
		labelOf,
		searchNodes,
		type Locale,
		type WheelNode
	} from '$lib/wheel/wheel';
	import { onMount } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';

	/**
	 * Where you are in the Wheel, and nothing else.
	 *
	 * There is no Selection: the Wheel is navigated, not answered (ADR-0006). And the address bar
	 * carries nothing either (ADR-0005) — back no longer undoes a descent, so tapping the centre and
	 * `backToCores` are the ways up, and both were always there.
	 */
	/**
	 * `$state.raw`, not `$state` — this is load-bearing, not a micro-optimisation.
	 *
	 * Plain `$state` deep-proxies whatever you assign it, so `focus` would hold a *proxy* of a
	 * WheelNode rather than the Node. Two things break immediately and neither says so: `focus ===
	 * node` is false everywhere it is asked, and `extents.get(node)` in `geometry.ts` misses, which
	 * made `focusOn` throw and took the Wheel's tween down with it while the Path readout carried on
	 * updating — a click that visibly did nothing.
	 *
	 * A Node is also the wrong shape to proxy at all: the tree is immutable and cyclic, with every
	 * Node pointing at its parent, children, ancestors and Core.
	 */
	let focus = $state.raw<WheelNode | null>(null);

	/**
	 * How far the reader has turned the Wheel, clockwise, in radians.
	 *
	 * Sits beside the Focus rather than inside it because it answers a different question — Focus is
	 * where you are in the taxonomy, rotation is how you are holding it. It survives a Focus change
	 * for that reason: a reader who turned the Wheel to somewhere comfortable does not expect
	 * descending to snatch it back (ADR-0009).
	 *
	 * Unbounded rather than folded into a single turn. Winding is real — a reader can keep dragging
	 * the same way — and the only places the angle is compared are `arcsFor`'s flip and crop tests,
	 * which fold it themselves.
	 */
	let rotation = $state(0);

	/**
	 * The Node being read, if the reader has tapped one with nothing left to open.
	 *
	 * This is *not* Selection coming back (ADR-0006, and see ADR-0009 for the line). Nothing is
	 * chosen: nothing is kept, nothing can be copied, and nothing outlives the next move. What a
	 * Reading does is light the Path down to it and take strength away from everything else, which is
	 * a way of looking at the Wheel rather than an answer taken off it.
	 *
	 * Any Node since ADR-0013, where it was a Tertiary before. The rule did not change — a tap on
	 * something with nothing beneath it left to draw can only mean *read this* — but a desktop drawing
	 * all three rings has Cores and Secondaries in that position too.
	 *
	 * `$state.raw` for the same reason `focus` is: a Node is immutable and cyclic, and deep-proxying
	 * one breaks every identity comparison it takes part in.
	 */
	let reading = $state.raw<WheelNode | null>(null);

	/**
	 * The one piece of state that outlives the visit.
	 *
	 * Locale is a preference rather than a position: re-picking your language on every visit is a
	 * real irritation, re-picking your feeling is just using the app. Portuguese stays the fallback
	 * (ADR-0003).
	 */
	const LOCALE_KEY = 'roda-das-emocoes:locale';

	let locale = $state<Locale>(DEFAULT_LOCALE);

	function isLocale(value: string | null): value is Locale {
		return LOCALES.includes(value as Locale);
	}

	function chooseLocale(next: Locale) {
		locale = next;

		// Written on change rather than in an effect, which would fire once on mount and overwrite the
		// stored Locale with the default before it had been read back.
		try {
			localStorage.setItem(LOCALE_KEY, next);
		} catch {
			// Private browsing can refuse to write. The Locale still applies for this visit.
		}
	}

	/**
	 * Nothing is drawn until both unknowns are settled: which Locale to read in, and how wide the
	 * screen is.
	 *
	 * Both answers live in the browser and neither can be reached from a prerendered file. Rendering
	 * first and correcting after is what produced the flicker — Portuguese turning into English a
	 * frame later, and the Wheel changing shape under you. So the page waits instead. It is a real
	 * cost, paid deliberately: the prerendered HTML is now a loader rather than a usable Cores view,
	 * and a reader with JavaScript disabled gets the loader and stops there.
	 */
	let ready = $state(false);

	onMount(() => {
		const stored = (() => {
			try {
				return localStorage.getItem(LOCALE_KEY);
			} catch {
				return null;
			}
		})();

		if (isLocale(stored)) locale = stored;

		ready = true;
	});

	const wide = new MediaQuery('(min-width: 64rem)', false);
	const stillness = new MediaQuery('prefers-reduced-motion: reduce', false);

	/**
	 * How many rings are drawn outward from the Focus: all three on a desktop, one on a phone.
	 *
	 * **Three again** (ADR-0013). It was three, then two, and the reason it was cut is unchanged and
	 * still costly: measured at the Cores on a 1440x900 desktop, in Portuguese, three rings draws all
	 * 130 Nodes with Labels from 7.8px to 15px, median 12.1px, where two draws 48 at 13.6px to 22.5px.
	 * `Sobrecarregado` at 7.8px is a smudge and saying otherwise would be pretending.
	 *
	 * What changed is what the small type is *for*. Under two rings a Tertiary was read by descending to
	 * it, so the rim was a promise of somewhere to go and had to be legible to be worth going. Under
	 * three nothing descends on a desktop — the Wheel is read where it stands, by lighting a Path — and
	 * the rim's job becomes carrying the shape of a branch rather than 82 words you read one at a time.
	 * The word you settle on is not read off the rim at all: it comes up beneath the Wheel at 30px.
	 *
	 * So the trade is the other way round from ADR-0001's. What three rings buys is Roberts' poster,
	 * whole and at once, which is the thing a desktop has the room for and a phone does not.
	 *
	 * **The phone keeps one, and ticket 05's ruling stands** (ADR-0011). It briefly got two, on the
	 * strength of a framing that bought the radius to carry them by cropping the Wheel top and bottom.
	 * The crop was rejected, and with it goes the radius, and with the radius goes the second ring: on
	 * the whole disc a phone draws all 48 Cores and Secondaries at 11.2px median, which is the same
	 * unreadable state this ring count exists to prevent. A phone descends, and always did.
	 */
	const rings = $derived(wide.current ? 3 : 1);

	/**
	 * How much of the Wheel's plane is on screen. The whole disc, on every screen (ADR-0011).
	 *
	 * There were two framings and now there is one. A phone had the right half-disc, then a fan of it,
	 * and both bought a larger radius by showing less of the Wheel — the half-disc by hiding four of
	 * the seven Cores, the fan by cutting the rim top and bottom as well. The radius was real and so
	 * was the cost: a Wheel with a straight edge through it does not read as a Wheel seen through a
	 * window, it reads as one that failed to draw.
	 *
	 * So the Wheel is whole and smaller. It is also, on a phone, *entirely* on screen for the first
	 * time — all seven Cores at 24.8px median, where the half-disc showed three and the fan showed
	 * three. Losing radius bought back the thing both framings were spending it on.
	 */
	const framing = WHOLE;

	/**
	 * What the Wheel is showing, computed here as well as inside it.
	 *
	 * Not duplication for its own sake: what a tap *does* depends on how much is already drawn, and
	 * the search results and the accessible list have to answer that question with the same view the
	 * graphic answers it with. Cheap — it is four numbers off a map lookup — and settled rather than
	 * tweened, so nothing here depends on how far an animation has got.
	 */
	const view = $derived(focusOn(focus, rings));

	const words = $derived(WORDS[locale]);

	/**
	 * A tap on a Node with children.
	 *
	 * Clears the reading: it belonged to where you were, and you have just moved. This is the whole of
	 * its lifetime — there is no way to dismiss one except by moving, because there is nothing to
	 * dismiss.
	 */
	function descend(node: WheelNode) {
		focus = node;
		reading = null;
	}

	/**
	 * A tap on a Node with nothing left to open. It comes up to be read.
	 *
	 * Tapping the same one again puts it back. Reading dims everything off the Path, so without this
	 * the only ways out of that state would be upward — and a reader who has just settled on the wrong
	 * word wants the one next to it, not the level above. On a desktop, where nothing descends, it is
	 * not merely convenient: tapping again and the centre are the only two ways out there are.
	 */
	function read(node: WheelNode) {
		reading = reading === node ? null : node;
	}

	function ascend() {
		focus = focus?.parent ?? null;
		reading = null;
	}

	/**
	 * Whether the Wheel is worth turning.
	 *
	 * It is not, at the bottom of the tree. A Secondary has exactly two Tertiaries, so they take a
	 * half-circle each and both are wholly on screen from the moment you arrive — turning can only
	 * rotate an answer you can already read. Nor is it once a Tertiary is being read, where the
	 * descent has ended and the Wheel has narrowed to that one wedge.
	 *
	 * A *Tertiary* being read, not any Reading. On a desktop a Core or a Secondary can be read too and
	 * that is not the end of anything — you are looking at a branch and may well want to bring it
	 * round to somewhere comfortable, so withdrawing the gesture there would take away the one thing
	 * that makes the far side of a full Wheel readable.
	 *
	 * Decided here rather than inside the Wheel because it turns on the two things this page owns, and
	 * because the hint that advertises the gesture has to agree with whether the gesture exists.
	 */
	const turnable = $derived(reading?.depth !== 2 && focus?.depth !== 1);

	let query = $state('');
	const results = $derived(searchNodes(query, locale));

	/** Emptying the field is the only way the list closes, so every dismissal goes through here. */
	function clearSearch() {
		query = '';
	}

	/**
	 * Escape puts the search away, taking any open result list with it.
	 *
	 * Handled rather than left to the browser: `type="search"` clears on Escape in Chrome and Safari
	 * and does nothing in Firefox, and a results overlay sitting over the Wheel needs a dismissal that
	 * is the same everywhere. `preventDefault` so the browsers that do have an opinion do not also act
	 * on it.
	 *
	 * Bound to every focusable thing inside the search rather than to the field alone: tabbing into
	 * the results is the natural keyboard path through an open list, and Escape has to reach it from
	 * there too. Three bindings rather than one delegated to the `<search>` wrapper, because a
	 * keydown only ever fires on what has focus — so the focusable descendants are the whole of the
	 * surface, and a landmark carrying interaction handlers is what the a11y rules are right to flag.
	 */
	function dismissSearch(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !query) return;

		event.preventDefault();
		clearSearch();
	}

	/**
	 * A search result opens the Wheel at the Node, or at its parent when the Node is a Tertiary and
	 * has nothing to spread.
	 *
	 * A Tertiary is then also left as the reading, because it is the word that was searched for and
	 * arriving at its parent without it would answer a question the reader did not ask.
	 *
	 * Where the Node is already drawn and has nothing left to open, the search has nowhere to move to
	 * and only has to point: it lights the Node where it stands. That is every result on a desktop,
	 * and it is the difference between search answering *where is Sobrecarregado* and search throwing
	 * away a whole Wheel the reader could see in order to answer it.
	 */
	function pickResult(node: WheelNode) {
		clearSearch();

		if (node.depth <= view.depth + view.rings && !descendsInto(node, view)) {
			reading = node;

			return;
		}

		focus = node.children.length ? node : node.parent;
		reading = node.children.length ? null : node;
	}

	// Every Label, Path and control on the page is in the active Locale, so the document has to say
	// so or a screen reader will read Portuguese with an English voice.
	$effect(() => {
		document.documentElement.lang = locale;
	});
</script>

<svelte:head>
	<title>{words.title}</title>
	<meta name="description" content={words.tagline} />
</svelte:head>

{#if !ready}
	<!--
		Announced in the default Locale, because which Locale the reader wants is one of the two things
		this loader is waiting to find out.
	-->
	<div class="flex min-h-full items-center justify-center" role="status">
		<span
			class="size-8 animate-spin rounded-full border-2 border-stone-300 border-t-teal-700"
			aria-hidden="true"
		></span>
		<span class="sr-only">{WORDS[DEFAULT_LOCALE].loading}</span>
	</div>
{:else}
	<!--
		`min-h-full`, and it has been `min-h-screen`, `min-h-dvh` and `min-h-svh` before that. All three
		were attempts to spell the viewport correctly from in here, and the last of them is now spelled
		once, in `app.css`, on the `html` that clips the page and the `body` that scrolls it. This is a
		percentage of that, which is the whole of what it needs to say: fill the scroller, so `mt-auto`
		has something to push the footer against.
	-->
	<div class="mx-auto flex min-h-full max-w-7xl flex-col gap-6 px-4 py-6 text-stone-900">
		<header class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
			<div>
				<h1 class="text-2xl font-semibold tracking-tight">{words.title}</h1>
				<p class="text-sm text-stone-600">{words.tagline}</p>
			</div>

			<!--
				Search sits in the header with the Locale switcher because both are chrome. It used to be
				the second thing on the page — full width, its own heading, a bordered field with a
				shadow — which put it in the strip directly above the Wheel that a phone can least
				spare, and left the Wheel arriving third on the page it exists for.
			-->
			<div class="flex w-full items-center gap-3 lg:w-auto">
				<search class="relative min-w-0 flex-1 lg:w-64 lg:flex-none">
					<label class="sr-only" for="wheel-search">{words.searchLabel}</label>
					<input
						id="wheel-search"
						type="search"
						autocomplete="off"
						bind:value={query}
						onkeydown={dismissSearch}
						placeholder={words.searchPlaceholder}
						class="w-full rounded-full border border-stone-300 bg-white py-1.5 pl-3.5 text-sm placeholder:text-stone-400"
						class:pr-3.5={!query}
						class:pr-16={query}
					/>
					{#if query}
						<!-- Clearing only puts the search away; it never moves the Wheel. -->
						<button
							type="button"
							class="absolute inset-y-0 right-1 my-1 rounded-full px-2 text-xs text-stone-500 hover:bg-stone-100 hover:text-stone-800"
							onclick={clearSearch}
							onkeydown={dismissSearch}
						>
							{words.searchClear}
						</button>
					{/if}

					{#if query.trim()}
						<!--
							Results are full Paths, never bare words. Several Labels genuinely sit on more
							than one Node — `Desapontado` on three — and the Path is the only thing that
							tells them apart, so a list of words would be actively misleading.
						-->
						<ul
							class="absolute top-full left-0 z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-lg"
						>
							{#each results as node (node.id)}
								<li>
									<button
										type="button"
										class="flex w-full flex-wrap items-baseline gap-x-2 px-3 py-2 text-left hover:bg-stone-100 focus-visible:bg-stone-100 focus-visible:outline-2 focus-visible:outline-teal-700"
										onclick={() => pickResult(node)}
										onkeydown={dismissSearch}
									>
										<span class="font-medium">{labelOf(node, locale)}</span>
										<span class="text-sm text-stone-500">{formatPath(node, locale)}</span>
									</button>
								</li>
							{:else}
								<li class="px-3 py-2 text-sm text-stone-500">{words.searchEmpty}</li>
							{/each}
						</ul>
					{/if}
				</search>

				<!--
					A select rather than three pills. The pills spelled out every Locale at all times,
					which made the widest control on the page one that is touched about once ever — and
					on a phone it crowded the search field it shares a row with. A select shows the one
					that is active and keeps the rest folded away, which is the right proportion for a
					setting rather than a destination. Not a `<nav>` for the same reason: switching
					Locale is a preference, not navigation.
				-->
				<div class="relative flex-none">
					<label class="sr-only" for="wheel-locale">{words.localeSwitcher}</label>
					<select
						id="wheel-locale"
						value={locale}
						onchange={(event) => {
							const next = event.currentTarget.value;
							if (isLocale(next)) chooseLocale(next);
						}}
						class="appearance-none rounded-full border border-stone-300 bg-white py-1.5 pr-8 pl-3.5 text-sm"
					>
						{#each LOCALES as option (option)}
							<option value={option}>{LOCALE_NAMES[option]}</option>
						{/each}
					</select>
					<span
						aria-hidden="true"
						class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-stone-500"
					>
						▾
					</span>
				</div>
			</div>
		</header>

		<!--
			Capped against the viewport height so the whole poster fits on a desktop without scrolling.
			`--page-gutter` matches this page's own `px-4`, and is what lets a cropped Wheel reach past
			it to the screen's edge — only the page knows how far that is.
		-->
		<div
			class="mx-auto w-full max-w-[36rem] lg:max-w-[min(100%,calc(100dvh-11rem))]"
			style="--page-gutter: 1rem"
		>
			{#if cropsCentre(framing)}
				<!--
					The words the centre can no longer hold. Half-disc framing puts the Wheel's centre on
					the box's left edge, leaving a half-circle about one Label wide, so where you are is
					read here instead — at the full width of the column, which is what Portuguese and
					Spanish Paths need and what the centre never had much of even on the whole disc.
				-->
				<p class="mb-2 min-h-6 text-center text-sm text-balance text-stone-600">
					{focus ? formatPath(focus, locale) : words.centreHint}
				</p>
			{/if}

			<Wheel
				{focus}
				{locale}
				{words}
				{rings}
				{framing}
				{rotation}
				{reading}
				{turnable}
				onDescend={descend}
				onRead={read}
				onAscend={ascend}
				onClear={() => (reading = null)}
				onTurn={(next) => (rotation = next)}
			/>

			{#if reading}
				<!--
					The word, at a size the rim cannot give it. Below the Wheel rather than above it, and set
					large, because at this point the word is the page: the Wheel above has dimmed to the one
					branch it names, and everything else on screen is a way back.

					It carries the whole weight of the small type on a desktop rim. 82 Tertiaries drawn at
					once put `Sobrecarregado` at 7.8px, which is a shape rather than a word — and the answer
					to that is not to draw fewer of them but to say the one you touched at 30px, here.

					The Path stays with it in small type, and only where it says something the Label does
					not. Several Labels sit on more than one Node — `Desapontado` on three — so the word
					alone does not identify a Tertiary; a Core's Path is the Core, and printing `Raiva`
					twice under itself is the readout padding.
				-->
				<p class="mt-4 text-center text-balance" aria-live="polite">
					<span class="block text-3xl font-semibold text-stone-900">
						{labelOf(reading, locale)}
					</span>
					{#if reading.depth > 0}
						<span class="mt-1 block text-sm text-stone-500">{formatPath(reading, locale)}</span>
					{/if}
				</p>
			{:else if rotation === 0 && turnable}
				<!--
					Retires itself the moment the Wheel has been turned, because by then it has been
					understood and a permanent instruction would just be furniture.
				-->
				<p class="mt-3 text-center text-xs text-stone-400">{words.turnHint}</p>
			{/if}

			{#if focus}
				<!--
					The two ways back, and they are only two things at one depth.

					The centre of the Wheel has always been the way up, and it is not legible as one: it
					is a circle with a Path written in it, and nothing about a word says it can be
					tapped, let alone which direction tapping it goes. It stays — it is the fastest
					target on the page and it is where the eye already is — but it no longer has to carry
					the affordance alone.

					`focus.parent` rather than a depth test, and it is what keeps the row honest: a Core
					in focus has no parent, so up one level *is* the whole Wheel and the second button
					would be the first one wearing different words. The pair only appears at a Secondary,
					which is exactly the place the reader described being stuck — down among the
					Tertiaries with the level above out of reach.
				-->
				<div class="mt-4 flex flex-wrap justify-center gap-2">
					{#if focus.parent}
						<button
							type="button"
							class="flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm hover:bg-stone-50"
							aria-label={words.up}
							onclick={ascend}
						>
							<span aria-hidden="true" class="text-stone-400">↑</span>
							{words.back}
						</button>
					{/if}

					<button
						type="button"
						class="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm hover:bg-stone-50"
						onclick={() => {
							focus = null;
							reading = null;
						}}
					>
						{words.backToCores}
					</button>
				</div>
			{/if}
		</div>

		<details class="rounded-xl border border-stone-200 bg-white p-4">
			<summary class="cursor-pointer text-sm font-semibold tracking-wide text-stone-500 uppercase">
				{words.listHeading}
			</summary>
			<p class="mt-1 mb-3 text-sm text-stone-500">{words.listHint}</p>
			<WheelList {focus} {locale} {words} {reading} {view} onDescend={descend} onRead={read} />
		</details>

		<footer class="mt-auto pt-2 text-sm text-stone-500">
			{words.credit}
			<a
				class="underline underline-offset-2 hover:text-stone-800"
				href="https://feelingswheel.app/"
				rel="noopener external"
			>
				{words.creditLink}
			</a>
		</footer>
	</div>
{/if}

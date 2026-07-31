<script lang="ts">
	import type { Words } from '$lib/words';
	import { untrack } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { MediaQuery } from 'svelte/reactivity';
	import { cropsCentre, slices, viewBox, type Framing, type Ink, type Point } from './framing';
	import { arcsFor, descendsInto, focusOn, HOLE, interpolateView, type View } from './geometry';
	import { formatPath, labelOf, tintStyle, type Locale, type WheelNode } from './wheel';

	interface Props {
		/** The Node expanded to fill the circle; null is the whole Wheel. */
		focus: WheelNode | null;
		locale: Locale;
		words: Words;
		/** Rings drawn outward from the Focus — two on every screen since ADR-0010. */
		rings: number;
		/**
		 * Which rectangle of the Wheel's plane is on screen. A desktop shows the whole disc; a phone
		 * shows a fan of it, at roughly 1.4x the radius the whole disc would fit into. See `framing.ts`.
		 */
		framing: Framing;
		/**
		 * How far the Wheel has been turned, clockwise, in radians.
		 *
		 * Applied as one transform on one group rather than folded into the arcs — see `arcsFor`. The
		 * reader owns this, so it is passed in and reported back rather than kept here.
		 */
		rotation: number;
		/**
		 * The Tertiary being read, so its wedge can say so.
		 *
		 * ADR-0009 ruled there would be no mark on the Wheel, on the grounds that marking a Node is
		 * what Selection did and Selection is gone. That was drawing the line in the wrong place. The
		 * objection to Selection was that it *kept* something — a chosen Node, with somewhere to go and
		 * something to do with it — not that a tap was allowed to leave a trace. Without one the Wheel
		 * and the readout disagree about what just happened, and a Tertiary reads as the one thing on
		 * the Wheel that does not respond to being tapped.
		 */
		reading: WheelNode | null;
		/**
		 * Whether turning is offered at all. Decided by the page, which owns both things it depends on.
		 *
		 * Every gesture the Wheel has is a way of getting somewhere, and turning stops being one twice
		 * over: at a Secondary, where the two Tertiaries take a half-circle each and are both wholly on
		 * screen already, and once a Tertiary is being read, where the descent has ended. In both the
		 * drag would spin the answer round without bringing anything new into view.
		 */
		turnable: boolean;
		/** A tap on a Node with children: descend into it. */
		onDescend: (node: WheelNode) => void;
		/** A tap on a Tertiary. It has nothing to open, so it is read instead — see ADR-0009. */
		onRead: (node: WheelNode) => void;
		/** A tap on the centre: move the Focus up one level. */
		onAscend: () => void;
		/** A drag has turned the Wheel to a new angle. */
		onTurn: (rotation: number) => void;
	}

	let {
		focus,
		locale,
		words,
		rings,
		framing,
		rotation,
		reading,
		turnable,
		onDescend,
		onRead,
		onAscend,
		onTurn
	}: Props = $props();

	const stillness = new MediaQuery('prefers-reduced-motion: reduce', false);

	const target = $derived(focusOn(focus, rings));

	// Svelte drives the zoom itself: one tweened view, from which every arc is re-derived each
	// frame. No element is animated individually, and d3 never touches the DOM.
	const view = new Tween<View>(untrack(() => target), {
		easing: cubicOut,
		interpolate: (from, to) => (t) => interpolateView(from, to, t)
	});

	$effect(() => {
		view.set(target, { duration: stillness.current ? 0 : 520 });
	});

	/**
	 * How far this Node's word reaches along the radius, for the geometry to balance it against.
	 *
	 * The measurement lives here because it needs the Locale and the type size, and `geometry.ts`
	 * knows neither by design. It is the same `fontSize` and `inkOf` the Labels are actually drawn
	 * with, called once more rather than approximated — a placement computed from a different guess
	 * at the word's length than the one on screen is a placement that is wrong by the difference.
	 */
	function reachOf(node: WheelNode, arcLength: number, thickness: number): number {
		const label = labelOf(node, locale);

		return inkOf(fontSize(arcLength, thickness, label), label).along;
	}

	const arcs = $derived(arcsFor(view.current, framing, rotation, reachOf));

	/**
	 * Whether this Node is one the reader has looked past.
	 *
	 * Only its siblings dim — the Nodes it was chosen *from* — and never its ancestors, which are the
	 * Path and stay at full strength. Dimming rather than hiding, because a word alone does not say
	 * much: `Sobrecarregado` means what it means partly by not being `Ansiedade`, and taking the
	 * alternative off the screen takes that with it. It also keeps the sibling tappable, which is how
	 * you change your mind.
	 */
	function muted(node: WheelNode): boolean {
		return reading !== null && node !== reading && node.depth === reading.depth;
	}

	/** The Focus the Wheel has already squared up for, so one arrival is acted on once. */
	let squaredFor: WheelNode | null = null;

	/**
	 * Arriving at a Secondary brings the Wheel round to square.
	 *
	 * Its two Tertiaries take a half-circle each, so they only sit straight at some multiple of a
	 * half-turn. Descend from 135° and the pair arrives skewed — and turning is withdrawn at this
	 * level, so there is then no way to straighten it, which is what made this worth doing rather than
	 * living with.
	 *
	 * The *nearest* half-turn, not zero: the Wheel moves at most 90° and the reader keeps roughly the
	 * orientation they chose. Which of the two Tertiaries ends up on the left is not something anyone
	 * has an opinion about; how far the Wheel lurches to get there is.
	 */
	$effect(() => {
		if (turnable) {
			squaredFor = null;

			return;
		}

		stopCoasting();

		if (squaredFor === focus) return;
		squaredFor = focus;

		const from = untrack(() => rotation);
		const square = Math.round(from / Math.PI) * Math.PI;
		if (Math.abs(square - from) < 1e-6) return;

		// Applied in one step rather than eased. It lands on the same frame the Focus change starts its
		// 520ms zoom, and a Wheel that is re-spreading every wedge across the circle is not a Wheel
		// anyone can see rotate underneath it — the movement that would carry the eye is already there.
		//
		// An eased version was written first and is not worth its weight: it needs a second animation
		// loop beside the throw's, and the clock those two loops share turned out to be the one thing
		// in this component that is genuinely hard to get right. See `coast`.
		onTurn(square);
	});

	/** The turn as SVG degrees, which is the one attribute a drag writes. */
	const turned = $derived(((rotation * 180) / Math.PI).toFixed(3));

	/**
	 * Where the Wheel's centre has landed inside the frame, as percentages of the box.
	 *
	 * The readout is an HTML overlay rather than part of the SVG, so it cannot ride the `viewBox` and
	 * has to be placed against it. Working that out from the framing rather than hard-coding a centred
	 * `inset` is what lets one component serve both: on the whole disc this comes out at dead centre,
	 * and on the half-disc it lands on the box's left edge, where half of it is cropped away.
	 */
	const centre = $derived({
		left: ((0 - framing.x) / framing.w) * 100,
		top: ((0 - framing.y) / framing.h) * 100,
		width: ((HOLE * 2) / framing.w) * 100,
		height: ((HOLE * 2) / framing.h) * 100
	});

	/** A half-circle has no room for words, so under a cropping frame the Path is read off the page. */
	const cropped = $derived(cropsCentre(framing));

	/**
	 * Roughly how wide a word is as a multiple of its font size, per character.
	 *
	 * A single constant serving two callers, which is why it is named rather than inlined: `fontSize`
	 * uses it to keep a Label inside its ring, and `inkOf` uses it to work out how far the drawn word
	 * then reaches. If those two disagreed, Labels would be sized against one estimate and cropped
	 * against another.
	 */
	const CHAR_WIDTH = 0.62;

	/**
	 * How big a Label can be drawn. Labels run along the radius, so the ring's thickness caps their
	 * length and the wedge's arc caps their height.
	 */
	function fontSize(arcLength: number, thickness: number, label: string): number {
		const byHeight = arcLength * 0.6;
		const byLength = (thickness * 0.8) / Math.max(4.5, label.length * CHAR_WIDTH);

		return Math.min(byHeight, byLength);
	}

	/**
	 * How far the drawn word reaches from its anchor, along the radius and across it.
	 *
	 * Worth stating rather than approximating with the font size in both directions, which is what
	 * the frame used to be asked. A Label is many times longer than it is tall — `Sobrecarregado` at
	 * a given size runs about nine times its own height — so the two axes are not interchangeable,
	 * and under a frame that crops top and bottom the long axis is the one that escapes.
	 */
	function inkOf(size: number, label: string): Ink {
		return { along: (size * label.length * CHAR_WIDTH) / 2, across: size / 2 };
	}

	/** Anything below this is unreadable, so the Label is left off rather than drawn as a smudge. */
	const MIN_FONT_SIZE = 0.019;

	/** Only a frame that clips can cut a Label; the whole disc paints past its box. See `slices`. */
	function sliced(at: Point, size: number, label: string): boolean {
		return cropped && slices(framing, at, inkOf(size, label));
	}

	const TAU = Math.PI * 2;

	/**
	 * How far a pointer may travel before it stops being a tap and becomes a turn, in CSS pixels.
	 *
	 * Measured in pixels rather than in radians on purpose. The same small movement near the centre
	 * sweeps a large angle and near the rim a tiny one, so an angular threshold would make the Wheel
	 * feel stuck at the rim and hair-triggered at the hub — whereas the reader's own sense of "did I
	 * mean to drag that?" is about how far their finger went, not about where it was.
	 */
	const DRAG_SLOP = 6;

	/**
	 * How much of its speed a throw keeps per 60fps frame, and where it gives up.
	 *
	 * Ticket 04 called momentum "a tone decision as much as a physics one" and guessed that a Wheel
	 * coasting like a prize wheel would read as flippant. Shipped without it, the stop reads as a
	 * fault instead — the Wheel arrives at a dead halt under your finger. So it coasts, and the tone
	 * worry is answered by the numbers rather than by refusing: `0.93` settles a brisk throw in about
	 * half a second over some 7°, which is a Wheel being set down rather than one being spun.
	 *
	 * It was `0.97` first — a second and about 17° — and that overshot in the hand. A coast is there
	 * to take the dead stop off the end of a drag, not to carry the Wheel somewhere you did not aim
	 * it; past a few degrees it stops reading as follow-through and starts reading as drift.
	 *
	 * There is no gain. The reference amplifies a touch flick 3× (ticket 02); here a throw carries
	 * exactly the speed it was given, because the gesture is a way to read the far side of the Wheel
	 * and not a thing to play with.
	 */
	const FRICTION = 0.93;
	const FRAME = 1000 / 60;

	/** Below this release speed there was no throw, only a drag that stopped. Radians per ms. */
	const MIN_THROW = 0.0003;

	/** Below this a coast is no longer visible, so it ends rather than creeping. */
	const MIN_COAST = 0.00008;

	/**
	 * How long a pause before release discards the throw.
	 *
	 * Someone who drags, holds still, and then lets go has placed the Wheel deliberately. Without
	 * this the last speed measured before they stopped moving is still sitting there, and the Wheel
	 * flies off from a standstill.
	 */
	const STALE_MS = 80;

	/** The box the Wheel is drawn in, needed to find the centre a drag is measured around. */
	let box: HTMLDivElement;

	let turning = $state(false);
	/** Signed angular speed of the drag, in radians per millisecond. */
	let velocity = 0;
	let lastTime = 0;
	let coasting = 0;

	function stopCoasting() {
		if (!coasting) return;

		cancelAnimationFrame(coasting);
		coasting = 0;
	}

	/** Carries the throw on after release, shedding `FRICTION` of its speed every frame. */
	function coast(previous: number | null) {
		coasting = requestAnimationFrame((now) => {
			// Capped above so a tab backgrounded mid-throw resumes rather than jumping a whole turn, and
			// floored at zero because the first frame has no previous to measure from — see `settle`.
			const dt = Math.max(0, Math.min(now - (previous ?? now), 4 * FRAME));

			velocity *= Math.pow(FRICTION, dt / FRAME);
			onTurn(rotation + velocity * dt);

			coasting = 0;
			if (Math.abs(velocity) > MIN_COAST) coast(now);
		});
	}

	$effect(() => stopCoasting);
	/**
	 * Whether this gesture has passed `DRAG_SLOP` and become a turn.
	 *
	 * Deliberately not `$state`: nothing renders from it, and it has to be readable by the `click`
	 * that fires *after* `pointerup` on the same gesture. That click is the reason it exists — a drag
	 * that finishes over a wedge still raises one, so without this a turn would also descend.
	 */
	let dragged = false;
	let lastAngle = 0;
	let downAt = { x: 0, y: 0 };

	/** The pointer's angle about the Wheel's centre, clockwise, in screen coordinates. */
	function angleAt(event: PointerEvent): number {
		const rect = box.getBoundingClientRect();
		// The centre is wherever the Framing put it — dead centre on a desktop, the box's left edge on
		// a phone — so it is read off the same percentages the readout overlay is placed with rather
		// than assumed to be the middle of the box.
		const cx = rect.left + (rect.width * centre.left) / 100;
		const cy = rect.top + (rect.height * centre.top) / 100;

		// `atan2` grows clockwise in SVG's y-down coordinates, which is the direction the Wheel's own
		// angles grow, so the delta below carries straight through with no sign correction.
		return Math.atan2(event.clientY - cy, event.clientX - cx);
	}

	function grab(event: PointerEvent) {
		if (event.pointerType === 'mouse' && event.button !== 0) return;
		// A settled Wheel does not turn, and must not swallow the page's own gestures either.
		if (!turnable) return;

		// Catching a coasting Wheel is about the spin, not about what is under the finger, so the
		// gesture is marked as a turn from the outset and the click it raises opens nothing.
		dragged = coasting !== 0;
		stopCoasting();

		velocity = 0;
		turning = true;
		downAt = { x: event.clientX, y: event.clientY };
		lastAngle = angleAt(event);
		lastTime = event.timeStamp;
		box.setPointerCapture(event.pointerId);
	}

	function turn(event: PointerEvent) {
		if (!turning) return;

		const now = angleAt(event);

		if (!dragged) {
			if (Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y) <= DRAG_SLOP) return;
			dragged = true;
			// Re-anchored at the moment the gesture becomes a turn, so the Wheel does not jump by the
			// slop the reader has already spent proving they meant it.
			lastAngle = now;
			lastTime = event.timeStamp;

			return;
		}

		// Shortest way round. `atan2` has a seam at 9 o'clock where it wraps from +π to -π, and taken
		// literally a pointer crossing it reports very nearly a full turn in one frame.
		let delta = now - lastAngle;
		if (delta > Math.PI) delta -= TAU;
		if (delta < -Math.PI) delta += TAU;

		const dt = event.timeStamp - lastTime;
		if (dt > 0) {
			// Weighted towards the newest sample but not equal to it: a throw should be decided by the
			// last few milliseconds of the gesture, while a single stuttery frame should not decide it
			// alone.
			const instant = delta / dt;
			velocity = velocity === 0 ? instant : instant * 0.6 + velocity * 0.4;
		}

		lastAngle = now;
		lastTime = event.timeStamp;
		onTurn(rotation + delta);
	}

	function release(event: PointerEvent) {
		if (!turning) return;

		turning = false;
		box.releasePointerCapture(event.pointerId);

		// A pause before letting go means the Wheel was placed, not thrown.
		if (event.timeStamp - lastTime > STALE_MS) velocity = 0;

		// Someone who has asked for less motion gets the Wheel where they left it. A coast is movement
		// the app continues on its own, which is exactly what the preference is about.
		if (stillness.current || Math.abs(velocity) < MIN_THROW) return;

		coast(null);
	}

	/**
	 * A tap only counts if the gesture never became a turn.
	 *
	 * `dragged` outlives its gesture — nothing clears it until the next `pointerdown` — which is
	 * correct for the click that follows a drag and wrong for a click that never had a pointer behind
	 * it. Pressing Enter on the centre button after turning the Wheel would otherwise be swallowed by
	 * a flag left over from the turn.
	 *
	 * `detail` is 0 exactly for keyboard-activated clicks and counts the clicks in the series for
	 * pointer ones, so it is the thing that tells them apart. Only the centre can be reached this way
	 * today — the wedges are inside an `aria-hidden` graphic with no tab stop — but the rule belongs
	 * on the helper rather than on the one caller that currently needs it.
	 */
	function tap(act: () => void): (event: MouseEvent) => void {
		return (event) => {
			if (event.detail !== 0 && dragged) return;

			act();
		};
	}
</script>

<!--
	The turn is driven from the box rather than from the `<svg>`, so a drag that starts on the centre
	overlay turns the Wheel like any other. The overlay's own click survives it: `tap` only fires
	where the gesture never passed `DRAG_SLOP`.
-->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="wheel"
	class:cropped
	class:turning
	class:settled={!turnable}
	bind:this={box}
	onpointerdown={grab}
	onpointermove={turn}
	onpointerup={release}
	onpointercancel={release}
>
	<!--
		The graphic is decorative to assistive technology: the same tree is exposed properly as a
		nested list beside it, which is also where keyboard traversal lives. See ticket 09.
	-->
	<svg viewBox={viewBox(framing)} aria-hidden="true">
		<!--
			One group, one attribute, and the whole Wheel turns. Nothing inside is re-derived by a drag:
			the wedges' `d` is rotation-free by construction, and the Labels' transforms are written in
			the unrotated frame and compose with this one. The only things that do depend on the angle —
			whether a Label reads upside down, and whether the frame cuts it — are computed against the
			turned angle inside `arcsFor`.
		-->
		<g transform="rotate({turned})">
			<g class="wedges">
				{#each arcs as wedge (wedge.node.id)}
					<!--
						No role, no tab stop, no keyboard handler: the whole graphic is aria-hidden, and
						every Node it draws is reachable and operable through the nested list instead.
						Giving these paths a second set of semantics is exactly the duplicate UI the twin
						exists to avoid.
					-->
					{@const opens = descendsInto(wedge.node)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<path
						d={wedge.d}
						class="wedge"
						class:compressed={wedge.compressed}
						class:opens
						class:muted={muted(wedge.node)}
						style={tintStyle(wedge.node.tint)}
						onclick={tap(() => (opens ? onDescend(wedge.node) : onRead(wedge.node)))}
					></path>
				{/each}
			</g>

			<g class="labels">
				{#each arcs as wedge (wedge.node.id)}
					{@const label = labelOf(wedge.node, locale)}
					{@const size = fontSize(wedge.arcLength, wedge.thickness, label)}
					{#if wedge.label && size >= MIN_FONT_SIZE && !sliced(wedge.label.at, size, label)}
						{@const dim = muted(wedge.node)}
						<!--
						`dy` in ems, not a `dominant-baseline` — see the stylesheet. Half a capital's
						height below the baseline puts the middle of `Medo` on the anchor; a word with a
						descender rides a hair low, which is the right thing to trade for every Label
						landing on its own radius in every font.
					-->
					<text
							class:muted={dim}
							transform={wedge.label.transform}
							font-size={size.toFixed(4)}
							dy="0.35em">{label}</text
						>
					{/if}
				{/each}
			</g>
		</g>
	</svg>

	<!--
		Placed off the frame rather than at a fixed inset, so it lands on the Wheel's centre wherever
		the framing has put it. Under half-disc framing that is the box's left edge: the accessible
		name still carries the Path, but the visible words move up to the page, because what is left on
		screen here is a half-circle about one Label wide.
	-->
	{#if focus}
		{@const path = formatPath(focus, locale)}
		<button
			type="button"
			class="centre"
			style:left="{centre.left}%"
			style:top="{centre.top}%"
			style:width="{centre.width}%"
			style:height="{centre.height}%"
			aria-label="{words.up} — {path}"
			onclick={tap(onAscend)}
		>
			<!--
				The arrow is the whole of what the centre was missing. It was a circle with a Path
				written in it, which says where you are and nothing at all about what happens if you
				touch it — and on a phone there is no hover to discover the rest with, so the one
				control at the middle of the Wheel read as a caption.

				Drawn above the Path rather than beside it: the hole is a circle, so a glyph on the
				same line steals from the width the longest word in the Path needs, while the line
				above it is otherwise empty. Muted, and set smaller than the Path, because it is a
				direction rather than a thing to read.

				`aria-hidden`, because the accessible name already opens with `{words.up}` — a screen
				reader that also announced the glyph would hear the instruction twice.
			-->
			<span aria-hidden="true" class="centre-up">↑</span>

			{#if !cropped}
				<span class="centre-path">{path}</span>
			{/if}
		</button>
	{:else}
		<div
			class="centre centre-idle"
			style:left="{centre.left}%"
			style:top="{centre.top}%"
			style:width="{centre.width}%"
			style:height="{centre.height}%"
		>
			{#if !cropped}
				<span class="centre-hint">{words.centreHint}</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	/*
		The Wheel's own styling is scoped component CSS over attributes computed from the tree.
		Tailwind dresses the chrome around it and learns nothing about this palette.
	*/
	.wheel {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		/*
			The Wheel claims the gesture outright, because a turn is angular and has no axis it would
			rather concede.

			`pan-y` was tried, to hand vertical drags back to the browser and get pull-to-refresh with
			them, and it was worse. The page is 761px against a 729px viewport — 32px of real scroll,
			the "whole Wheel" button — so every downward drag on the Wheel spent itself rubber-banding
			the page into a screenful of blank and then springing back. Conceding an axis bought a
			gesture and sold the one the Wheel is for.

			Pull-to-refresh survives where the Wheel is not: the header, the readout, the list and the
			credit all keep default `touch-action`, and the header alone is a 98px strip at the top of
			the page, which is where that gesture starts anyway.
		*/
		touch-action: none;
		cursor: grab;
		/*
			A drag across the Wheel would otherwise sweep a text selection through the Labels it passes,
			which is the browser reading the gesture as the thing it usually is. Set unconditionally
			rather than only while turning: a selection begins on the first pointer move, which is before
			the gesture has travelled `DRAG_SLOP` and earned the class that would suppress it.

			ADR-0006 left "select the word on screen like any other text" as the app's only export route,
			so this would close it — except that a Tertiary now has the Reading readout above the Wheel
			(ADR-0009), which is ordinary HTML and stays selectable. The route survives and improves:
			what you drag over there is real text at a real size, not a Label at 0.02 user units.
		*/
		-webkit-user-select: none;
		user-select: none;
		/*
			`size`, not `inline-size`, so the readout can be measured against whichever axis is
			smaller. Safe here because the box's height never depends on its contents — both framings
			fix it with an aspect ratio.
		*/
		container-type: size;
		margin-inline: auto;
	}

	/*
		The half-disc box is twice as tall as it is wide, so it has to be fitted to the height it is
		given rather than the width: a width-driven box would run off the bottom of exactly the phone
		the framing was chosen for. Shorter than the screen because the page has real chrome above and
		below — the header carrying the title, search and the Locale switcher, the Path readout above,
		and the way back to the Cores below — and a Wheel measured against the whole viewport would
		claim room the app does not have.
	*/
	.wheel.cropped {
		--tall: min(62dvh, 34rem);
		/*
			The frame's own aspect, and the number that reclaimed the empty column. It has to match
			`FAN`'s `h` exactly: the box is what turns the frame into pixels, so a box of a different
			shape letterboxes the frame inside it and paints a strip of the crop back into view.
		*/
		--frame: 1.4;

		/*
			Pulled out to the screen's own edge rather than centred in the column.

			Centred, the disc's flat side lands in the middle of the page with a gutter either side and
			reads as a drawing that failed to finish. Against the edge it reads as what it is: a Wheel
			larger than the screen, continuing past it. The page's gutter is handed in rather than
			assumed, because only the page knows how far it has to reach to escape its own padding.
		*/
		margin-inline-start: calc(0px - var(--page-gutter, 0px));
		margin-inline-end: auto;

		/*
			Driven from the width, not the height, even though it is the height we are fitting to. A
			block box takes `width: auto` from its container rather than from its aspect ratio, so
			asking for a height and letting the width follow silently gives back a full-width box with
			the Wheel letterboxed inside it — and a letterboxed frame leaks a strip of the cropped half
			back into view, which is the one thing this framing exists to prevent. Dividing the height
			by the frame's aspect here says the same thing in the axis CSS will actually honour.

			Which of the two terms binds is the whole point of ADR-0010. At `1 / 2` the height term won
			on every phone, and the Wheel sat in 226px of a 398px column with the rest empty. At
			`1 / 1.2` the width term takes over on a phone of ordinary proportions, so the Wheel fills
			the column and the radius grows with it; the height term stays as the guard for a short or
			landscape screen, where being fitted to the height is once again the right answer.
		*/
		width: min(calc(100% + var(--page-gutter, 0px)), calc(var(--tall) / var(--frame)));
		height: auto;
		aspect-ratio: 1 / var(--frame);
		/* The crop has to bite: this is the frame doing the work the flip correction used to do. */
		overflow: hidden;
	}

	/*
		And again on the graphic itself, because `overflow: visible` above is what lets the whole disc
		paint outside its `viewBox` in the first place. The box is an exact 1:2 so nothing is
		letterboxed, but a half-pixel of rounding here would show as an upside-down Label.
	*/
	.wheel.cropped svg {
		overflow: hidden;
	}

	/*
		The fan's top and bottom edges cut straight through wedges mid-arc, and a hard line across a
		block of colour reads as a rendering fault rather than as a frame — the Wheel looks broken
		rather than larger than the screen. The left edge has never needed this, because the crop there
		lands on the centre hole and reads as a Wheel continuing past the page.

		**On the wedges only, never on the Labels.** Fading the whole graphic was tried and is worse:
		the Labels nearest an edge are precisely the ones a soft edge dims, so a word that `slices` had
		judged readable arrived on screen as a ghost. Whether a Label is shown is a decision with a
		rule behind it, and a gradient is not allowed to overrule it half way. So colour fades out and
		type does not — a Label is either drawn at full strength or not drawn.
	*/
	.wheel.cropped .wedges {
		mask-image: linear-gradient(to bottom, transparent 0, #000 8%, #000 92%, transparent 100%);
	}

	svg {
		display: block;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.wedge {
		transition: opacity 200ms ease-out;
		fill: hsl(var(--h) var(--s) var(--l));
		stroke: color-mix(in oklab, hsl(var(--h) var(--s) calc(var(--l) - 45%)) 55%, transparent);
		stroke-width: 0.003;
		transition: filter 120ms ease-out;
	}

	/*
		Every wedge responds now, so none of them shows the grab cursor the box sets. What they do
		still differs — a wedge with children opens, a Tertiary is only read — and the hover says so:
		opening lifts the wedge, reading merely acknowledges the tap. See ADR-0009.
	*/
	.wedge {
		cursor: pointer;
	}

	.wedge.opens:hover {
		filter: brightness(0.93) saturate(1.15);
	}

	.wedge:not(.opens):hover {
		filter: brightness(0.97);
	}

	/*
		The Tertiaries the reader looked past. Marked by taking strength *away* from them rather than
		adding any to the one that was chosen — an outline was tried and is worse, because a hard black
		line around a wedge reads as a control rather than as an answer, and it fights the palette,
		which is the only thing on the Wheel carrying which Core you are in.

		Enough of a drop to be unambiguous at a glance, not so much that the word stops being legible:
		it is still a real alternative, and still one tap away.
	*/
	.wedge.muted {
		opacity: 0.28;
	}

	.wedge.muted:hover {
		filter: none;
	}

	/*
		Settled: nothing left to bring round, so the drag does nothing — but the Wheel keeps holding the
		gesture rather than handing it back.

		Handing it back was tried and is the same fault as `pan-y`, wearing different clothes. There are
		only ~80px of real page below the fold here, so a downward drag across a Wheel this size spends
		itself rubber-banding into a screenful of blank and springing back. It showed up as "huge
		vertical space at Secondary and Tertiary, primary no" — precisely the two states where the Wheel
		had stopped claiming the gesture.

		So the rule is the simple one: the Wheel never scrolls the page, at any depth. Whether it turns
		is a separate question, and the answer changes; whether it swallows drags does not.
	*/
	.wheel.settled {
		cursor: default;
	}

	/* While turning, the pointer is driving the Wheel and not aimed at anything in particular. */
	.wheel.turning {
		cursor: grabbing;
	}

	.wheel.turning .wedge {
		cursor: grabbing;
	}

	.wheel.turning .wedge:hover {
		filter: none;
	}

	.labels {
		pointer-events: none;
	}

	text.muted {
		opacity: 0.35;
	}

	text {
		text-anchor: middle;
		/*
			No `dominant-baseline`. It was `central`, which centres a word on the font's *em box* — a
			figure computed from the family's ascent and descent metrics, not from the letters. Those
			metrics vary wildly between families: a plain sans centres near enough, while SF Pro carries
			a tall ascent and line gap that put the em box's middle well above the ink. The word then
			sits off its own radius by most of a line, and because the offset is in the Label's local
			frame it leans one way for upright Labels and the other for flipped ones.

			That is invisible on a development machine and obvious on a phone, which is exactly the kind
			of thing not to leave to font metrics. The `dy` below does the same job arithmetically, in
			ems, and gets the same answer everywhere.
		*/
		dominant-baseline: auto;
		fill: #1c1917;
		font-family: inherit;
		transition: opacity 200ms ease-out;
	}

	/*
		The centre is the Path so far and the way back up. Position and size come from the framing —
		see `centre` in the script — so this only has to say that the box is placed by its middle.
	*/
	.centre {
		position: absolute;
		translate: -50% -50%;
		display: grid;
		place-items: center;
		border-radius: 9999px;
		padding: 0 4%;
		background: #fffdf9;
		/*
			`cqmin`, not `cqi`: the cropped box is twice as tall as it is wide, so sizing the ring off
			the inline axis alone would draw it proportionally thinner on a phone than on a desktop.
		*/
		box-shadow: inset 0 0 0 0.4cqmin rgb(28 25 23 / 0.18);
		text-align: center;
		cursor: pointer;
	}

	.centre-idle {
		cursor: default;
	}

	.centre-hint {
		font-size: 2.6cqmin;
		line-height: 1.35;
		text-wrap: balance;
		color: #78716c;
	}

	/*
		Sized and spaced in `cqmin` like everything else in the hole, so it holds its proportion against
		the Wheel rather than against the reader's root font size — the hole is a fixed fraction of the
		box, and a glyph measured in `rem` would swamp it on a small phone.
	*/
	.centre-up {
		font-size: 4.2cqmin;
		line-height: 1;
		margin-bottom: 0.4cqmin;
		/*
			Darker than the first attempt at `#a8a29e`, which rendered as a hairline and disappeared
			against the hole on the first screen it was looked at. It has to be quieter than the Path,
			because the Path is the thing being read — but an affordance nobody notices is the fault
			this was added to fix, so quiet is as far as it goes.
		*/
		color: #78716c;
	}

	.centre:hover .centre-up {
		color: #44403c;
	}

	.centre-path {
		font-size: 3.1cqmin;
		line-height: 1.25;
		font-weight: 500;
		text-wrap: balance;
		color: #292524;
	}

	.centre:not(.centre-idle):hover {
		background: #fff;
		box-shadow: inset 0 0 0 0.7cqmin rgb(28 25 23 / 0.3);
	}

	.centre:focus-visible {
		outline: 0.6cqmin solid #0f766e;
		outline-offset: 0.3cqmin;
	}
</style>

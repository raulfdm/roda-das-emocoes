import { describe, expect, it } from 'vitest';
import { FAN, WHOLE, flips, slices, type Framing, type Point } from './framing';
import { arcsFor, focusOn } from './geometry';
import { allNodes } from './wheel';

/**
 * The second seam this project tests, and it earns its place the same way the first one does: it
 * guards something nobody can look at.
 *
 * Half-disc framing rests on a single claim — that the Labels the frame crops are *exactly* the
 * Labels the flip would have turned around. If that holds, the flip correction is not solved but
 * deleted. If it is off by a hair at 6 o'clock, an upside-down Label slips into view, and the only
 * way to catch that by eye is to check 82 Tertiaries at all 131 Focuses in three Locales.
 *
 * So the claim is asserted rather than trusted, over every Focus the app can reach.
 */

/** Every view the Wheel can be in: each Focus, at each ring count a screen might ask for. */
const VIEWS = [1, 2, 3].flatMap((rings) =>
	[null, ...allNodes].map((focus) => ({ rings, focus, view: focusOn(focus, rings) }))
);

/**
 * Whether the frame shows this point.
 *
 * Written out here rather than exported from `framing.ts` because it is not our rule to make: this
 * is what a browser does with a `viewBox`, and the test's job is to hold our numbers against it.
 */
function shows(framing: Framing, point: Point): boolean {
	return (
		point.x >= framing.x &&
		point.x <= framing.x + framing.w &&
		point.y >= framing.y &&
		point.y <= framing.y + framing.h
	);
}

/**
 * Read a Label's placement back out of the SVG transform the browser is actually given.
 *
 * This is the part that stops the assertions below being a tautology. `at` and `flipped` are two
 * fields written a line apart in `placeLabel`, so holding one against the other proves very little —
 * both would agree happily while the transform string that does the real work said something else.
 * So the string is parsed and applied as a matrix, and everything downstream is checked against
 * *that*: where the anchor really lands, and which way the text really runs.
 *
 * Only the two forms `placeLabel` emits are understood, and anything else throws rather than
 * silently scoring zero — a transform this cannot read is exactly the drift worth failing on.
 */
function applyTransform(transform: string): { at: Point; reads: Point } {
	const match = transform.match(
		/^rotate\((-?[\d.]+)\) translate\((-?[\d.]+),0\)(?: rotate\(180\))?$/
	);

	if (!match) throw new Error(`unreadable Label transform: ${transform}`);

	const turned = transform.endsWith('rotate(180)');
	const radians = (Number(match[1]) * Math.PI) / 180;
	const radius = Number(match[2]);

	// SVG rotate(θ) about the origin, y down: (x,y) -> (x cosθ - y sinθ, x sinθ + y cosθ).
	const spin = (x: number, y: number): Point => ({
		x: x * Math.cos(radians) - y * Math.sin(radians),
		y: x * Math.sin(radians) + y * Math.cos(radians)
	});

	// The anchor is the local origin carried out along the radius; `reads` is the text's own +x
	// axis — the direction the words run — with the trailing half-turn applied if there is one.
	return {
		at: spin(radius, 0),
		reads: spin(turned ? -1 : 1, 0)
	};
}

/**
 * A Label reads upside down when the direction its words run points back across the page.
 *
 * The tolerance is not slop. A Label at exactly 6 o'clock runs straight down the page and is neither
 * upright nor upside down — and one really does land there: `4.4` sits dead on 6 o'clock whenever its
 * Core is the Focus, emitting `rotate(90.000)`, where `cos` returns 6.1e-17 rather than zero. Calling
 * that upside down would fail the suite over a Label with no handedness to get wrong.
 */
function upsideDown(reads: Point): boolean {
	return reads.x < -1e-6;
}

/**
 * How far a point read back out of a transform may sit from the one we recorded.
 *
 * The transform is written with `toFixed(3)` on the angle and `toFixed(4)` on the radius, so a
 * faithful round-trip still lands a few parts in 100,000 away. Anything looser than this passes real
 * errors; anything tighter fails on the rounding we chose deliberately. A wrong formula misses by
 * whole tenths, so this still catches what it is for.
 */
const ROUNDING = 1e-3;

describe('a Label placement', () => {
	it('describes what its own transform actually does', () => {
		// The load-bearing check. Everything below reasons about `at` and `flipped`; this is what
		// earns the right to, by holding both against the string the browser is handed.
		const wrong: string[] = [];

		for (const framing of [WHOLE, FAN]) {
			for (const { view } of VIEWS) {
				for (const arc of arcsFor(view, framing)) {
					if (!arc.label) continue;

					const drawn = applyTransform(arc.label.transform);
					const turned = arc.label.transform.endsWith('rotate(180)');

					if (Math.abs(drawn.at.x - arc.label.at.x) > ROUNDING) {
						wrong.push(`${arc.node.id}: at.x says ${arc.label.at.x}, transform draws ${drawn.at.x}`);
					}
					if (Math.abs(drawn.at.y - arc.label.at.y) > ROUNDING) {
						wrong.push(`${arc.node.id}: at.y says ${arc.label.at.y}, transform draws ${drawn.at.y}`);
					}
					if (arc.label.flipped !== turned) {
						wrong.push(`${arc.node.id}: flipped is ${arc.label.flipped}, transform says ${turned}`);
					}
				}
			}
		}

		expect(wrong).toEqual([]);
	});
});

describe('the whole disc', () => {
	it('leaves no Label reading upside down, which is what the correction is for', () => {
		// The desktop guarantee, checked against the drawn transform rather than the flag beside it:
		// past 6 o'clock the half-turn must actually bring the words back the right way round.
		const wrong = [];

		for (const { view } of VIEWS) {
			for (const arc of arcsFor(view, WHOLE)) {
				if (!arc.label) continue;
				if (upsideDown(applyTransform(arc.label.transform).reads)) wrong.push(arc.node.id);
			}
		}

		expect(wrong).toEqual([]);
	});
});

describe('fan framing', () => {
	/**
	 * The guarantee, which survived the fan — but as containment rather than as the equality it was.
	 *
	 * While the phone's frame was the right half-disc, "visible" and "reads upright" were the *same
	 * set*, and that exactness was the whole of ADR-0008's case: the frame did not solve the flip, it
	 * deleted it. The fan is a window inside that half (ADR-0010), so one direction still holds
	 * absolutely — nothing upside down can ever be shown, because nothing at negative x can be — while
	 * the converse is now deliberately false. The fan crops plenty of Labels that would have read
	 * perfectly well, and turning the Wheel is what brings them back.
	 *
	 * So this asserts the implication that matters and, below, that the other direction really has
	 * gone rather than being quietly preserved by luck. An implication is a weaker claim than an
	 * equality and it is the honest one to make here; writing it as an equality again would fail, and
	 * writing it as nothing would let a frame that shows the wrong half pass.
	 */
	it('never shows a Label that reads upside down', () => {
		const wrong: string[] = [];

		for (const { rings, focus, view } of VIEWS) {
			for (const arc of arcsFor(view, FAN)) {
				if (!arc.label) continue;

				const drawn = applyTransform(arc.label.transform);
				if (!shows(FAN, drawn.at)) continue;
				if (!upsideDown(drawn.reads)) continue;

				const where = focus ? focus.id : 'the Cores';
				wrong.push(`${arc.node.id} at rings ${rings} from ${where}: visible and upside down`);
			}
		}

		expect(wrong).toEqual([]);
	});

	it('crops Labels that read perfectly well, which is what it trades for the radius', () => {
		// Guards the implication above from being read as the old equality. If this ever came back
		// empty, the frame would have quietly grown back into a half-disc and ADR-0010's radius —
		// and with it the second ring of Labels — would have gone with it.
		const croppedButFine = VIEWS.flatMap(({ view }) =>
			arcsFor(view, FAN).filter((arc) => {
				if (!arc.label) return false;

				const drawn = applyTransform(arc.label.transform);

				return !shows(FAN, drawn.at) && !upsideDown(drawn.reads);
			})
		);

		expect(croppedButFine.length).toBeGreaterThan(0);
	});

	it('never turns a Label around, because it never shows one that needs it', () => {
		const turned = VIEWS.flatMap(({ view }) =>
			arcsFor(view, FAN).filter((arc) => arc.label?.flipped)
		);

		expect(turned).toEqual([]);
	});

	it('leaves off the Labels its edge would cut down their length', () => {
		// The longest Label the outer ring can actually produce. `fontSize` caps a word's width at
		// 0.8 of its ring's thickness, so its half-length is at most 0.4 of it — 0.14 for a rim ring
		// about 0.35 across. That bound is the reason 3 o'clock survives below, so the number has to
		// come from it rather than be picked to make the case.
		const word = { along: 0.14, across: 0.025 };

		// The 6 and 12 o'clock Labels lie along the frame's left edge, and now stand up into its top
		// and bottom edges as well. `slices` is what keeps them off screen; without it they render
		// upright, half-inked and unreadable.
		expect(slices(FAN, { x: 0, y: 0.85 }, word)).toBe(true);
		expect(slices(FAN, { x: 0, y: -0.85 }, word)).toBe(true);

		// 3 o'clock is the reading zone and must survive. It does because `fontSize` already caps a
		// word's length against its ring's thickness, so the ink cannot reach past the rim.
		expect(slices(FAN, { x: 0.85, y: 0 }, word)).toBe(false);

		// The vertical crop is real and is the fan's own: a Label high on the Wheel that the old
		// half-disc showed happily is outside this frame.
		expect(slices(FAN, { x: 0.45, y: -0.72 }, word)).toBe(true);

		// The whole disc has no edge to cut against, out at the rim where its Labels sit.
		expect(slices(WHOLE, { x: -0.85, y: 0 }, word)).toBe(false);
	});
});

describe('the whole disc', () => {
	it('does turn Labels around, so the correction is still load-bearing where it is kept', () => {
		// Guards the complement test above from passing vacuously: if `flipped` were hard-wired false
		// the first test would still be green, and the desktop poster would quietly read upside down.
		const turned = VIEWS.flatMap(({ view }) =>
			arcsFor(view, WHOLE).filter((arc) => arc.label?.flipped)
		);

		expect(turned.length).toBeGreaterThan(0);
	});
});

describe('a framing', () => {
	it('needs the flip exactly when it can show the unreadable half', () => {
		expect(flips(WHOLE)).toBe(true);
		expect(flips(FAN)).toBe(false);
	});
});

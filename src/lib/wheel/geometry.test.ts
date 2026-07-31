import { describe, expect, it } from 'vitest';
import { FAN, WHOLE, slices } from './framing';
import { arcsFor, focusOn } from './geometry';
import { cores, type WheelNode } from './wheel';

/**
 * The third seam, and like the other two it guards something you cannot see going wrong.
 *
 * `focusOn` resolves a Node to its angular extent through a module-level map. That map used to be
 * keyed by the Node object, which meant a caller holding anything that was a Node in every respect
 * *except identity* got `undefined` and a thrown `TypeError`. A `$state` rune deep-proxies what it
 * stores, so a Focus held in plain `$state` was exactly that: a proxy of a Node, structurally
 * perfect and identity-wrong.
 *
 * The throw did not show up as a broken Wheel. `focusOn` feeds the tweened view through a
 * `$derived`, so it killed the effect that advances the tween while every other reader of the Focus
 * carried on — the Path readout updated, the centre button updated, and the graphic silently kept
 * drawing the previous view. It looked like a click that did nothing, on a page with no errors
 * visible anywhere except the console.
 *
 * A proxy cannot be built here without the Svelte runtime, so the stand-in is a structural clone:
 * same Node, different object. If `focusOn` treats it the same, identity is not being relied on.
 */
describe('focusOn resolves a Node by identity-independent means', () => {
	const core = cores[0];

	it('gives a Core a narrower window than the whole Wheel', () => {
		const whole = focusOn(null, 1);
		const focused = focusOn(core, 1);

		expect(focused.depth).toBe(0);
		expect(focused.x1 - focused.x0).toBeLessThan(whole.x1 - whole.x0);
	});

	it('treats a structural copy of a Node exactly as it treats the Node', () => {
		// Spread rather than a proxy: enough to change identity while keeping every field, which is
		// the whole of what a `$state` proxy did to break this.
		const copy = { ...core } as WheelNode;

		expect(copy).not.toBe(core);
		expect(focusOn(copy, 1)).toEqual(focusOn(core, 1));
	});

	it('falls back to the whole Wheel rather than throwing on a Node it cannot place', () => {
		const stranger = { ...core, id: 'not-a-node' } as WheelNode;

		expect(() => focusOn(stranger, 1)).not.toThrow();
		expect(focusOn(stranger, 1)).toEqual(focusOn(null, 1));
	});
});

/**
 * The fourth seam, and it exists because turning the Wheel breaks Labels in a way you cannot see
 * from the code that breaks them.
 *
 * `placeLabel` decides once, at layout time, whether a Label has to be turned around so it does not
 * read upside down. Ticket 03 predicted the failure exactly: compute that against the *unrotated*
 * mid-angle and every Label arrives on the far side of the Wheel still carrying the wrong decision.
 * An unrotated Wheel agrees with a rotated one, so the mistake is invisible at rest and invisible in
 * review — it only shows once someone drags, and only for the Labels that have crossed vertical.
 *
 * Both claims below are about the *drawn output* rather than about the intermediate angle, because
 * an implementation that got the angle right and then applied it to the wrong transform would pass a
 * test written against the angle.
 */
describe('a turned Wheel never reads upside down', () => {
	const view = focusOn(null, 2);

	// Deliberately past a full turn in both directions: rotation is unbounded — a reader can keep
	// dragging the same way — so the fold has to hold outside `[0, TAU)` as well as inside it.
	const TURNS = [-7.3, -3.1, -0.4, 0, 0.4, 1.6, 3.1, 4.7, 6.28, 9.9];

	/**
	 * Whether a Label reads the right way up on screen.
	 *
	 * A Label runs radially outward, so it is upright exactly when it sits on the right of the
	 * vertical — `at.x > 0` — and the 180° correction inverts that. So the two have to disagree:
	 * a Label on the left is upright only because it was flipped, and one on the right only because
	 * it was not.
	 */
	function upright(at: { x: number }, flipped: boolean): boolean {
		return at.x > 0 !== flipped;
	}

	it('corrects every Label on the whole disc, at any turn', () => {
		for (const rotation of TURNS) {
			const labelled = arcsFor(view, WHOLE, rotation).filter((a) => a.label);
			expect(labelled.length).toBeGreaterThan(0);

			for (const { node, label } of labelled) {
				expect(
					upright(label!.at, label!.flipped),
					`${node.id} reads upside down at rotation ${rotation}`
				).toBe(true);
			}
		}
	});

	it('needs no correction under the cropped framing, at any turn', () => {
		// The phone frame's surviving claim (ADR-0008, narrowed by ADR-0010) is that it can only ever
		// show the half that reads the right way up. Rotation is the obvious way to break that — turn
		// the Wheel and the frame is full of different Labels — so it is checked against every Label
		// the frame actually leaves on screen rather than assumed to survive.
		for (const rotation of TURNS) {
			for (const { node, label, arcLength, thickness } of arcsFor(view, FAN, rotation)) {
				if (!label) continue;

				// The size and reach the component would draw it at, which is what decides whether the
				// frame cuts it. A Label the crop removes is not on screen and has nothing to prove.
				const size = Math.min(arcLength * 0.6, (thickness * 0.8) / 4.5);
				const ink = { along: (size * 10 * 0.62) / 2, across: size / 2 };
				if (slices(FAN, label.at, ink)) continue;

				expect(label.flipped, `${node.id} was flipped under a frame that crops`).toBe(false);
				expect(upright(label.at, label.flipped), `${node.id} at rotation ${rotation}`).toBe(true);
			}
		}
	});
});

/**
 * The property that makes turning cheap, asserted so it cannot be optimised away by accident.
 *
 * A rotation is rigid: it moves every wedge without changing any wedge's shape. That is why the
 * caller can apply it as one transform on one group and write a single attribute per frame instead
 * of re-deriving 75 path strings. Fold rotation into the arc angles instead — the obvious reading of
 * "rotation belongs in the geometry" — and everything still *looks* right while every frame of a
 * drag rebuilds and re-tessellates the entire Wheel.
 *
 * Nothing else would catch that. It is a performance cliff wearing a correct picture.
 */
it('draws the same wedges however far the Wheel has been turned', () => {
	const view = focusOn(cores[0], 2);
	const still = arcsFor(view, WHOLE, 0);

	for (const rotation of [0.4, 2.2, -5.5]) {
		const turned = arcsFor(view, WHOLE, rotation);

		expect(turned.map((a) => a.node.id)).toEqual(still.map((a) => a.node.id));
		expect(turned.map((a) => a.d)).toEqual(still.map((a) => a.d));
	}
});

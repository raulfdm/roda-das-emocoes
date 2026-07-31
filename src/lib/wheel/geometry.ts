import { arc } from 'd3-shape';
import { flips, type Framing, type Point } from './framing';
import { allNodes, cores, totalLeaves, type WheelNode } from './wheel';

/**
 * Where every Node sits on screen, given the tree and the current Focus.
 *
 * This is a pure transformation — it holds no state of its own. `d3-shape` appears here as a maths
 * library and nothing more: its arc generator writes the annular path strings, whose large-arc and
 * sweep flags and inner-edge winding are fiddly to hand-roll. The layout itself is ours, because
 * moving the Focus re-roots the tree and a partition layout would have to be unpicked to do it.
 */

const TAU = Math.PI * 2;

/**
 * Radius of the centre, which holds the Path readout and acts as the way back up.
 *
 * Exported because the readout is an HTML overlay rather than part of the SVG, so the component has
 * to place it against this number. It used to carry a copy of `0.3` in a comment promising the two
 * matched; under half-disc framing the overlay is positioned off the frame arithmetically and a
 * stale copy would put it in the wrong place rather than merely the wrong size.
 */
export const HOLE = 0.3;

/** Thickness of the thin band an ancestor of the Focus compresses into. */
const ANCESTOR_BAND = 0.055;

/**
 * Below this arc length a Label has nowhere to go, so it is left off. Set to clear the 82 Tertiaries
 * of the fully expanded desktop Wheel, which is the tightest the Labels ever get.
 */
const MIN_LABEL_ARC = 0.04;

/** Below this band thickness a Label cannot sit across the radius. */
const MIN_LABEL_THICKNESS = 0.09;

/** An arc too slim to see is not worth a DOM node. */
const MIN_VISIBLE_ARC = 0.0015;

/** An angle folded into `[0, TAU)`, so a rotation that has wound backwards still compares. */
function turn(angle: number): number {
	return ((angle % TAU) + TAU) % TAU;
}

/** A Node's share of the unfocused Wheel, in radians clockwise from 12 o'clock. */
interface Extent {
	readonly x0: number;
	readonly x1: number;
}

/**
 * Keyed by `node.id`, not by the Node itself.
 *
 * Identity keying looks natural here and is a trap, because a caller can hold something that is a
 * Node in every respect except identity. A `$state` rune deep-proxies what it stores, so a Focus
 * kept in plain `$state` arrives here as a *proxy* of a Node and misses the map entirely; `focusOn`
 * then throws on `extent.x0`. The page keeps its Focus in `$state.raw` for exactly this reason, and
 * this keying is the second line of defence rather than a substitute for it.
 *
 * That failure is worse than it sounds, because it does not surface as a broken Wheel. `focusOn`
 * feeds the tweened view through a `$derived`, so the throw takes out the effect that advances the
 * tween while every other reader of the Focus carries on: the Path readout updates, the centre
 * button updates, and the graphic silently keeps drawing the view it had. It reads as a click that
 * did nothing.
 *
 * `node.id` is positional and deterministic — `6.1.1` is `6.1.1` in every build of the same
 * taxonomy — so nothing that is really a Node can miss.
 */
const extents = new Map<string, Extent>();

// Each Node's width is its share of the Wheel's 82 Tertiaries, which is why the branches differ in
// width exactly as the poster does — Feliz spans 9 Secondaries where Enojado spans 4.
(function layout(nodes: readonly WheelNode[], start: number) {
	let x = start;

	for (const node of nodes) {
		const width = (node.leafCount / totalLeaves) * TAU;
		extents.set(node.id, { x0: x, x1: x + width });
		layout(node.children, x);
		x += width;
	}
})(cores, 0);

/**
 * What the Wheel is currently showing.
 *
 * `depth` and `rings` are read as continuous rather than whole numbers so a Focus change can be
 * tweened through them: every radius below is continuous in `depth`, so no ring jumps as the
 * animation crosses a level.
 */
export interface View {
	/** Angular window of the Wheel filling the full circle. */
	readonly x0: number;
	readonly x1: number;
	/** Depth of the Focus: -1 for the whole Wheel, 0 for a Core, 1 for a Secondary. */
	readonly depth: number;
	/** How many rings are drawn outward from the Focus. Mobile shows one; desktop shows two. */
	readonly rings: number;
}

/** The view showing all 7 Cores, with `rings` deciding how much of the rest comes with them. */
function wholeWheel(rings: number): View {
	return { x0: 0, x1: TAU, depth: -1, rings: ringsBelow(-1, rings) };
}

/** The view with `node` expanded to fill the circle. */
export function focusOn(node: WheelNode | null, rings: number): View {
	const extent = node && extents.get(node.id);

	// A Focus we have no extent for is not a view we can compute, and throwing here would take the
	// tween's effect down with it rather than showing anything. The whole Wheel is always drawable.
	if (!extent || !node) return wholeWheel(rings);

	return { x0: extent.x0, x1: extent.x1, depth: node.depth, rings: ringsBelow(node.depth, rings) };
}

/** Rings actually available below a Focus at this depth — never more than the tree has left. */
function ringsBelow(depth: number, rings: number): number {
	return Math.max(1, Math.min(rings, 2 - depth));
}

/** Radius of the boundary `b` levels down the tree, where 0 is just outside the centre. */
function radiusAt(b: number, view: View): number {
	const start = HOLE + (view.depth + 1) * ANCESTOR_BAND;
	if (b <= view.depth + 1) return HOLE + b * ANCESTOR_BAND;

	return start + ((b - view.depth - 1) * (1 - start)) / view.rings;
}

/** Where a Label sits inside its wedge, and which way round it reads. */
export interface LabelPlacement {
	/** SVG transform putting the Label in its wedge. */
	readonly transform: string;
	/**
	 * The Label's centre in the Wheel's plane — the point a Framing either shows or crops.
	 *
	 * Carried as a number rather than left implicit in the transform string because it is half of
	 * ticket 11's claim: the Labels a frame crops are the Labels it would have had to turn around.
	 * That is only checkable if both halves are legible to something other than a browser.
	 */
	readonly at: Point;
	/** True when the Label has been turned around so it does not read upside down. */
	readonly flipped: boolean;
}

/** One Node as drawn: an annular wedge, and where its Label sits within it. */
export interface WheelArc {
	readonly node: WheelNode;
	/** SVG path data for the wedge. */
	readonly d: string;
	/** Placement for the Label, or null when the wedge is too small to carry one. */
	readonly label: LabelPlacement | null;
	/** Length of the wedge's mid-line arc — how tall a Label can be. */
	readonly arcLength: number;
	/** Distance across the ring — how long a Label can be, since Labels run radially. */
	readonly thickness: number;
	/** True at or inside the Focus — the compressed inner rings, not the spread children. */
	readonly compressed: boolean;
}

/**
 * Whether tapping this Node goes deeper. It does, whenever there is anything below it.
 *
 * This used to be conditional on the view — a Node whose children were already drawn did not
 * descend, it settled, so that clicking the fully expanded desktop poster highlighted a Path instead
 * of re-rooting the whole thing. That rule existed to keep descending and arriving apart, and
 * arriving is gone: there is no Selection to settle into (ADR-0006). What it cost while it stood was
 * a desktop where clicking a Core did nothing visible at all, because a Core's children are on
 * screen from the start and the click had nowhere to go but a highlight.
 *
 * So it is ticket 03's original wording after all — tapping a Node with children makes it the Focus
 * — and a Tertiary, having nothing beneath it, is not interactive. It is the answer; you read it.
 */
export function descendsInto(node: WheelNode): boolean {
	return node.children.length > 0;
}

/** d3's default arc accessors read exactly these four fields, so no configuration is needed. */
interface ArcShape {
	innerRadius: number;
	outerRadius: number;
	startAngle: number;
	endAngle: number;
}

const drawArc = arc<ArcShape>();

function clamp(value: number, low: number, high: number): number {
	return value < low ? low : value > high ? high : value;
}

/**
 * Every Node currently worth drawing, innermost first so outer rings paint over inner ones.
 *
 * The Framing reaches in only as far as the Labels: the wedges are the same arcs whatever box they
 * are shown through, but whether a Label needs turning around depends on how much of the Wheel that
 * box can reach. `rotation` enters on exactly the same footing, and for the same reason.
 *
 * ## Why rotation is a parameter here rather than a field on `View`
 *
 * Ticket 03 framed this as a fork — rotation as a tweened `View` field, which is honest but
 * re-derives every arc on every frame, or as a transform above the geometry, which is cheap but
 * leaves the Label flip computed against the *unrotated* angle and therefore upside down as soon as
 * you turn the Wheel half a turn.
 *
 * It is a false fork, and the seam `framing` already cut is what shows it. A rotation is rigid: it
 * moves every wedge without changing any wedge's shape, so no path data depends on it and `d` is
 * emitted rotation-free. What *does* depend on it is which half of the plane a Label has landed in —
 * which is the flip — and where it sits relative to the frame's edges. So the caller applies the
 * rotation as one transform on one group, and the two derived facts are computed here against the
 * rotated angle. Turning the Wheel writes a single attribute, and no Label is ever upside down.
 *
 * Rotation is not tweened and so is not part of `View`. It has nothing to animate towards: a drag is
 * 1:1 with the pointer, and a Focus change carries the reader's chosen orientation through unaltered
 * rather than settling somewhere new (ADR-0009).
 */
export function arcsFor(
	view: View,
	framing: Framing,
	rotation = 0,
	reachOf: Reach = () => 0
): WheelArc[] {
	const span = view.x1 - view.x0;
	const flip = flips(framing);
	const arcs: WheelArc[] = [];

	for (const node of allNodes) {
		const extent = extents.get(node.id)!;
		const startAngle = clamp(((extent.x0 - view.x0) / span) * TAU, 0, TAU);
		const endAngle = clamp(((extent.x1 - view.x0) / span) * TAU, 0, TAU);
		if (endAngle - startAngle < MIN_VISIBLE_ARC) continue;

		// Radii are clamped to the rim rather than culled by depth, so a ring that is about to come
		// into view slides in from the edge instead of appearing all at once.
		const innerRadius = clamp(radiusAt(node.depth, view), 0, 1);
		const outerRadius = clamp(radiusAt(node.depth + 1, view), 0, 1);
		if (outerRadius - innerRadius < 0.001) continue;

		const d = drawArc({ innerRadius, outerRadius, startAngle, endAngle });
		if (!d) continue;

		// Measured at the band's midpoint rather than at wherever the Label ends up, so that the type
		// size does not depend on a radius that is itself chosen from the type size. It under-states
		// the arc a Label placed further out actually has, which only ever makes the word smaller.
		const arcLength = ((endAngle - startAngle) * (innerRadius + outerRadius)) / 2;
		const thickness = outerRadius - innerRadius;

		arcs.push({
			node,
			d,
			label: placeLabel(
				startAngle,
				endAngle,
				innerRadius,
				outerRadius,
				flip,
				rotation,
				reachOf(node, arcLength, thickness)
			),
			arcLength,
			thickness,
			compressed: node.depth <= view.depth
		});
	}

	return arcs;
}

/**
 * How far a Node's Label reaches along the radius, as a fraction of the Wheel, measured from the
 * word's middle.
 *
 * Supplied by the caller rather than worked out here, because it depends on the Locale and on the
 * type size — neither of which this module knows, and neither of which it should learn. The two
 * numbers it needs to answer are handed back to it: a word is sized against the arc it has to fit
 * across and the band it has to fit along.
 */
export type Reach = (node: WheelNode, arcLength: number, thickness: number) => number;

/**
 * The radius that leaves the same amount of wedge on either side of the word.
 *
 * A wedge is not a rectangle. It widens as it goes out, so the half beyond the midpoint of its
 * thickness holds far more colour than the half behind it: on the single-ring Cores view, a band
 * running 0.3 to 1.0 puts its Labels at 0.65 with roughly *twice* as much wedge outside the word as
 * inside it. The word is exactly centred on its anchor and the anchor is in the wrong place, which
 * reads as type drifting toward the hub.
 *
 * Equal areas either side of a word of half-length `w` solves to `sqrt((r0² + r1²) / 2 - w²)`, and
 * the `w` term is not a refinement — it is most of the answer for the longest Labels. Aiming at the
 * wedge's centre of mass instead, which needs no `w`, was tried and is right only for short words:
 * it puts `Mal` and `Medo` almost perfectly and drives `Surpresa` out to within 6px of the rim, with
 * five times as much colour behind the word as in front of it. Exactly the fault being fixed, in the
 * other direction.
 *
 * The formula tapers on its own, which is why it is worth having rather than approximating. A short
 * word sits well out — `Mal` at 0.730 — and a word that nearly fills the band falls back toward the
 * middle of it, because there is nowhere else for it to go.
 */
function balanceRadius(inner: number, outer: number, reach: number): number {
	const middle = (inner + outer) / 2;

	// A word too long for its band cannot be balanced, only centred. `fontSize` should have prevented
	// this, and if it has not, the midpoint is the least wrong answer rather than a crash.
	const low = inner + reach;
	const high = outer - reach;
	if (low >= high) return middle;

	const balanced = Math.sqrt(Math.max(0, (inner * inner + outer * outer) / 2 - reach * reach));

	return clamp(balanced, low, high);
}

/**
 * Where a Label sits inside its wedge: rotated out to its radius, and turned around past 6 o'clock
 * so it never reads upside down — unless the frame crops that half anyway, in which case there is
 * nothing to correct and the correction is not made.
 *
 * `transform` is expressed in the Wheel's *unrotated* frame, because the caller nests it inside the
 * group carrying the rotation and the two compose. Everything that has to answer a question about
 * the screen — which half the Label landed in, and where the frame's edges fall relative to it — is
 * computed against `middle + rotation` instead. That split is the whole of what makes a rigid
 * transform safe here.
 */
function placeLabel(
	startAngle: number,
	endAngle: number,
	innerRadius: number,
	outerRadius: number,
	flip: boolean,
	rotation: number,
	reach: number
): LabelPlacement | null {
	const radius = balanceRadius(innerRadius, outerRadius, reach);
	if ((endAngle - startAngle) * radius < MIN_LABEL_ARC) return null;
	if (outerRadius - innerRadius < MIN_LABEL_THICKNESS) return null;

	const middle = (startAngle + endAngle) / 2;
	const degrees = (middle * 180) / Math.PI - 90;

	// Where the Label has actually come to rest once the group's rotation is applied. A Label reads
	// upside down exactly when it has landed past 6 o'clock, and that is a fact about the turned
	// Wheel — asking it of `middle` is the break ticket 03 predicted, and it is a silent one, because
	// an unrotated Wheel agrees with a rotated one right up until you turn it.
	const shown = turn(middle + rotation);
	const flipped = flip && shown > Math.PI;

	return {
		transform:
			`rotate(${degrees.toFixed(3)}) translate(${radius.toFixed(4)},0)` +
			(flipped ? ' rotate(180)' : ''),
		// The same rotate-then-translate the transform describes, worked out as a point — but against
		// the shown angle, since this is what the Framing crops against. The rotation carries the
		// Label's anchor to `shown` measured clockwise from 12 o'clock, which in SVG's y-down
		// coordinates puts it here.
		at: { x: radius * Math.sin(shown), y: -radius * Math.cos(shown) },
		flipped
	};
}

/** Halfway between two views, for tweening a Focus change. */
export function interpolateView(from: View, to: View, t: number): View {
	return {
		x0: from.x0 + (to.x0 - from.x0) * t,
		x1: from.x1 + (to.x1 - from.x1) * t,
		depth: from.depth + (to.depth - from.depth) * t,
		rings: from.rings + (to.rings - from.rings) * t
	};
}


/**
 * Where the Wheel sits in its box.
 *
 * The Wheel is drawn once, always as a disc of radius 1 about the origin. What changes between a
 * phone and a desktop is not the drawing but the rectangle of the plane we choose to show, and that
 * rectangle is all a Framing is.
 *
 * **There is one Framing in use: the whole disc, on every screen** (ADR-0011). A phone had the right
 * half-disc and then a fan of it, and both bought a larger radius by showing less of the Wheel. The
 * radius was real — 226px and 323px against the whole disc's 199px — and it was not worth what it
 * cost, because a straight edge through the Wheel reads as a drawing that failed rather than as a
 * window onto something larger. `FAN` is kept as the worked example and as the evidence.
 *
 * So most of what this file computes is currently answered the same way every time, and it is kept
 * general rather than folded flat. `flips` is the reason: the Label flip is derived from the frame,
 * not configured beside it, and that derivation is what makes it impossible to express a frame that
 * shows the unreadable half and forgets to correct it. Collapsing the frame to a constant would take
 * the guarantee with it.
 *
 * The rule the whole file exists to state: under radial-outward Labels the right half is *exactly*
 * the half that reads the right way up, so a frame that cannot show negative x can never show a Label
 * needing correction. The whole disc can show it, and therefore corrects it.
 */

/** A point in the Wheel's plane, where the disc has radius 1 about the origin. */
export interface Point {
	readonly x: number;
	readonly y: number;
}

/** A rectangle of the Wheel's plane, in the Wheel's own units. */
export interface Framing {
	readonly x: number;
	readonly y: number;
	readonly w: number;
	readonly h: number;
}

/** The whole disc, centred. What the Wheel showed everywhere before ticket 11. */
export const WHOLE: Framing = { x: -1, y: -1, w: 2, h: 2 };

/**
 * A cropping frame: the Wheel's centre on the box's left edge, cut top and bottom as well.
 *
 * **Nothing selects this any more** (ADR-0011). It is kept as the worked example of a Framing that
 * crops — the mechanism that `flips`, `cropsCentre` and `slices` exist to serve — and because the
 * measurements in its comment are the evidence for not using it. A phone shows the whole disc.
 *
 * **This was a half-disc and became a fan** (ADR-0010, superseded). The half-disc was `h: 2` — the full height of
 * the disc — which forced a box twice as tall as it was wide, and a box that shape has to be fitted
 * to the screen's height. On a 430pt phone that left the Wheel 226px of the 398px column, with the
 * remaining 43% of the width empty, and a radius small enough that only one ring of Labels could ever
 * be legible.
 *
 * Shortening the frame is what buys the radius back: at `h: 1.4` the box fits the *width* instead,
 * the radius goes 226px → 323px, and two rings become readable — Cores and Secondaries together,
 * then Secondaries and Tertiaries. What it costs is angular reach. The rim is on screen across about
 * 89° rather than 180°, so about a quarter of the Wheel is in front of you at any moment.
 *
 * `1.4` was measured against 2.0, 1.8, 1.6 and 1.2 in a real browser at a real phone size, and it is
 * a chosen point on a straight trade rather than a knee in a curve — every step down buys type and
 * costs Labels, monotonically:
 *
 * | h   | radius | window | Labels drawn | median |
 * | --- | ------ | ------ | ------------ | ------ |
 * | 2.0 | 226px  | 180°   | 23           | 11.3px |
 * | 1.6 | 282px  | 106°   | 17           | 15.9px |
 * | 1.4 | 323px  |  89°   | 14           | 16.2px |
 * | 1.2 | 377px  |  74°   | 12           | 18.9px |
 *
 * 1.2 shipped first and was wrong in the hand: 12 Labels over 48 wedges left broad areas of colour
 * with no word in them, which reads as text failing to render rather than as a Wheel continuing off
 * the page. 1.4 gives two of those Labels back and widens the window by 15° for 2.7px of type, and
 * the remaining bare wedges are handled by fading the colour out rather than by shrinking further.
 *
 * That trade is only payable because the Wheel turns (ADR-0009). Under a static frame an 89° window
 * would be a cage; under a turning one it is where you happen to be looking.
 */
export const FAN: Framing = { x: 0, y: -0.7, w: 1, h: 1.4 };

/** The framing as an SVG `viewBox`. */
export function viewBox(framing: Framing): string {
	return `${framing.x} ${framing.y} ${framing.w} ${framing.h}`;
}

/**
 * Whether Labels past 6 o'clock have to be turned around so they never read upside down.
 *
 * Derived from the box rather than stored beside it, and that is the point rather than a
 * convenience. A Label reads upside down exactly when it sits at negative x, so a frame needs the
 * correction exactly when it can show negative x. Writing the two as one expression is what stops
 * them drifting apart: there is no way to configure a frame that crops the unreadable half and then
 * corrects it anyway, or one that shows it and forgets to.
 */
export function flips(framing: Framing): boolean {
	return framing.x < 0;
}

/**
 * Whether the frame cuts the centre hole in half.
 *
 * True when the box's left edge sits at or past the Wheel's centre, so at most half the hole is on
 * screen. The centre carries the Path readout and is the way back up; a half-circle has no room for
 * words, so the Path is read elsewhere on the page and the half-circle is left doing the one job it
 * can still do.
 *
 * Note this is the exact negation of `flips` for both framings we have, and that is a coincidence of
 * having only two: one asks about the Labels, the other about the overlay, and a frame offset to,
 * say, `x = -0.15` would crop the hole while still needing the flip. Kept separate because they are
 * separate questions, not because they currently disagree.
 */
export function cropsCentre(framing: Framing): boolean {
	return framing.x >= 0;
}

/**
 * How far a Label's ink reaches from its anchor, in the Wheel's own units.
 *
 * Two numbers rather than one because a Label is not square and is not axis-aligned: it runs *along*
 * the radius for the length of the word and stands only one line high *across* it. Which of those
 * two faces a given edge of the frame depends entirely on where round the Wheel the Label sits, so
 * neither can stand in for the other.
 */
export interface Ink {
	/** Half the word's length, measured along the radius. */
	readonly along: number;
	/** Half the line's height, measured across it. */
	readonly across: number;
}

/**
 * The fraction of a Label's reach that must clear the frame's edge before it is dropped.
 *
 * A word is not quite all-or-nothing. Losing the last letter of `Sobrecarregado` leaves something a
 * reader still recognises, so testing the *full* reach — which is what shipped first — throws a Label
 * away over a single clipped glyph.
 *
 * `0.8` is a small allowance on purpose, and it was tried wider. At `0.5` a Label survives with a
 * quarter of it missing, and on screen those arrive as words visibly running off the edge — which
 * looks like the same fault as no word at all, in the other direction. The Wheel turns, so anything
 * the frame is really eating is one drag away from being whole.
 */
const KEPT = 0.8;

/**
 * Whether the frame would cut a Label at `at` down its length.
 *
 * `flips` is exact about which *way* a Label faces and says nothing about the width of the ink.
 * Labels run radially, so the Label nearest 6 o'clock lies along the frame's edge — and so does the
 * one nearest 12 — and the crop takes half of every glyph, leaving a Label that is visible, upright
 * and unreadable. Both belong to wedges the frame has already halved, so there was never a whole
 * thing to read; descending into the wedge is how you get the word.
 *
 * **Both axes are tested, and the second one is not decoration.** While the phone's frame was a
 * half-disc it stood a full radius above and below the centre, so nothing could leave it vertically
 * and the y test would never have fired. The fan crops top and bottom too (ADR-0010), and the Labels
 * nearest 12 and 6 o'clock are the ones standing straight up into those edges — the same two Labels
 * the x test was written for, now able to escape the other way.
 *
 * Answers about the box's edges alone, so ask it only of a frame that actually clips: the whole disc
 * paints outside its box quite happily, and suppressing its rim Labels would be a bug.
 */
export function slices(framing: Framing, at: Point, ink: Ink): boolean {
	const radius = Math.hypot(at.x, at.y);
	if (radius === 0) return false;

	// The Label's own axes, read back off where its anchor landed: it runs outward along the radius,
	// and stands square across it. `at` is `(r sin θ, -r cos θ)`, so this is that read backwards.
	const sin = at.x / radius;
	const cos = -at.y / radius;

	// The upright box that contains the tilted one. A word lying flat at 3 o'clock spends its length
	// on the horizontal edges and its height on the vertical; one standing up at 12 o'clock does the
	// opposite, and every Label between them splits the difference exactly like this.
	const reachX = (ink.along * Math.abs(sin) + ink.across * Math.abs(cos)) * KEPT;
	const reachY = (ink.along * Math.abs(cos) + ink.across * Math.abs(sin)) * KEPT;

	return (
		at.x - reachX < framing.x ||
		at.x + reachX > framing.x + framing.w ||
		at.y - reachY < framing.y ||
		at.y + reachY > framing.y + framing.h
	);
}

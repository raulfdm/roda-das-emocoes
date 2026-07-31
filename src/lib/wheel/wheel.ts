import { CORE_TINTS, LABEL_ORDER, WHEEL, type Transcribed } from './labels';

/** One of the three languages the Wheel is published in. Portuguese is canonical (ADR-0003). */
export type Locale = 'pt' | 'en' | 'es';

export const LOCALES = ['pt', 'en', 'es'] as const satisfies readonly Locale[];

export const DEFAULT_LOCALE: Locale = 'pt';

export const LOCALE_NAMES: Record<Locale, string> = {
	pt: 'Português',
	en: 'English',
	es: 'Español'
};

/** 0 for a Core, 1 for a Secondary, 2 for a Tertiary. */
export type Depth = 0 | 1 | 2;

/** The separator between Labels in a Path on screen. The only one there is — see ADR-0005. */
export const PATH_DISPLAY_SEPARATOR = ' › ';

/** The colour a Node is drawn in: its Core's hue, lightened by how far out it sits. */
export interface Tint {
	readonly hue: number;
	readonly saturation: number;
	readonly lightness: number;
}

/**
 * A single feeling within the Wheel.
 *
 * A Node's identity is its position in the tree — never its Label. Labels repeat within a Locale by
 * design (ADR-0004) and change between Locales, so nothing may key off them.
 */
export interface WheelNode {
	/** Positional identity, e.g. `6.1.1`. Stable across Label corrections and Locale changes. */
	readonly id: string;
	readonly depth: Depth;
	readonly labels: Readonly<Record<Locale, string>>;
	readonly parent: WheelNode | null;
	readonly children: readonly WheelNode[];
	/** Core first, this Node last. A Core's ancestry is just itself. */
	readonly ancestors: readonly WheelNode[];
	/** The Core this Node descends from; a Core is its own. */
	readonly core: WheelNode;
	/** Tertiaries beneath this Node, 1 for a Tertiary. Drives how wide its arc is drawn. */
	readonly leafCount: number;
	readonly tint: Tint;
}

/** Lightness per depth, so Secondaries and Tertiaries read as tints of their Core's hue. */
const LIGHTNESS: Record<Depth, number> = { 0: 66, 1: 79, 2: 89 };

/**
 * A Node's colour as custom properties, so the Wheel's palette reaches the stylesheet as data
 * computed from the tree rather than as design tokens duplicated alongside it.
 */
export function tintStyle({ hue, saturation, lightness }: Tint): string {
	return `--h: ${hue}; --s: ${saturation}%; --l: ${lightness}%`;
}

function build(
	source: Transcribed,
	index: number,
	parent: WheelNode | null,
	hue: Pick<Tint, 'hue' | 'saturation'>
): WheelNode {
	const depth = (parent ? parent.depth + 1 : 0) as Depth;
	const labels = Object.fromEntries(
		LABEL_ORDER.map((locale, slot) => [locale, source[slot] as string])
	) as Record<Locale, string>;

	// A Node's ancestry and Core close over the Node itself, and its children need both before they
	// can be built, so it is assembled in two passes: identity first, then descendants.
	const node = {
		id: parent ? `${parent.id}.${index}` : `${index}`,
		depth,
		labels,
		parent,
		tint: { ...hue, lightness: LIGHTNESS[depth] }
	} as WheelNode;

	Object.assign(node, {
		ancestors: parent ? [...parent.ancestors, node] : [node],
		core: parent ? parent.core : node
	});

	const children = (source[3] ?? []).map((child, i) => build(child, i, node, hue));

	return Object.assign(node, {
		children,
		leafCount: children.length ? children.reduce((n, c) => n + c.leafCount, 0) : 1
	});
}

/** The 7 Nodes at the centre of the Wheel, in the order the poster reads them. */
export const cores: readonly WheelNode[] = WHEEL.map((source, i) =>
	build(source, i, null, CORE_TINTS[i])
);

function flatten(nodes: readonly WheelNode[]): WheelNode[] {
	return nodes.flatMap((node) => [node, ...flatten(node.children)]);
}

/** All 130 Nodes, depth-first in poster order. */
export const allNodes: readonly WheelNode[] = flatten(cores);

/** Tertiaries beneath the whole Wheel — the unit every arc's width is measured in. */
export const totalLeaves = cores.reduce((n, core) => n + core.leafCount, 0);

export function nodesAtDepth(depth: Depth): readonly WheelNode[] {
	return allNodes.filter((node) => node.depth === depth);
}

export function labelOf(node: WheelNode, locale: Locale): string {
	return node.labels[locale];
}

/** The chain of Labels from this Node's Core down to the Node itself. */
export function pathLabels(node: WheelNode, locale: Locale): string[] {
	return node.ancestors.map((ancestor) => ancestor.labels[locale]);
}

/** The Path as one readable string, e.g. `Mal › Estresse › Sobrecarregado`. */
export function formatPath(node: WheelNode, locale: Locale): string {
	return pathLabels(node, locale).join(PATH_DISPLAY_SEPARATOR);
}

/**
 * The Node a Path names, or null if no Node has it.
 *
 * A bare Label cannot identify a Node — `Desapontado` sits on three of them — so lookup walks the
 * whole chain from the Core down. Matching is accent- and case-insensitive so a hand-typed or
 * re-encoded link still resolves.
 */
export function nodeByPath(labels: readonly string[], locale: Locale): WheelNode | null {
	if (labels.length === 0 || labels.length > 3) return null;

	let candidates: readonly WheelNode[] = cores;
	let found: WheelNode | null = null;

	for (const label of labels) {
		const wanted = fold(label);
		const match = candidates.find((node) => fold(node.labels[locale]) === wanted);
		if (!match) return null;

		found = match;
		candidates = match.children;
	}

	return found;
}

/**
 * Case- and accent-insensitive form of a Label, so `estresse` finds `Estresse` and someone typing
 * without diacritics is not fighting their keyboard.
 */
export function fold(text: string): string {
	return text
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLocaleLowerCase();
}

/**
 * How much of a word two spellings must share before a near miss counts as a match.
 *
 * Someone reaching for `Sobrecarregado` types `sobrecarga` — a real Portuguese word, and not a
 * substring of the Label. A shared stem connects the two without letting search start guessing:
 * six characters is long enough that `Desapontado` and `Desaprovação`, which agree on five, stay
 * apart.
 */
const STEM_MATCH = 6;

/** Length of the leading run two folded words agree on. */
function sharedStem(a: string, b: string): number {
	let i = 0;
	while (i < a.length && i < b.length && a[i] === b[i]) i++;

	return i;
}

/** Lower ranks sort first; -1 is no match at all. */
function rank(label: string, query: string): number {
	const at = label.indexOf(query);
	if (at >= 0) return at;

	return sharedStem(label, query) >= STEM_MATCH ? label.length : -1;
}

/**
 * Nodes whose Label in this Locale matches the query, nearest match first.
 *
 * Results are meaningless as bare words — several Labels sit on more than one Node — so every caller
 * renders them as full Paths.
 */
export function searchNodes(query: string, locale: Locale, limit = 12): WheelNode[] {
	const wanted = fold(query.trim());
	if (!wanted) return [];

	return allNodes
		.map((node) => ({ node, at: rank(fold(node.labels[locale]), wanted) }))
		.filter(({ at }) => at >= 0)
		.sort((a, b) => a.at - b.at || a.node.depth - b.node.depth)
		.slice(0, limit)
		.map(({ node }) => node);
}

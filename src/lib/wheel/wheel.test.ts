import { describe, expect, it } from 'vitest';
import { WHEEL, type Transcribed } from './labels';
import {
	LOCALES,
	allNodes,
	cores,
	formatPath,
	labelOf,
	nodeByPath,
	nodesAtDepth,
	PATH_DISPLAY_SEPARATOR,
	pathLabels,
	type Locale,
	type WheelNode
} from './wheel';

/**
 * The Wheel data is the one seam this project tests. Everything else is visible on screen — a wrong
 * arc looks wrong — but nobody can eyeball 390 transcribed Labels across three source images. These
 * assertions guard exactly the mistakes the eye cannot catch.
 *
 * Deliberately NOT asserted: Label uniqueness. Duplicate Labels within a Locale are correct source
 * data (ADR-0004) — `Desapontado` sits on three separate Nodes. A uniqueness rule would fail on
 * faithful data.
 */

/** Roberts' structure, keyed by the canonical Portuguese Label of each Core. */
const SECONDARIES_PER_CORE: Record<string, number> = {
	Feliz: 9,
	Raiva: 8,
	Medo: 6,
	Triste: 6,
	Surpresa: 4,
	Mal: 4,
	Enojado: 4
};

describe('the Wheel', () => {
	it('has 7 Cores, 41 Secondaries and 82 Tertiaries', () => {
		expect(nodesAtDepth(0)).toHaveLength(7);
		expect(nodesAtDepth(1)).toHaveLength(41);
		expect(nodesAtDepth(2)).toHaveLength(82);
		expect(allNodes).toHaveLength(130);
	});

	it('gives each Core its published number of Secondaries', () => {
		const counts = Object.fromEntries(
			cores.map((core) => [labelOf(core, 'pt'), core.children.length])
		);

		expect(counts).toEqual(SECONDARIES_PER_CORE);
	});

	it('gives every Secondary exactly 2 Tertiaries', () => {
		for (const secondary of nodesAtDepth(1)) {
			expect(secondary.children).toHaveLength(2);
		}
	});

	it('gives every Tertiary no children', () => {
		for (const tertiary of nodesAtDepth(2)) {
			expect(tertiary.children).toHaveLength(0);
		}
	});
});

describe('Labels', () => {
	it('exist and are non-empty in every Locale for every Node', () => {
		const blank: string[] = [];

		for (const node of allNodes) {
			for (const locale of LOCALES) {
				if (!node.labels[locale]?.trim()) blank.push(`${node.id} (${locale})`);
			}
		}

		expect(blank).toEqual([]);
	});

	it('carries 390 Labels in total', () => {
		const total = allNodes.flatMap((node) => LOCALES.map((locale) => labelOf(node, locale)));

		expect(total).toHaveLength(390);
	});
});

describe('the tree across Locales', () => {
	/**
	 * The three Locales are slots on one shared tree, so a Locale cannot drift structurally — there
	 * is no per-Locale structure to drift. That is the design, and it is what makes switching
	 * lossless.
	 *
	 * What can still go wrong is the transcription itself: a Node read off the images with a slot
	 * missed or a fourth one added. So the check runs against the raw transcription, before the tree
	 * is built and a gap quietly becomes an `undefined` Label.
	 */
	it('carries exactly one Label per Locale at every position', () => {
		const wrong: string[] = [];

		(function walk(nodes: readonly Transcribed[], path: readonly string[]) {
			for (const node of nodes) {
				const [pt, en, es, children] = node;
				const here = [...path, pt].join(' › ');

				if ([pt, en, es].some((label) => typeof label !== 'string' || !label.trim())) {
					wrong.push(`${here}: missing a Label`);
				}
				if (node.length > 4) wrong.push(`${here}: more than three Labels`);

				walk(children ?? [], [...path, pt]);
			}
		})(WHEEL, []);

		expect(wrong).toEqual([]);
	});

	it('reads as a complete Wheel of 130 Nodes in every Locale', () => {
		/** What a reader of one Locale actually sees, traversed the way the app renders it. */
		function render(node: WheelNode, locale: Locale): LocaleTree {
			return { label: labelOf(node, locale), children: node.children.map((c) => render(c, locale)) };
		}

		type LocaleTree = { label: string; children: LocaleTree[] };

		function count(tree: LocaleTree): number {
			return 1 + tree.children.reduce((n, child) => n + count(child), 0);
		}

		for (const locale of LOCALES) {
			const rendering = cores.map((core) => render(core, locale));
			expect(rendering.reduce((n, core) => n + count(core), 0)).toBe(130);
		}
	});
});

describe('Paths', () => {
	it('identify a Node uniquely in every Locale, even where Labels repeat', () => {
		// Ticket 05 encodes the Selection as its Path in the active Locale's words. That only works
		// if no two Nodes share a Path — Labels collide, Paths must not.
		for (const locale of LOCALES) {
			const paths = allNodes.map((node) => formatPath(node, locale));
			expect(new Set(paths).size).toBe(paths.length);
		}
	});

	it('round-trip through nodeByPath', () => {
		for (const locale of LOCALES) {
			for (const node of allNodes) {
				expect(nodeByPath(pathLabels(node, locale), locale)).toBe(node);
			}
		}
	});

	/**
	 * Joined with the exported separator rather than a literal, because the separator carries a
	 * non-breaking space that no reader of this file — or of a diff of it — can see. Written out it
	 * looks like an ordinary one, and the assertion would fail for a reason nobody could read.
	 */
	it('read from the Core down to the Node', () => {
		const overwhelmed = nodeByPath(['Mal', 'Estresse', 'Sobrecarregado'], 'pt');

		expect(overwhelmed).not.toBeNull();
		expect(formatPath(overwhelmed!, 'pt')).toBe(
			['Mal', 'Estresse', 'Sobrecarregado'].join(PATH_DISPLAY_SEPARATOR)
		);
		expect(formatPath(overwhelmed!, 'en')).toBe(
			['Bad', 'Stressed', 'Overwhelmed'].join(PATH_DISPLAY_SEPARATOR)
		);
	});
});

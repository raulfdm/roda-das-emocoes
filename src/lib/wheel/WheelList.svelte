<script lang="ts">
	import type { Words } from '$lib/words';
	import { descendsInto } from './geometry';
	import { cores, labelOf, tintStyle, type Locale, type WheelNode } from './wheel';

	interface Props {
		focus: WheelNode | null;
		locale: Locale;
		words: Words;
		/** The Tertiary currently being read, so the twin can say which one it is. */
		reading: WheelNode | null;
		onDescend: (node: WheelNode) => void;
		onRead: (node: WheelNode) => void;
	}

	let { focus, locale, words, reading, onDescend, onRead }: Props = $props();
</script>

<!--
	The Wheel's semantic twin. Not a second UI and not a mobile fallback: the same tree, the same
	Focus, and the same rule about what responds to a tap — only in the structural form a screen
	reader and a keyboard can actually navigate.
-->
{#snippet branch(nodes: readonly WheelNode[])}
	<ul>
		{#each nodes as node (node.id)}
			{@const label = labelOf(node, locale)}
			{@const inFocus = focus === node}
			{@const opens = descendsInto(node)}
			<li>
				<!--
					Both are buttons now, and they do different things. A Node with children opens; a
					Tertiary has nothing beneath it and is read instead (ADR-0009). The twin has to carry
					that distinction rather than flatten it, because "opens" and "reads" are what the two
					halves of the Wheel actually offer — which is why the accessible name comes from
					`descend` or `read` and never from the Label alone.

					A Tertiary used to be a paragraph here, on the grounds that a control which did
					nothing was worse than text. It does something now, so it is a control.
				-->
				{#if opens}
					<button
						type="button"
						class="node"
						class:is-focus={inFocus}
						style={tintStyle(node.tint)}
						aria-current={inFocus ? 'location' : undefined}
						aria-label={inFocus ? `${words.descend(label)}, ${words.inFocus}` : words.descend(label)}
						onclick={() => onDescend(node)}
					>
						<span aria-hidden="true" class="swatch"></span>
						{label}
						{#if inFocus}
							<span class="state">({words.inFocus})</span>
						{/if}
					</button>
				{:else}
					{@const isReading = reading === node}
					<button
						type="button"
						class="node leaf"
						class:is-focus={isReading}
						style={tintStyle(node.tint)}
						aria-current={isReading ? 'location' : undefined}
						aria-label={words.read(label)}
						onclick={() => onRead(node)}
					>
						<span aria-hidden="true" class="swatch"></span>
						{label}
					</button>
				{/if}

				{#if node.children.length}
					{@render branch(node.children)}
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

<div class="tree">
	{@render branch(cores)}
</div>

<style>
	.tree :global(ul) {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.tree :global(li ul) {
		margin-left: 0.75rem;
		padding-left: 0.75rem;
		border-left: 1px solid rgb(28 25 23 / 0.12);
	}

	.node {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		margin: 0;
		padding: 0.3rem 0.5rem;
		border-radius: 0.375rem;
		text-align: left;
		font-size: 0.875rem;
		color: #292524;
		cursor: pointer;
	}

	/* Still the quieter of the two: a Tertiary responds, but reading is a smaller act than opening. */
	.node.leaf {
		color: #57534e;
	}

	.node:hover {
		background: rgb(28 25 23 / 0.05);
	}

	.node:focus-visible {
		outline: 2px solid #0f766e;
		outline-offset: 1px;
	}

	.swatch {
		flex: none;
		width: 0.7rem;
		height: 0.7rem;
		border-radius: 9999px;
		background: hsl(var(--h) var(--s) var(--l));
		box-shadow: inset 0 0 0 1px rgb(28 25 23 / 0.2);
	}

	.node.is-focus {
		background: rgb(15 118 110 / 0.08);
		font-weight: 600;
	}

	.state {
		color: #57534e;
		font-weight: 400;
	}
</style>

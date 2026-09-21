<script lang="ts">
	import { createPlayer, parsePlayerList } from '$lib/players';
	import type { Player } from '$lib/types/players.types';

	let {
		onAdd,
		onComplete,
		showHeader = true
	}: {
		onAdd: (players: Player[]) => void;
		onComplete: () => void;
		showHeader?: boolean;
	} = $props();
	let text = $state('');
	let message = $state('');

	const result = $derived(parsePlayerList(text));

	function addPlayers() {
		if (!result.players.length) return;

		const players = result.players.map(({ player }) => createPlayer(player));
		onAdd(players);
		text = result.errors.map(({ input }) => input).join('\n');
		message = `${players.length} player${players.length === 1 ? '' : 's'} added.`;
		if (!result.errors.length) onComplete();
	}
</script>

<div class="flex flex-col gap-4">
	{#if showHeader}
		<header class="flex flex-col gap-1">
			<h3 class="text-xl/6 font-medium text-balance">Import players</h3>
			<p class="text-sm/5 text-pretty text-(--color-muted)">
				Paste one player per line using <code>Name - Position</code>.
			</p>
		</header>
	{:else}
		<p class="text-sm/5 text-pretty text-(--color-muted)">
			Paste one player per line using <code>Name - Position</code>.
		</p>
	{/if}

	<label class="flex flex-col gap-2">
		<span class="text-sm/5 font-bold">Player list</span>
		<textarea
			class="min-h-40 resize-y rounded-lg border border-black/10 bg-(--color-surface-muted) px-3 py-2.5 text-base/6 transition-[border-color,box-shadow] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink)"
			bind:value={text}
			placeholder="1. Anuv Love - Forward&#10;2. Femi - Defender, Midfielder"></textarea>
	</label>

	{#if text.trim()}
		<div class="flex flex-col gap-3 text-sm/5" aria-live="polite">
			<p>
				<strong>{result.players.length}</strong>
				{result.players.length === 1 ? 'player' : 'players'} ready to add.
			</p>

			{#if result.errors.length}
				<ul class="flex flex-col gap-2" aria-label="Import errors">
					{#each result.errors as error (`${error.line}-${error.input}`)}
						<li class="rounded-lg bg-(--color-danger-soft) p-3 text-(--color-danger)">
							<strong>Line {error.line}:</strong>
							{error.message}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}

	<div class="flex flex-wrap items-center gap-3">
		<button
			class="min-h-11 rounded-lg bg-(--color-brand) px-4 py-2.5 font-medium transition-[box-shadow,transform] duration-150 ease-out hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none disabled:active:scale-100 motion-reduce:active:scale-100"
			type="button"
			disabled={!result.players.length}
			onclick={addPlayers}
		>
			{#if result.players.length}
				Add {result.players.length} imported {result.players.length === 1 ? 'player' : 'players'}
			{:else}
				Add imported players
			{/if}
		</button>
		{#if message}
			<p class="text-sm/5 text-(--color-muted)" aria-live="polite">{message}</p>
		{/if}
	</div>
</div>

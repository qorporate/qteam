<script lang="ts">
	import { createPlayer, parsePlayerList } from '$lib/players';
	import type { Player } from '$lib/types/players.types';

	let {
		onAdd,
		onComplete,
		onCancel
	}: {
		onAdd: (players: Player[]) => void;
		onComplete: () => void;
		onCancel: () => void;
	} = $props();
	let text = $state('');
	let message = $state('');
	const placeholder = '1. Anuv Love - Forward\n2. Femi - Defender, Midfielder';

	const result = $derived(parsePlayerList(text));

	function importPlayers() {
		if (!result.players.length) return;

		const players = result.players.map(({ player }) => createPlayer(player));
		onAdd(players);
		text = result.errors.map(({ input }) => input).join('\n');
		message = `${players.length} player${players.length === 1 ? '' : 's'} added.`;
		if (!result.errors.length) {
			message = '';
			onComplete();
		}
	}

	function cancel() {
		text = '';
		message = '';
		onCancel();
	}
</script>

<div class="flex flex-col gap-4">
	<p class="text-sm/5 text-pretty text-(--color-muted)">
		Paste one player per line using <code>Name - Position</code>.
	</p>

	<label class="flex flex-col gap-2">
		<span class="text-base/6 text-(--color-muted)">Player list</span>
		<textarea
			class="min-h-40 resize-y rounded-lg border border-black/10 bg-(--color-surface-muted) px-3 py-2.5 text-base/6 transition-[border-color,box-shadow] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink)"
			bind:value={text}
			{placeholder}></textarea>
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

	{#if message}
		<p class="text-sm/5 text-(--color-muted)" aria-live="polite">{message}</p>
	{/if}

	<div class="grid grid-cols-2 gap-3 pt-1">
		<button
			class="min-h-12 rounded-full border border-black/15 bg-(--color-surface) px-4 py-2.5 font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100"
			type="button"
			onclick={cancel}>Cancel</button
		>
		<button
			class="min-h-12 rounded-full border border-black/15 bg-(--color-surface) px-4 py-2.5 font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] disabled:cursor-not-allowed disabled:bg-(--color-surface-muted) disabled:text-(--color-disabled) disabled:hover:bg-(--color-surface-muted) disabled:active:scale-100 motion-reduce:active:scale-100"
			type="button"
			disabled={!result.players.length}
			onclick={importPlayers}>Import</button
		>
	</div>
</div>

<script lang="ts">
	import { toast } from 'svelte-sonner';
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
	const placeholder = '1. Anuv Love - Forward\n2. Femi - Defender, Midfielder';

	const result = $derived(parsePlayerList(text));

	function importPlayers() {
		if (!result.players.length) return;

		const players = result.players.map(({ player }) => createPlayer(player));
		onAdd(players);
		toast.success(`${players.length} player${players.length === 1 ? '' : 's'} added.`);
		text = result.errors.map(({ input }) => input).join('\n');
		if (!result.errors.length) onComplete();
	}

	function cancel() {
		text = '';
		onCancel();
	}
</script>

<div class="flex flex-col gap-4">
	<p class="text-sm/5 text-pretty text-muted">
		Paste one player per line as
		<code class="rounded-md bg-surface-muted px-1.5 py-0.5 text-ink">Name - Position</code>. Use
		commas for more than one position.
	</p>

	<label class="flex flex-col gap-2">
		<span class="text-sm/5 font-medium">Player list</span>
		<textarea
			class="min-h-36 resize-y rounded-xl bg-surface-muted px-3 py-2.5 text-base/6 transition-[background-color] duration-150 ease-out placeholder:text-muted hover:bg-surface-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
			bind:value={text}
			{placeholder}></textarea>
	</label>

	{#if result.players.length || result.errors.length}
		<section class="flex flex-col gap-2" aria-labelledby="import-preview-heading">
			<h3 id="import-preview-heading" class="text-sm/5" aria-live="polite">
				{#if result.players.length}
					<span class="font-medium"
						>{result.players.length}
						{result.players.length === 1 ? 'player' : 'players'} ready to add.</span
					>
				{/if}
				{#if result.errors.length}
					<span class="text-danger">
						{result.errors.length}
						{result.errors.length === 1 ? 'line needs' : 'lines need'} fixing.
					</span>
				{/if}
			</h3>

			{#if result.errors.length}
				<ol class="flex flex-col gap-1.5">
					{#each result.errors as error (`${error.line}-${error.input}`)}
						<li class="flex flex-col gap-0.5 rounded-xl bg-danger/5 px-3 py-2 text-sm/5">
							<span class="truncate text-ink">{error.input}</span>
							<p class="text-danger"><strong>Line {error.line}:</strong> {error.message}</p>
						</li>
					{/each}
				</ol>
			{/if}
		</section>
	{/if}

	<div class="grid grid-cols-2 gap-3 pt-1">
		<button
			class="min-h-12 rounded-full bg-surface-muted px-4 py-2.5 font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-surface-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100"
			type="button"
			onclick={cancel}>Cancel</button
		>
		<button
			class="min-h-12 rounded-full bg-brand px-4 py-2.5 font-medium text-ink transition-[background-color,transform] duration-150 ease-out hover:bg-brand/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] disabled:cursor-not-allowed disabled:bg-surface-strong disabled:text-muted disabled:active:scale-100 motion-reduce:active:scale-100"
			type="button"
			disabled={!result.players.length}
			onclick={importPlayers}
		>
			{result.players.length
				? `Import ${result.players.length} ${result.players.length === 1 ? 'player' : 'players'}`
				: 'Import'}
		</button>
	</div>
</div>

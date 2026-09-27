<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { POSITION_LABELS, createPlayer, parsePlayerList } from '$lib/players';
	import type { Player, Position } from '$lib/types/players.types';

	let {
		rosterSize,
		onAdd,
		onComplete,
		onCancel
	}: {
		rosterSize: number;
		onAdd: (players: Player[]) => void;
		onComplete: () => void;
		onCancel: () => void;
	} = $props();
	let text = $state('');
	const placeholder = '1. Anuv Love - Forward\n2. Femi - Defender, Midfielder';

	const CHIP_STYLES: Record<Position, string> = {
		DEFENDER: 'bg-defender',
		MIDFIELDER: 'bg-midfielder',
		FORWARD: 'bg-forward'
	};

	const result = $derived(parsePlayerList(text));
	// One preview row per non-empty line, in the order it was pasted.
	const rows = $derived(
		[
			...result.players.map((parsed, index) => ({
				...parsed,
				ok: true as const,
				number: rosterSize + index + 1
			})),
			...result.errors.map((error) => ({ ...error, ok: false as const }))
		].sort((a, b) => a.line - b.line)
	);

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

	{#if rows.length}
		<section class="flex flex-col gap-2" aria-labelledby="import-preview-heading">
			<h3 id="import-preview-heading" class="text-sm/5" aria-live="polite">
				<span class="font-medium"
					>{result.players.length}
					{result.players.length === 1 ? 'player' : 'players'} ready to add.</span
				>
				{#if result.errors.length}
					<span class="text-danger">
						{result.errors.length}
						{result.errors.length === 1 ? 'line needs' : 'lines need'} fixing.
					</span>
				{/if}
			</h3>

			<ol class="flex flex-col gap-1.5">
				{#each rows as row (`${row.line}-${row.input}`)}
					{#if row.ok}
						<li class="flex min-h-11 items-center gap-3 rounded-xl bg-surface-muted px-3 py-2">
							<span class="w-8 shrink-0 text-sm/5 font-bold text-muted tabular-nums"
								>#{row.number}</span
							>
							<span class="min-w-0 flex-1 truncate font-medium">{row.player.name}</span>
							<span class="flex shrink-0 gap-1">
								{#each row.player.eligiblePositions as position (position)}
									<span
										class={[
											'grid size-6 place-items-center rounded-full text-xs font-medium text-ink',
											CHIP_STYLES[position]
										]}
										title={POSITION_LABELS[position]}
									>
										<span aria-hidden="true">{POSITION_LABELS[position].charAt(0)}</span>
										<span class="sr-only">{POSITION_LABELS[position]}</span>
									</span>
								{/each}
							</span>
						</li>
					{:else}
						<li class="flex flex-col gap-0.5 rounded-xl bg-danger/5 px-3 py-2 text-sm/5">
							<span class="truncate text-ink">{row.input}</span>
							<p class="text-danger"><strong>Line {row.line}:</strong> {row.message}</p>
						</li>
					{/if}
				{/each}
			</ol>
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

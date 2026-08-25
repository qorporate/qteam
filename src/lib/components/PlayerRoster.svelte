<script lang="ts">
	import { POSITIONS, POSITION_LABELS, getRosterIssues, togglePosition } from '$lib/players';
	import type { Player, PlayerUpdate, Position } from '$lib/types/players.types';

	let {
		players,
		onUpdate,
		onCheckIn,
		onClearCheckIns,
		onRemove,
		onStartOver,
		onContinue
	}: {
		players: Player[];
		onUpdate: (id: string, update: PlayerUpdate) => boolean;
		onCheckIn: (id: string) => void;
		onClearCheckIns: () => void;
		onRemove: (id: string) => void;
		onStartOver: () => void;
		onContinue: () => void;
	} = $props();

	const issues = $derived(getRosterIssues(players));

	function togglePlayerPosition(player: Player, position: Position) {
		onUpdate(player.id, {
			eligiblePositions: togglePosition(player.eligiblePositions, position)
		});
	}
</script>

<section class="flex flex-col gap-5" aria-labelledby="roster-heading">
	<header class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			<h2 id="roster-heading" class="text-xl/6 font-medium text-balance">Roster</h2>
			<span class="rounded-full bg-(--color-brand-soft) px-2 py-1 text-xs/4 font-bold tabular-nums"
				>{players.length}</span
			>
		</div>
		<div class="flex flex-wrap gap-2">
			{#if players.some((player) => player.checkedIn === true)}
				<button
					class="min-h-11 rounded-lg px-3 py-2 text-sm/5 font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100"
					type="button"
					onclick={onClearCheckIns}>Clear check-ins</button
				>
			{/if}
			{#if players.length}
				<button
					class="min-h-11 rounded-lg px-3 py-2 text-sm/5 font-medium text-(--color-danger) transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-danger-soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-danger) active:scale-[0.96] motion-reduce:active:scale-100"
					type="button"
					onclick={onStartOver}>Start over</button
				>
			{/if}
		</div>
	</header>

	{#if players.length === 0}
		<div class="flex flex-col gap-2 rounded-2xl bg-(--color-surface) p-6">
			<p class="text-[40px]/11 font-medium tabular-nums">0</p>
			<p class="text-base/6 text-pretty text-(--color-muted)">
				Add or import players to build your roster.
			</p>
		</div>
	{:else}
		<ul class="flex flex-col gap-2">
			{#each players as player, index (player.id)}
				<li class="flex flex-col gap-2 rounded-xl bg-(--color-surface) p-3">
					<label class="flex flex-col gap-1">
						<span class="text-sm/5 font-bold">Player {index + 1}</span>
						<input
							class="min-h-11 rounded-lg border border-black/10 bg-(--color-surface-muted) px-3 py-2.5 text-base/6 transition-[border-color,box-shadow] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink)"
							class:border-(--color-danger)={!player.name.trim()}
							value={player.name}
							aria-invalid={!player.name.trim() ? 'true' : undefined}
							aria-describedby={!player.name.trim() ? `player-${player.id}-error` : undefined}
							oninput={(event) => {
								const accepted = onUpdate(player.id, { name: event.currentTarget.value });
								if (!accepted) event.currentTarget.value = player.name;
							}}
						/>
					</label>

					<div class="flex flex-wrap items-center gap-2">
						<fieldset
							class="min-w-0 flex-1"
							aria-describedby={player.eligiblePositions.length === 0
								? `player-${player.id}-error`
								: undefined}
						>
							<legend class="sr-only">Positions</legend>
							<div class="flex flex-wrap gap-2">
								{#each POSITIONS as position (position)}
									<button
										class={[
											'min-h-11 shrink-0 rounded-lg border px-2 py-2 text-sm/5 font-medium transition-[background-color,border-color,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100',
											player.eligiblePositions.includes(position)
												? 'border-(--color-brand) bg-(--color-brand-soft) hover:bg-(--color-brand-faint)'
												: 'border-black/10 bg-(--color-surface) hover:border-(--color-brand) hover:bg-(--color-surface-strong)'
										]}
										type="button"
										aria-pressed={player.eligiblePositions.includes(position)}
										onclick={() => togglePlayerPosition(player, position)}
									>
										{POSITION_LABELS[position]}
									</button>
								{/each}
							</div>
						</fieldset>
						<button
							class={[
								'min-h-11 rounded-lg border px-3 py-2 text-sm/5 font-medium transition-[background-color,border-color,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100',
								player.checkedIn === true
									? 'border-(--color-brand) bg-(--color-brand-soft) hover:bg-(--color-brand-faint)'
									: 'border-black/10 bg-(--color-surface) hover:border-(--color-brand) hover:bg-(--color-surface-strong)'
							]}
							type="button"
							aria-label={`${player.checkedIn === true ? 'Uncheck' : 'Check in'} ${player.name || `player ${index + 1}`}`}
							aria-pressed={player.checkedIn === true}
							onclick={() => onCheckIn(player.id)}
						>
							{player.checkedIn === true ? 'Checked in' : 'Check in'}
						</button>
						<button
							class="grid size-11 shrink-0 place-items-center rounded-lg text-(--color-danger) transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-danger-soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-danger) active:scale-[0.96] motion-reduce:active:scale-100"
							type="button"
							aria-label={`Remove ${player.name || `player ${index + 1}`}`}
							title="Remove player"
							onclick={() => onRemove(player.id)}
						>
							<svg
								class="size-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								aria-hidden="true"
							>
								<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" />
							</svg>
						</button>
					</div>

					{#if !player.name.trim() || player.eligiblePositions.length === 0}
						<p id={`player-${player.id}-error`} class="text-sm/5 text-(--color-danger)">
							{!player.name.trim() ? 'Enter a player name.' : 'Choose at least one position.'}
						</p>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}

	<div
		class="flex flex-col gap-2 rounded-xl bg-(--color-surface-muted) p-4 text-sm/5"
		aria-live="polite"
	>
		<p class="font-bold">{issues.length ? 'Roster not ready' : 'Roster ready'}</p>
		{#if issues.length}
			<ul class="flex flex-col gap-1 text-(--color-muted)">
				{#each issues as issue (issue)}
					<li>{issue}</li>
				{/each}
			</ul>
		{:else}
			<p class="text-pretty text-(--color-muted)">
				Every player has a name and at least one position.
			</p>
			<button
				class="min-h-11 self-start rounded-lg bg-(--color-brand) px-4 py-2.5 font-medium text-(--color-ink) transition-[box-shadow,transform] duration-150 ease-out hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100"
				type="button"
				onclick={onContinue}>Choose teams</button
			>
		{/if}
	</div>
</section>

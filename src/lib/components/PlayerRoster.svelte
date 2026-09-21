<script lang="ts">
	import { POSITIONS, POSITION_LABELS, getRosterIssues, togglePosition } from '$lib/players';
	import type { Player, PlayerUpdate, Position } from '$lib/types/players.types';

	let {
		players,
		onUpdate,
		onCheckIn,
		onClearCheckIns,
		onRemove,
		onContinue
	}: {
		players: Player[];
		onUpdate: (id: string, update: PlayerUpdate) => boolean;
		onCheckIn: (id: string) => void;
		onClearCheckIns: () => void;
		onRemove: (id: string) => void;
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
	<h2 id="roster-heading" class="sr-only">Roster</h2>
	{#if players.some((player) => player.checkedIn === true)}
		<button
			class="min-h-11 self-end rounded-lg px-3 py-2 text-sm/5 font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100"
			type="button"
			onclick={onClearCheckIns}>Clear check-ins</button
		>
	{/if}

	{#if players.length === 0}
		<div class="flex flex-col gap-2 rounded-2xl bg-(--color-surface) p-6">
			<p class="text-[40px]/11 font-medium tabular-nums">0</p>
			<p class="text-base/6 text-pretty text-(--color-muted)">
				Add or import players to build your roster.
			</p>
		</div>
	{:else}
		<ul class="grid grid-cols-2 gap-3 sm:gap-4">
			{#each players as player, index (player.id)}
				<li class="flex min-w-0 flex-col gap-4 rounded-2xl bg-(--color-surface) p-3 sm:p-4">
					<label>
						<span class="sr-only">Player {index + 1}</span>
						<input
							class="w-full rounded-lg bg-transparent px-1 py-1 text-lg/6 font-medium transition-[background-color] duration-150 ease-out hover:bg-(--color-surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink)"
							value={player.name}
							aria-invalid={!player.name.trim() ? 'true' : undefined}
							aria-describedby={!player.name.trim() ? `player-${player.id}-error` : undefined}
							oninput={(event) => {
								const accepted = onUpdate(player.id, { name: event.currentTarget.value });
								if (!accepted) event.currentTarget.value = player.name;
							}}
						/>
					</label>

					<div class="flex flex-col gap-3">
						<fieldset
							class="min-w-0"
							aria-describedby={player.eligiblePositions.length === 0
								? `player-${player.id}-error`
								: undefined}
						>
							<legend class="sr-only">Positions</legend>
							<div class="flex gap-1">
								{#each POSITIONS as position (position)}
									<button
										class={[
											'grid size-8 shrink-0 place-items-center rounded-full border text-sm/5 font-medium transition-[background-color,border-color,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100',
											player.eligiblePositions.includes(position)
												? 'border-(--color-brand) bg-(--color-brand) text-(--color-ink) hover:bg-(--color-brand-soft)'
												: 'border-black/10 bg-(--color-surface) hover:border-(--color-brand) hover:bg-(--color-surface-strong)'
										]}
										type="button"
										aria-label={POSITION_LABELS[position]}
										aria-pressed={player.eligiblePositions.includes(position)}
										onclick={() => togglePlayerPosition(player, position)}
									>
										{POSITION_LABELS[position].charAt(0)}
									</button>
								{/each}
							</div>
						</fieldset>
						<div class="grid grid-cols-2 gap-2">
							<button
								class={[
									'grid min-h-12 place-items-center rounded-full border transition-[background-color,border-color,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100',
									player.checkedIn === true
										? 'border-(--color-brand) bg-(--color-brand-soft) text-(--color-ink) hover:bg-(--color-brand-faint)'
										: 'border-black/10 bg-(--color-surface) hover:border-(--color-brand) hover:bg-(--color-surface-strong)'
								]}
								type="button"
								aria-label={`${player.checkedIn === true ? 'Uncheck' : 'Check in'} ${player.name || `player ${index + 1}`}`}
								aria-pressed={player.checkedIn === true}
								onclick={() => onCheckIn(player.id)}
							>
								<svg
									class="size-5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									aria-hidden="true"
								>
									<path d="m5 12 4 4L19 6" />
								</svg>
							</button>
							<button
								class="grid min-h-12 place-items-center rounded-full border border-black/10 text-(--color-danger) transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-danger-soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-danger) active:scale-[0.96] motion-reduce:active:scale-100"
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

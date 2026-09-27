<script lang="ts">
	import { faCircleCheck, faTrashCan } from '@fortawesome/free-regular-svg-icons';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Jersey from '$lib/components/Jersey.svelte';
	import { POSITIONS, POSITION_LABELS, togglePosition } from '$lib/players';
	import type { Player, PlayerUpdate, Position } from '$lib/types/players.types';

	let {
		players,
		onUpdate,
		onCheckIn,
		onRemove
	}: {
		players: Player[];
		onUpdate: (id: string, update: PlayerUpdate) => boolean;
		onCheckIn: (id: string) => void;
		onRemove: (id: string) => void;
	} = $props();

	const CHIP_STYLES: Record<Position, string> = {
		DEFENDER: 'border-defender bg-defender text-ink',
		MIDFIELDER: 'border-midfielder bg-midfielder text-ink',
		FORWARD: 'border-forward bg-forward text-ink'
	};

	// Card colours come from the player's positions, so a D+M card blends blue into mint.
	// Stops are data-driven, so they are passed as CSS variables for the utilities below.
	function cardColours(positions: Position[]): string {
		const colours = positions.length
			? positions.map((position) => `var(--color-${position.toLowerCase()})`)
			: ['var(--color-danger)'];
		const gradient = (strength: number) =>
			`linear-gradient(in oklch 135deg, ${(colours.length === 1
				? [colours[0], colours[0]]
				: colours
			)
				.map((colour) => `color-mix(in srgb, ${colour} ${strength}%, white)`)
				.join(', ')})`;

		return [
			`--card-accent: ${gradient(100)}`,
			`--card-tint: ${gradient(12)}`,
			`--card-slash: ${gradient(30)}`,
			`--card-number: ${gradient(55)}`
		].join('; ');
	}

	function togglePlayerPosition(player: Player, position: Position) {
		onUpdate(player.id, {
			eligiblePositions: togglePosition(player.eligiblePositions, position)
		});
	}
</script>

<section class="flex flex-col gap-4" aria-labelledby="roster-heading">
	<h2 id="roster-heading" class="sr-only">Roster</h2>
	{#if players.length === 0}
		<EmptyState
			title="No players yet"
			description="Import your list or add players one at a time. You need at least 8 to make teams."
		>
			{#snippet art()}
				<div class="flex items-end">
					<Jersey size={88} class="-me-3 -rotate-12 text-brand" />
					<Jersey size={104} class="relative rotate-6 text-ink" />
				</div>
			{/snippet}
		</EmptyState>
	{:else}
		<p
			class="w-full rounded-xl bg-surface px-4 py-2 text-center text-sm/5 font-medium tabular-nums"
		>
			{players.length}
			{players.length === 1 ? 'player' : 'players'}
		</p>
		<ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
			{#each players as player, index (player.id)}
				<li
					class="relative min-w-0 overflow-hidden rounded-2xl bg-(image:--card-accent) p-1.5"
					style={cardColours(player.eligiblePositions)}
				>
					<span
						class="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/35%)_0_3px,transparent_3px_9px)] [mask-image:linear-gradient(135deg,transparent_55%,#000_85%)]"
						aria-hidden="true"
					></span>

					<div class="relative flex flex-col overflow-hidden rounded-xl bg-surface text-ink">
						<div class="relative h-32 overflow-hidden bg-(image:--card-tint)" aria-hidden="true">
							<span class="absolute -top-6 -left-4 h-44 w-10 rotate-[28deg] bg-(image:--card-slash)"
							></span>
							{#if player.checkedIn === true}
								<span
									class="absolute top-2 left-2 grid size-6 place-items-center rounded-full bg-ink text-white"
								>
									<Icon icon={faCircleCheck} size={14} />
								</span>
							{/if}
							<span
								class="absolute right-1 bottom-4 bg-(image:--card-number) bg-clip-text text-[5rem]/none font-black tracking-tighter text-transparent tabular-nums"
								>#{index + 1}</span
							>
						</div>

						<label class="relative z-10 me-3 -mt-5">
							<span class="sr-only">Player {index + 1}</span>
							<span
								class="absolute inset-y-0 left-0 w-1 bg-(image:--card-accent)"
								aria-hidden="true"
							></span>
							<input
								class="min-h-11 w-full cursor-text rounded-e-lg bg-ink py-2 ps-4 pe-3 text-base/6 font-bold tracking-wide text-white uppercase transition-[background-color] duration-150 ease-out hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
								value={player.name}
								aria-invalid={!player.name.trim() ? 'true' : undefined}
								aria-describedby={!player.name.trim() ? `player-${player.id}-error` : undefined}
								oninput={(event) => {
									const accepted = onUpdate(player.id, { name: event.currentTarget.value });
									if (!accepted) event.currentTarget.value = player.name;
								}}
							/>
						</label>

						<div class="flex flex-col gap-2 p-2 pt-3 sm:p-3">
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
												'grid size-8 shrink-0 place-items-center rounded-full border text-sm/5 font-medium transition-[background-color,border-color,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100',
												player.eligiblePositions.includes(position)
													? CHIP_STYLES[position]
													: 'border-black/10 bg-surface hover:border-black/25 hover:bg-surface-strong'
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
										'grid min-h-11 place-items-center rounded-full border transition-[background-color,border-color,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100',
										player.checkedIn === true
											? 'border-ink bg-ink text-white hover:bg-black'
											: 'border-black/10 hover:bg-surface-strong'
									]}
									type="button"
									aria-label={`${player.checkedIn === true ? 'Uncheck' : 'Check in'} ${player.name || `player ${index + 1}`}`}
									aria-pressed={player.checkedIn === true}
									onclick={() => onCheckIn(player.id)}
								>
									<Icon icon={faCircleCheck} />
								</button>
								<button
									class="grid min-h-11 place-items-center rounded-full border border-black/10 text-danger transition-[background-color,transform] duration-150 ease-out hover:bg-danger-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger active:scale-[0.96] motion-reduce:active:scale-100"
									type="button"
									aria-label={`Remove ${player.name || `player ${index + 1}`}`}
									title="Remove player"
									onclick={() => onRemove(player.id)}
								>
									<Icon icon={faTrashCan} />
								</button>
							</div>

							{#if !player.name.trim() || player.eligiblePositions.length === 0}
								<p id={`player-${player.id}-error`} class="text-sm/5 text-danger">
									{!player.name.trim() ? 'Enter a player name.' : 'Choose at least one position.'}
								</p>
							{/if}
						</div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>

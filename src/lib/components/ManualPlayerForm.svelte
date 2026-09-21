<script lang="ts">
	import { POSITIONS, POSITION_LABELS, createPlayer, togglePosition } from '$lib/players';
	import type { Player, Position } from '$lib/types/players.types';

	let {
		onAdd,
		onComplete
	}: {
		onAdd: (player: Player) => void;
		onComplete: () => void;
	} = $props();
	let name = $state('');
	let positions = $state<Position[]>([]);
	let nameError = $state('');
	let positionError = $state('');

	function addPlayer(event: SubmitEvent) {
		event.preventDefault();
		nameError = name.trim() ? '' : 'Enter a player name.';
		positionError = positions.length ? '' : 'Choose at least one position.';

		if (nameError || positionError) return;

		onAdd(createPlayer({ name, eligiblePositions: positions }));
		name = '';
		positions = [];
		onComplete();
	}

	function toggle(position: Position) {
		positions = togglePosition(positions, position);
		positionError = '';
	}
</script>

<form class="flex flex-col gap-3" aria-label="Add player manually" onsubmit={addPlayer} novalidate>
	<label class="flex flex-col gap-1">
		<span class="text-sm/5 font-bold">Player name</span>
		<input
			class="min-h-11 rounded-lg border border-black/10 bg-(--color-surface-muted) px-3 py-2.5 text-base/6 transition-[border-color,box-shadow] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink)"
			class:border-(--color-danger)={Boolean(nameError)}
			bind:value={name}
			aria-invalid={nameError ? 'true' : undefined}
			aria-describedby={nameError ? 'manual-name-error' : undefined}
			oninput={() => (nameError = '')}
		/>
		{#if nameError}
			<span id="manual-name-error" class="text-sm/5 text-(--color-danger)">{nameError}</span>
		{/if}
	</label>

	<div class="flex items-center gap-2">
		<fieldset
			class="min-w-0 flex-1"
			aria-describedby={positionError ? 'manual-position-error' : undefined}
		>
			<legend class="sr-only">Positions</legend>
			<div class="flex flex-wrap gap-2">
				{#each POSITIONS as position (position)}
					<button
						class={[
							'min-h-11 shrink-0 rounded-lg border px-2 py-2 text-sm/5 font-medium transition-[background-color,border-color,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100',
							positions.includes(position)
								? 'border-(--color-brand) bg-(--color-brand-soft) hover:bg-(--color-brand-faint)'
								: 'border-black/10 bg-(--color-surface) hover:border-(--color-brand) hover:bg-(--color-surface-strong)'
						]}
						type="button"
						aria-pressed={positions.includes(position)}
						onclick={() => toggle(position)}
					>
						{POSITION_LABELS[position]}
					</button>
				{/each}
			</div>
		</fieldset>
		<span class="h-8 w-px bg-black/15" aria-hidden="true"></span>
		<button
			class="grid size-11 shrink-0 place-items-center rounded-lg bg-(--color-brand) text-(--color-ink) transition-[box-shadow,transform] duration-150 ease-out hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100"
			type="submit"
			aria-label="Add player"
			title="Add player"
		>
			<svg
				class="size-5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"
			>
				<path d="M12 5v14M5 12h14" />
			</svg>
		</button>
	</div>
	{#if positionError}
		<span id="manual-position-error" class="text-sm/5 text-(--color-danger)">{positionError}</span>
	{/if}
</form>

<script lang="ts">
	import { POSITIONS, POSITION_LABELS, createPlayer, togglePosition } from '$lib/players';
	import type { Player, Position } from '$lib/types/players.types';

	let {
		onAdd,
		onComplete,
		onCancel
	}: {
		onAdd: (player: Player) => void;
		onComplete: () => void;
		onCancel: () => void;
	} = $props();
	let name = $state('');
	let positions = $state<Position[]>([]);
	let nameError = $state('');
	let positionError = $state('');
	const canAdd = $derived(name.trim().length >= 1 && positions.length >= 1);

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

	function cancel() {
		name = '';
		positions = [];
		nameError = '';
		positionError = '';
		onCancel();
	}
</script>

<form class="flex flex-col gap-5" aria-label="Add player manually" onsubmit={addPlayer} novalidate>
	<label>
		<span class="sr-only">Player name</span>
		<input
			class="min-h-14 w-full rounded-lg border border-black/10 bg-(--color-surface) px-4 py-3 text-lg/7 transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-(--color-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink)"
			class:border-(--color-danger)={Boolean(nameError)}
			bind:value={name}
			placeholder="Player name"
			aria-invalid={nameError ? 'true' : undefined}
			aria-describedby={nameError ? 'manual-name-error' : undefined}
			oninput={() => (nameError = '')}
		/>
		{#if nameError}
			<span id="manual-name-error" class="text-sm/5 text-(--color-danger)">{nameError}</span>
		{/if}
	</label>

	<fieldset aria-describedby={positionError ? 'manual-position-error' : undefined}>
		<legend class="mb-1 text-base/6 text-(--color-muted)">Positions</legend>
		<div class="flex flex-col">
			{#each POSITIONS as position (position)}
				<label class="flex min-h-11 cursor-pointer items-center gap-3 text-base/6">
					<input
						class="size-5 accent-(--color-brand)"
						type="checkbox"
						checked={positions.includes(position)}
						onchange={() => toggle(position)}
					/>
					<span>{POSITION_LABELS[position]}</span>
				</label>
			{/each}
		</div>
	</fieldset>
	{#if positionError}
		<span id="manual-position-error" class="text-sm/5 text-(--color-danger)">{positionError}</span>
	{/if}

	<div class="grid grid-cols-2 gap-3 pt-1">
		<button
			class="min-h-12 rounded-full border border-black/15 bg-(--color-surface) px-4 py-2.5 font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100"
			type="button"
			onclick={cancel}>Cancel</button
		>
		<button
			class="min-h-12 rounded-full border border-black/15 bg-(--color-surface) px-4 py-2.5 font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] disabled:cursor-not-allowed disabled:bg-(--color-surface-muted) disabled:text-(--color-disabled) disabled:hover:bg-(--color-surface-muted) disabled:active:scale-100 motion-reduce:active:scale-100"
			type="submit"
			disabled={!canAdd}>Add player</button
		>
	</div>
</form>

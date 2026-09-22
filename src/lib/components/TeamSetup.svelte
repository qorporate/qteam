<script lang="ts">
	import { TEAM_SIZE_OPTIONS, getTeamCountForTargetSize, getTeamSizes } from '$lib/teams';

	let {
		playerCount,
		teamSize,
		onChoose
	}: {
		playerCount: number;
		teamSize?: number;
		onChoose: (teamSize: number) => void;
	} = $props();

	function optionDetails(size: number) {
		const teamCount = getTeamCountForTargetSize(playerCount, size);
		const sizes = teamCount ? getTeamSizes(playerCount, teamCount) : [];
		return {
			teamCount,
			minimum: sizes.length ? Math.min(...sizes) : 0,
			maximum: sizes.length ? Math.max(...sizes) : 0
		};
	}
</script>

<div class="flex flex-col gap-4">
	<section
		class="grid grid-cols-2 gap-3 border-b border-black/10 pb-4 sm:gap-4"
		aria-label="Setup summary"
	>
		<div class="flex flex-col gap-1 rounded-2xl bg-(--color-surface) p-4">
			<span class="text-2xl/8 font-medium tabular-nums">{playerCount}</span>
			<span class="text-sm/5 text-(--color-muted)">Players</span>
		</div>
		<div class="flex flex-col gap-1 rounded-2xl bg-(--color-surface) p-4">
			<span class="text-2xl/8 font-medium tabular-nums"
				>{teamSize ? `${teamSize}v${teamSize}` : '—'}</span
			>
			<span class="text-sm/5 text-(--color-muted)">Target team size</span>
		</div>
	</section>

	<section class="flex flex-col gap-4" aria-labelledby="team-size-heading">
		<header class="flex flex-col gap-1">
			<h2 id="team-size-heading" class="text-lg/6 font-medium text-balance">Choose a team size</h2>
			<p class="text-sm/5 text-pretty text-(--color-muted)">
				This is a target. Everyone plays, so final team sizes may differ.
			</p>
		</header>
		<fieldset class="flex flex-col gap-3">
			<legend class="sr-only">Choose the target number of players per team</legend>
			{#each TEAM_SIZE_OPTIONS as size (size)}
				{@const details = optionDetails(size)}
				{@const playerSummary =
					details.minimum === details.maximum
						? `${details.minimum} players each`
						: `${details.minimum} to ${details.maximum} players each`}
				<button
					class={[
						'flex min-h-20 items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-[background-color,border-color,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100',
						teamSize === size
							? 'border-(--color-brand) bg-(--color-brand-soft) hover:bg-(--color-brand-faint)'
							: 'border-black/10 bg-(--color-surface) hover:border-(--color-brand) hover:bg-(--color-surface-strong)'
					]}
					type="button"
					aria-label={`${size}v${size}: ${details.teamCount} teams, ${playerSummary}`}
					aria-pressed={teamSize === size}
					onclick={() => onChoose(size)}
				>
					<strong class="text-xl/6 font-medium tabular-nums">{size}v{size}</strong>
					<span class="text-sm/5 text-(--color-muted)">
						{details.teamCount}
						{details.teamCount === 1 ? 'team' : 'teams'} ·
						{details.minimum === details.maximum
							? `${details.minimum} players each`
							: `${details.minimum}–${details.maximum} players each`}
					</span>
				</button>
			{/each}
		</fieldset>
	</section>
</div>

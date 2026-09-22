<script lang="ts">
	import { getTeamSizes, getValidTeamCounts } from '$lib/teams';

	let {
		playerCount,
		teamCount,
		onChoose
	}: {
		playerCount: number;
		teamCount?: number;
		onChoose: (teamCount: number) => void;
	} = $props();

	const validTeamCounts = $derived(getValidTeamCounts(playerCount));
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
			<span class="text-2xl/8 font-medium tabular-nums">{validTeamCounts.length}</span>
			<span class="text-sm/5 text-(--color-muted)">Team options</span>
		</div>
	</section>

	<section class="flex flex-col gap-4" aria-labelledby="team-count-heading">
		<header class="flex flex-col gap-1">
			<h2 id="team-count-heading" class="text-lg/6 font-medium text-balance">How Many Teams?</h2>
			<p class="text-sm/5 text-pretty text-(--color-muted)">
				Every player is included, with 4 to 10 players on each team.
			</p>
		</header>
		<fieldset class="flex flex-col gap-3">
			<legend class="sr-only">Choose the number of teams</legend>
			{#each validTeamCounts as count (count)}
				<button
					class={[
						'flex min-h-20 items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-[background-color,border-color,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100',
						teamCount === count
							? 'border-(--color-brand) bg-(--color-brand-soft) hover:bg-(--color-brand-faint)'
							: 'border-black/10 bg-(--color-surface) hover:border-(--color-brand) hover:bg-(--color-surface-strong)'
					]}
					type="button"
					aria-label={`${count} teams: ${getTeamSizes(playerCount, count).join(', ')} players`}
					aria-pressed={teamCount === count}
					onclick={() => onChoose(count)}
				>
					<span>
						<strong class="text-xl/6 font-medium tabular-nums">{count} teams</strong>
					</span>
					<span class="text-sm/5 text-(--color-muted)">
						{getTeamSizes(playerCount, count).join(', ')} players
					</span>
				</button>
			{/each}
		</fieldset>
	</section>
</div>

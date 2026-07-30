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

<div class="flex flex-col gap-6">
	<header class="flex flex-col gap-2">
		<h1 class="text-2xl/8 font-medium">Set up teams</h1>
		<p class="text-base/6 text-(--color-muted)">
			Choose how many teams to make from {playerCount} outfield players.
		</p>
	</header>

	<section
		class="flex flex-col gap-4 rounded-2xl bg-(--color-surface) p-4 sm:p-6"
		aria-labelledby="team-count-heading"
	>
		<fieldset class="flex flex-col gap-2">
			<legend class="sr-only">Choose the number of teams</legend>
			{#each validTeamCounts as count (count)}
				<button
					class={[
						'flex min-h-11 items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand)',
						teamCount === count
							? 'border-(--color-brand) bg-(--color-brand-soft)'
							: 'border-black/10 bg-(--color-surface)'
					]}
					type="button"
					aria-pressed={teamCount === count}
					onclick={() => onChoose(count)}
				>
					<span class="font-medium">{count} teams</span>
					<span class="text-sm/5 text-(--color-muted)"
						>{getTeamSizes(playerCount, count).join(', ')} players</span
					>
				</button>
			{/each}
		</fieldset>

		{#if teamCount}
			<p class="text-sm/5 text-(--color-muted)" aria-live="polite">
				Saved. Team generation is the next step.
			</p>
		{/if}
	</section>
</div>

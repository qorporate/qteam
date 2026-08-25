<script lang="ts">
	import { getTeamSizes, getValidTeamCounts } from '$lib/teams';

	let {
		playerCount,
		teamCount,
		onChoose,
		onGenerate
	}: {
		playerCount: number;
		teamCount?: number;
		onChoose: (teamCount: number) => void;
		onGenerate: () => void;
	} = $props();

	const validTeamCounts = $derived(getValidTeamCounts(playerCount));
</script>

<div class="flex flex-col gap-6">
	<header class="flex flex-col gap-2">
		<h1 class="text-2xl/8 font-medium text-balance">Set up teams</h1>
		<p class="text-base/6 text-pretty text-(--color-muted)">
			Choose how many teams to make from {playerCount} outfield players.
		</p>
	</header>

	<section
		class="flex flex-col gap-4 rounded-2xl bg-(--color-surface) p-4 sm:p-6"
		aria-labelledby="team-count-heading"
	>
		<h2 id="team-count-heading" class="text-lg/6 font-medium text-balance">Number of teams</h2>
		<fieldset class="flex flex-col gap-2">
			<legend class="sr-only">Choose the number of teams</legend>
			{#each validTeamCounts as count (count)}
				<button
					class={[
						'flex min-h-11 items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-[background-color,border-color,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100',
						teamCount === count
							? 'border-(--color-brand) bg-(--color-brand-soft) hover:bg-(--color-brand-faint)'
							: 'border-black/10 bg-(--color-surface) hover:border-(--color-brand) hover:bg-(--color-surface-strong)'
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
			<div class="flex flex-wrap items-center gap-3">
				<p class="text-sm/5 text-(--color-muted)" aria-live="polite">Saved.</p>
				<button
					class="min-h-11 rounded-lg bg-(--color-brand) px-4 py-2.5 font-medium text-(--color-ink) transition-[box-shadow,transform] duration-150 ease-out hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100"
					type="button"
					onclick={onGenerate}>Generate teams</button
				>
			</div>
		{/if}
	</section>
</div>

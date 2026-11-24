<script lang="ts">
	import {
		TEAM_SIZE_OPTIONS,
		getPreferredFormation,
		getTeamCountForTargetSize,
		getTeamSizes
	} from '$lib/teams';
	import type { Position } from '$lib/types/players.types';

	let {
		playerCount,
		teamSize,
		revealAsDraw,
		onChoose,
		onRevealAsDrawChange
	}: {
		playerCount: number;
		teamSize?: number;
		revealAsDraw: boolean;
		onChoose: (teamSize: number) => void;
		onRevealAsDrawChange: (enabled: boolean) => void;
	} = $props();

	// Same orientation as the teams page: forwards at the top, defenders nearest the goal.
	const PITCH_ROWS = ['FORWARD', 'MIDFIELDER', 'DEFENDER'] as const satisfies readonly Position[];

	const DOT_STYLES: Record<Position, string> = {
		DEFENDER: 'bg-defender',
		MIDFIELDER: 'bg-midfielder',
		FORWARD: 'bg-forward'
	};

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
	<section class="grid grid-cols-2 gap-3 sm:gap-4" aria-label="Setup summary">
		<div class="flex flex-col gap-1 rounded-2xl bg-surface p-4">
			<span class="text-2xl/8 font-medium tabular-nums">{playerCount}</span>
			<span class="text-sm/5 text-muted">Players</span>
		</div>
		<div class="flex flex-col gap-1 rounded-2xl bg-surface p-4">
			<span class="text-2xl/8 font-medium tabular-nums"
				>{teamSize ? `${teamSize}v${teamSize}` : '—'}</span
			>
			<span class="text-sm/5 text-muted">Target team size</span>
		</div>
	</section>

	<section class="flex flex-col gap-4" aria-labelledby="team-size-heading">
		<header class="flex flex-col gap-1">
			<h2 id="team-size-heading" class="text-lg/6 font-medium text-balance">Choose a team size</h2>
			<p class="text-sm/5 text-pretty text-muted">
				This is a target. Everyone plays, so final team sizes may differ.
			</p>
		</header>
		<fieldset class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
			<legend class="sr-only">Choose the target number of players per team</legend>
			{#each TEAM_SIZE_OPTIONS as size (size)}
				{@const details = optionDetails(size)}
				{@const formation = (getPreferredFormation(details.maximum) ??
					getPreferredFormation(size))!}
				{@const isSelected = teamSize === size}
				{@const playerSummary =
					details.minimum === details.maximum
						? `${details.minimum} players each`
						: `${details.minimum} to ${details.maximum} players each`}
				<button
					class={[
						'flex flex-col gap-3 rounded-2xl border-2 bg-surface p-3 text-left transition-[border-color,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100',
						isSelected ? 'border-ink' : 'border-transparent hover:border-black/15'
					]}
					type="button"
					aria-label={`${size}v${size}: ${details.teamCount} teams, ${playerSummary}`}
					aria-pressed={isSelected}
					onclick={() => onChoose(size)}
				>
					<span class="flex items-center justify-between gap-2">
						<strong
							class={[
								'rounded-md px-2 text-xl/8 font-bold tabular-nums transition-[background-color,color] duration-150 ease-out',
								isSelected ? 'bg-ink text-white' : 'bg-surface-muted text-ink'
							]}>{size}v{size}</strong
						>
						<span class="text-sm/5 font-medium text-muted tabular-nums">
							{formation.DEFENDER}-{formation.MIDFIELDER}-{formation.FORWARD}
						</span>
					</span>

					<span
						class="relative flex flex-col gap-3 overflow-hidden rounded-lg border-2 border-black/10 bg-brand-faint px-1 pt-4 pb-7"
						aria-hidden="true"
					>
						<span
							class="absolute -top-5 left-1/2 size-10 -translate-x-1/2 rounded-full border-2 border-black/10"
						></span>
						<span
							class="absolute bottom-0 left-1/2 h-5 w-1/2 -translate-x-1/2 border-2 border-b-0 border-black/10"
						></span>
						{#each PITCH_ROWS as position (position)}
							<span class="relative flex justify-evenly">
								{#each { length: formation[position] }, dot (dot)}
									<span class={['size-3.5 rounded-full ring-2 ring-surface', DOT_STYLES[position]]}
									></span>
								{/each}
							</span>
						{/each}
					</span>

					<span class="text-sm/5 text-muted">
						{details.teamCount}
						{details.teamCount === 1 ? 'team' : 'teams'} ·
						{details.minimum === details.maximum
							? `${details.minimum} each`
							: `${details.minimum}–${details.maximum} each`}
					</span>
				</button>
			{/each}
		</fieldset>
	</section>

	<section class="rounded-2xl bg-surface p-4" aria-labelledby="draw-reveal-heading">
		<label class="relative flex min-h-11 cursor-pointer items-center justify-between gap-4">
			<span class="flex min-w-0 flex-col gap-1">
				<span class="flex flex-wrap items-center gap-2">
					<span id="draw-reveal-heading" class="font-medium">Reveal as a draw</span>
					<span
						class="rounded-full bg-brand-soft px-2 py-0.5 text-xs/4 font-medium text-brand-strong"
						>Experiment</span
					>
				</span>
				<span class="text-sm/5 text-pretty text-muted">
					Show players one at a time, pot by pot: defenders, then midfielders, then forwards.
				</span>
			</span>
			<input
				class="peer sr-only"
				type="checkbox"
				role="switch"
				checked={revealAsDraw}
				aria-labelledby="draw-reveal-heading"
				onchange={(event) => onRevealAsDrawChange(event.currentTarget.checked)}
			/>
			<span
				class="relative h-7 w-12 shrink-0 rounded-full bg-muted transition-colors duration-150 ease-out peer-checked:bg-brand-strong peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-surface after:shadow-sm after:transition-transform after:duration-150 after:ease-out peer-checked:after:translate-x-5 motion-reduce:transition-none motion-reduce:after:transition-none"
				aria-hidden="true"
			></span>
		</label>
	</section>
</div>

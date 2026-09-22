<script lang="ts">
	import { faCircleCheck, faCopy } from '@fortawesome/free-regular-svg-icons';
	import Icon from '$lib/components/Icon.svelte';
	import { POSITION_LABELS, POSITIONS } from '$lib/players';
	import { formatTeam } from '$lib/sharing';
	import { formatFormation, getCoverageWarnings, swapPlayers, teamName } from '$lib/teams';
	import type { Player, Position } from '$lib/types/players.types';
	import type { GeneratedResult, GeneratedTeam } from '$lib/types/teams.types';

	let {
		players,
		generated,
		actionMessage,
		onSwap
	}: {
		players: Player[];
		generated: GeneratedResult;
		actionMessage: string;
		onSwap: (teams: GeneratedTeam[]) => void;
	} = $props();

	const playersById = $derived(new Map(players.map((player) => [player.id, player])));
	const warnings = $derived(getCoverageWarnings(players, generated.teams));
	let selected = $state<{ teamId: string; playerId: string }>();
	let swapMessage = $state('');
	let copyMessage = $state('');
	let copiedTeamId = $state<string>();
	let copyFeedbackTimeout: ReturnType<typeof setTimeout>;

	function assignedPlayers(team: GeneratedTeam, position: Position): Player[] {
		return team.players
			.filter((assigned) => assigned.assignedPosition === position)
			.map((assigned) => playersById.get(assigned.playerId)!);
	}

	function selectPlayer(team: GeneratedTeam, playerId: string) {
		if (!selected) {
			selected = { teamId: team.id, playerId };
			swapMessage = 'Choose a player on another team.';
			return;
		}
		if (selected.playerId === playerId) {
			selected = undefined;
			swapMessage = '';
			return;
		}
		if (selected.teamId === team.id) {
			swapMessage = 'Choose a player on another team.';
			return;
		}

		const result = swapPlayers(players, generated.teams, selected.playerId, playerId);
		if (!result.ok) {
			swapMessage = result.issues.join(' ');
			return;
		}
		if (
			result.addedWarnings.length &&
			!confirm(`${result.addedWarnings.join('\n')} Apply this swap?`)
		) {
			return;
		}
		onSwap(result.teams);
		selected = undefined;
		swapMessage = 'Swapped players.';
	}

	async function copy(text: string, label: string, teamId: string) {
		try {
			await navigator.clipboard.writeText(text);
			copyMessage = '';
			copiedTeamId = teamId;
			clearTimeout(copyFeedbackTimeout);
			copyFeedbackTimeout = setTimeout(() => (copiedTeamId = undefined), 1500);
		} catch {
			copiedTeamId = undefined;
			copyMessage = `${label} could not be copied. Select and copy the team text manually.`;
		}
	}
</script>

<div class="flex flex-col gap-4">
	<section
		class="grid grid-cols-2 gap-3 border-b border-black/10 pb-4 sm:gap-4"
		aria-label="Generated team summary"
	>
		<div class="flex flex-col gap-1 rounded-2xl bg-(--color-surface) p-4">
			<span class="text-2xl/8 font-medium tabular-nums">{generated.teams.length}</span>
			<span class="text-sm/5 text-(--color-muted)">
				{generated.teams.length === 1 ? 'Team' : 'Teams'}
			</span>
		</div>
		<div class="flex flex-col gap-1 rounded-2xl bg-(--color-surface) p-4">
			<span class="text-2xl/8 font-medium tabular-nums">{players.length}</span>
			<span class="text-sm/5 text-(--color-muted)">
				{players.length === 1 ? 'Player' : 'Players'}
			</span>
		</div>
	</section>

	<section class="rounded-2xl bg-(--color-surface) p-4" aria-labelledby="swap-heading">
		<h2 id="swap-heading" class="font-medium">Swap players</h2>
		<p class="mt-1 text-sm/5 text-pretty text-(--color-muted)" aria-live="polite">
			{swapMessage || 'Select a player, then select someone on another team.'}
		</p>
	</section>

	{#if actionMessage || copyMessage}
		<p class="text-sm/5 text-(--color-danger)" role="alert">{actionMessage || copyMessage}</p>
	{/if}

	{#if warnings.length}
		<aside
			class="flex flex-col gap-2 rounded-xl bg-(--color-warning-soft) p-4 text-sm/5"
			aria-label="Coverage warnings"
		>
			<p class="font-medium">Coverage warnings</p>
			<ul class="flex flex-col gap-1 text-(--color-muted)">
				{#each warnings as warning (warning)}
					<li>{warning}</li>
				{/each}
			</ul>
		</aside>
	{/if}

	<div class="flex flex-col gap-4">
		{#each generated.teams as team, index (team.id)}
			<section
				class="flex flex-col gap-5 rounded-2xl bg-(--color-surface) p-4 sm:p-6"
				aria-labelledby={`team-${team.id}`}
			>
				<header class="flex items-center justify-between gap-3 border-b border-black/10 pb-4">
					<div class="flex flex-col gap-1">
						<h2 id={`team-${team.id}`} class="text-xl/6 font-medium text-balance">
							Team {teamName(index)}
						</h2>
						<p class="text-sm/5 text-(--color-muted)">
							{team.players.length} players · {formatFormation(team)}
						</p>
					</div>
					<button
						class="flex min-h-11 items-center gap-2 rounded-full border border-black/10 px-3 text-sm font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100"
						type="button"
						aria-label={`Copy Team ${teamName(index)}`}
						onclick={() =>
							copy(formatTeam(players, team, index), `Team ${teamName(index)}`, team.id)}
					>
						<Icon icon={faCopy} size={16} />
						{copiedTeamId === team.id ? 'Copied!' : 'Copy'}
					</button>
				</header>

				<div class="grid gap-4 sm:grid-cols-3">
					{#each POSITIONS as position (position)}
						{@const assigned = assignedPlayers(team, position)}
						{#if assigned.length}
							<div class="flex min-w-0 flex-col gap-2">
								<h3 class="text-sm/5 font-bold">{POSITION_LABELS[position]}s</h3>
								<ul class="flex flex-col gap-1 text-sm/5 text-(--color-muted)">
									{#each assigned as player, playerIndex (player.id)}
										<li>
											<button
												class={[
													'flex min-h-11 w-full items-center rounded-lg px-3 text-left transition-[background-color,color,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100',
													selected?.playerId === player.id
														? 'bg-(--color-brand-soft) text-(--color-ink) hover:bg-(--color-brand-faint)'
														: 'bg-(--color-surface-muted) hover:bg-(--color-surface-strong)'
												]}
												type="button"
												aria-pressed={selected?.playerId === player.id}
												onclick={() => selectPlayer(team, player.id)}
											>
												<span class="flex min-w-0 items-center gap-2">
													<span class="truncate">{playerIndex + 1}. {player.name}</span>
													{#if player.checkedIn === true}
														<span class="shrink-0" role="img" aria-label="Checked in">
															<Icon icon={faCircleCheck} size={16} colour="var(--color-brand)" />
														</span>
													{/if}
												</span>
											</button>
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					{/each}
				</div>
			</section>
		{/each}
	</div>
</div>

<script lang="ts">
	import { POSITION_LABELS, POSITIONS } from '$lib/players';
	import { formatFormation, getCoverageWarnings, swapPlayers, teamName } from '$lib/teams';
	import type { Player, Position } from '$lib/types/players.types';
	import type { GeneratedResult, GeneratedTeam } from '$lib/types/teams.types';

	let {
		players,
		generated,
		onGenerate,
		onSwap
	}: {
		players: Player[];
		generated: GeneratedResult;
		onGenerate: () => void;
		onSwap: (teams: GeneratedTeam[]) => void;
	} = $props();

	const playersById = $derived(new Map(players.map((player) => [player.id, player])));
	const warnings = $derived(getCoverageWarnings(players, generated.teams));
	let selected = $state<{ teamId: string; playerId: string }>();
	let swapMessage = $state('');

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
</script>

<div class="flex flex-col gap-6">
	<header class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-2">
			<h1 class="text-2xl/8 font-medium">Generated teams</h1>
			<p class="text-base/6 text-(--color-muted)">Every player has been assigned once.</p>
		</div>
		<button
			class="min-h-11 rounded-lg bg-(--color-brand) px-4 py-2.5 font-medium text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand)"
			type="button"
			onclick={onGenerate}>Generate another</button
		>
	</header>

	<p class="text-sm/5 text-(--color-muted)">Tap two players from different teams to swap them.</p>
	{#if swapMessage}
		<p class="text-sm/5" aria-live="polite">{swapMessage}</p>
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

	<div class="grid gap-4 sm:grid-cols-2">
		{#each generated.teams as team, index (team.id)}
			<section
				class="flex flex-col gap-4 rounded-2xl bg-(--color-surface) p-4"
				aria-labelledby={`team-${team.id}`}
			>
				<header class="flex items-start justify-between gap-3">
					<div class="flex flex-col gap-1">
						<h2 id={`team-${team.id}`} class="text-xl/6 font-medium">Team {teamName(index)}</h2>
						<p class="text-sm/5 text-(--color-muted)">{formatFormation(team)}</p>
					</div>
					<span
						class="rounded-full bg-(--color-brand-soft) px-2 py-1 text-xs/4 font-bold tabular-nums"
						>{team.players.length}</span
					>
				</header>

				{#each POSITIONS as position (position)}
					{@const assigned = assignedPlayers(team, position)}
					{#if assigned.length}
						<div class="flex flex-col gap-1">
							<h3 class="text-sm/5 font-bold">{POSITION_LABELS[position]}s</h3>
							<ul class="flex flex-col gap-1 text-sm/5 text-(--color-muted)">
								{#each assigned as player, playerIndex (player.id)}
									<li>
										<button
											class={[
												'flex min-h-11 w-full items-center rounded-lg px-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand)',
												selected?.playerId === player.id
													? 'bg-(--color-brand-soft) text-(--color-ink)'
													: 'bg-(--color-surface-muted)'
											]}
											type="button"
											aria-pressed={selected?.playerId === player.id}
											onclick={() => selectPlayer(team, player.id)}
											>{playerIndex + 1}. {player.name}</button
										>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				{/each}
			</section>
		{/each}
	</div>
</div>

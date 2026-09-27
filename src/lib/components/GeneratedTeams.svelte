<script lang="ts">
	import { faCircleCheck, faCopy } from '@fortawesome/free-regular-svg-icons';
	import { toast } from 'svelte-sonner';
	import Icon from '$lib/components/Icon.svelte';
	import { confirmAction } from '$lib/notify';
	import { POSITION_LABELS } from '$lib/players';
	import { formatTeam } from '$lib/sharing';
	import { formatFormation, getCoverageWarnings, swapPlayers, teamName } from '$lib/teams';
	import type { Player, Position } from '$lib/types/players.types';
	import type { GeneratedResult, GeneratedTeam } from '$lib/types/teams.types';

	let {
		players,
		generated,
		onSwap
	}: {
		players: Player[];
		generated: GeneratedResult;
		onSwap: (teams: GeneratedTeam[]) => void;
	} = $props();

	const playersById = $derived(new Map(players.map((player) => [player.id, player])));
	const rosterNumbers = $derived(new Map(players.map((player, index) => [player.id, index + 1])));

	// Attack faces up the pitch, so forwards sit at the top and defenders near the goal.
	const PITCH_ROWS = ['FORWARD', 'MIDFIELDER', 'DEFENDER'] as const satisfies readonly Position[];

	const MARKER_STYLES: Record<Position, string> = {
		DEFENDER: 'border-defender',
		MIDFIELDER: 'border-midfielder',
		FORWARD: 'border-forward'
	};

	function initials(name: string): string {
		return name
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part.charAt(0).toUpperCase())
			.join('');
	}
	const warnings = $derived(getCoverageWarnings(players, generated.teams));
	let selected = $state<{ teamId: string; playerId: string }>();
	let swapMessage = $state('');

	function assignedPlayers(team: GeneratedTeam, position: Position): Player[] {
		return team.players
			.filter((assigned) => assigned.assignedPosition === position)
			.map((assigned) => playersById.get(assigned.playerId)!);
	}

	async function selectPlayer(team: GeneratedTeam, playerId: string) {
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
			toast.error('Those players cannot be swapped.', { description: result.issues.join(' ') });
			return;
		}
		if (
			result.addedWarnings.length &&
			!(await confirmAction({
				title: 'Apply this swap?',
				description: result.addedWarnings.join(' '),
				actionLabel: 'Swap anyway'
			}))
		) {
			return;
		}
		onSwap(result.teams);
		selected = undefined;
		swapMessage = '';
		toast.success('Swapped players.');
	}

	async function copy(text: string, label: string) {
		try {
			await navigator.clipboard.writeText(text);
			toast.success(`${label} copied.`);
		} catch {
			toast.error(`${label} could not be copied.`, {
				description: 'Select and copy the team text manually.'
			});
		}
	}
</script>

<div class="flex flex-col gap-4">
	<section class="grid grid-cols-2 gap-3 sm:gap-4" aria-label="Generated team summary">
		<div class="flex flex-col gap-1 rounded-2xl bg-surface p-4">
			<span class="text-2xl/8 font-medium tabular-nums">{generated.teams.length}</span>
			<span class="text-sm/5 text-muted">
				{generated.teams.length === 1 ? 'Team' : 'Teams'}
			</span>
		</div>
		<div class="flex flex-col gap-1 rounded-2xl bg-surface p-4">
			<span class="text-2xl/8 font-medium tabular-nums">{players.length}</span>
			<span class="text-sm/5 text-muted">
				{players.length === 1 ? 'Player' : 'Players'}
			</span>
		</div>
	</section>

	<section class="rounded-2xl bg-surface p-4" aria-labelledby="swap-heading">
		<h2 id="swap-heading" class="font-medium">Swap players</h2>
		<p class="mt-1 text-sm/5 text-pretty text-muted" aria-live="polite">
			{swapMessage || 'Select a player, then select someone on another team.'}
		</p>
	</section>

	{#if warnings.length}
		<aside
			class="flex flex-col gap-2 rounded-xl bg-warning-soft p-4 text-sm/5"
			aria-label="Coverage warnings"
		>
			<p class="font-medium">Coverage warnings</p>
			<ul class="flex flex-col gap-1 text-muted">
				{#each warnings as warning (warning)}
					<li>{warning}</li>
				{/each}
			</ul>
		</aside>
	{/if}

	<div class="grid gap-4 sm:grid-cols-2">
		{#each generated.teams as team, index (team.id)}
			<section
				class="flex flex-col overflow-hidden rounded-2xl bg-surface"
				aria-labelledby={`team-${team.id}`}
			>
				<header class="flex items-center justify-between gap-3 p-3 sm:p-4">
					<div class="flex min-w-0 items-center gap-3">
						<div class="flex min-w-0 flex-col">
							<h2 id={`team-${team.id}`} class="text-lg/6 font-medium">
								Team {teamName(index)}
							</h2>
							<p class="text-sm/5 text-muted tabular-nums">
								{team.players.length} players · {formatFormation(team)}
							</p>
						</div>
					</div>
					<button
						class="flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-black/10 px-3 text-sm font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100"
						type="button"
						aria-label={`Copy Team ${teamName(index)}`}
						onclick={() => copy(formatTeam(players, team, index), `Team ${teamName(index)}`)}
					>
						<Icon icon={faCopy} size={16} />
						Copy
					</button>
				</header>

				<div
					class="relative mx-3 mb-3 overflow-hidden rounded-xl border-2 border-black/10 bg-brand-faint bg-[repeating-linear-gradient(180deg,transparent_0_2.5rem,rgb(0_0_0/2.5%)_2.5rem_5rem)] sm:mx-4 sm:mb-4"
				>
					<div class="pointer-events-none absolute inset-0" aria-hidden="true">
						<span
							class="absolute -top-12 left-1/2 size-24 -translate-x-1/2 rounded-full border-2 border-black/10"
						></span>
						<span
							class="absolute bottom-0 left-1/2 h-16 w-1/2 -translate-x-1/2 border-2 border-b-0 border-black/10"
						></span>
						<span
							class="absolute bottom-0 left-1/2 h-7 w-1/4 -translate-x-1/2 border-2 border-b-0 border-black/10"
						></span>
						<span class="absolute -bottom-3 -left-3 size-6 rounded-full border-2 border-black/10"
						></span>
						<span class="absolute -right-3 -bottom-3 size-6 rounded-full border-2 border-black/10"
						></span>
					</div>

					<div class="relative flex flex-col gap-5 px-1 pt-8 pb-20">
						{#each PITCH_ROWS as position (position)}
							{@const assigned = assignedPlayers(team, position)}
							{#if assigned.length}
								<ul class="flex justify-evenly" aria-label={`${POSITION_LABELS[position]}s`}>
									{#each assigned as player (player.id)}
										{@const isSelected = selected?.playerId === player.id}
										<li class="flex min-w-0 flex-1 basis-0 justify-center">
											<button
												class="flex w-full max-w-24 min-w-0 flex-col items-center gap-1.5 rounded-xl p-1 transition-transform duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100"
												type="button"
												aria-label={player.name}
												aria-pressed={isSelected}
												onclick={() => selectPlayer(team, player.id)}
											>
												<span class="relative">
													<span
														class={[
															'grid size-12 place-items-center rounded-full border-[3px] text-sm font-bold transition-[background-color,color] duration-150 ease-out',
															MARKER_STYLES[position],
															isSelected ? 'bg-ink text-white' : 'bg-surface text-ink'
														]}
														aria-hidden="true">{initials(player.name)}</span
													>
													<span
														class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-sm bg-ink px-1.5 text-[0.625rem]/4 font-bold text-white"
														aria-hidden="true">{POSITION_LABELS[position].charAt(0)}</span
													>
													{#if player.checkedIn === true}
														<span
															class="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-surface text-brand-strong"
															role="img"
															aria-label="Checked in"
														>
															<Icon icon={faCircleCheck} size={16} />
														</span>
													{/if}
												</span>
												<span
													class="flex max-w-full items-baseline gap-1 text-xs/4"
													aria-hidden="true"
												>
													<span class="font-medium text-muted tabular-nums"
														>{rosterNumbers.get(player.id)}</span
													>
													<span class="truncate font-bold">{player.name}</span>
												</span>
											</button>
										</li>
									{/each}
								</ul>
							{/if}
						{/each}
					</div>
				</div>
			</section>
		{/each}
	</div>
</div>

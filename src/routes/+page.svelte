<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import AddPlayersDialog from '$lib/components/AddPlayersDialog.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import GeneratedTeams from '$lib/components/GeneratedTeams.svelte';
	import PlayerRoster from '$lib/components/PlayerRoster.svelte';
	import TeamSetup from '$lib/components/TeamSetup.svelte';
	import WorkflowNav from '$lib/components/WorkflowNav.svelte';
	import { confirmAction } from '$lib/notify';
	import { getRosterIssues } from '$lib/players';
	import { formatTeams } from '$lib/sharing';
	import { emptyWorkspace, loadWorkspace, saveWorkspace } from '$lib/storage';
	import { generateTeams, getTeamCountForTargetSize } from '$lib/teams';
	import type { Player } from '$lib/types/players.types';
	import type { Workspace } from '$lib/types/storage.types';
	import type { GeneratedTeam } from '$lib/types/teams.types';

	let workspace = $state<Workspace>(emptyWorkspace());
	// Setup and Teams can be opened before they have data. Those empty views are not saved,
	// so a reload returns to the last real step.
	let emptyView = $state<'setup' | 'teams'>();
	let canShare = $state(false);
	const screen = $derived(emptyView ?? workspace.screen);
	const rosterIssues = $derived(getRosterIssues(workspace.roster));
	const rosterReady = $derived(rosterIssues.length === 0);
	const hasCheckIns = $derived(workspace.roster.some((player) => player.checkedIn === true));
	const showPlayerActions = $derived(screen === 'players' && workspace.roster.length > 0);
	const showSetupActions = $derived(screen === 'setup' && !emptyView);
	const showTeamsActions = $derived(screen === 'teams' && !emptyView);
	const primaryButton =
		'min-h-12 w-full rounded-full bg-brand px-4 py-2.5 font-medium text-ink transition-[background-color,transform] duration-150 ease-out hover:bg-brand/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100';
	const discardTeams = {
		title: 'Discard generated teams?',
		description: 'This change clears the teams you generated.',
		actionLabel: 'Discard teams'
	};

	onMount(() => {
		const loaded = loadWorkspace(localStorage);
		workspace = loaded.workspace;
		if (loaded.error) toast.error(loaded.error);
		canShare = typeof navigator.share === 'function';
	});

	// Returns false when the change waits for confirmation, so edited inputs can revert until then.
	function commitRoster(roster: Player[]) {
		const save = () => saveWorkspaceState({ schemaVersion: 1, screen: 'players', roster });
		if (!workspace.generated) {
			save();
			return true;
		}
		confirmAction(discardTeams).then((confirmed) => confirmed && save());
		return false;
	}

	function saveWorkspaceState(next: Workspace) {
		emptyView = undefined;
		workspace = next;
		if (!saveWorkspace(localStorage, workspace)) {
			toast.error('Changes could not be saved on this device.');
		}
	}

	function updatePlayer(
		id: string,
		update: Partial<Pick<Player, 'name' | 'eligiblePositions'>>
	): boolean {
		return commitRoster(
			workspace.roster.map((player) => (player.id === id ? { ...player, ...update } : player))
		);
	}

	async function updateCheckIn(id: string) {
		if (workspace.generated && !(await confirmAction(discardTeams))) return;

		saveWorkspaceState({
			...workspace,
			screen: 'players',
			generated: undefined,
			roster: workspace.roster.map((player) =>
				player.id === id ? { ...player, checkedIn: player.checkedIn !== true } : player
			)
		});
	}

	async function clearCheckIns() {
		if (!workspace.roster.some((player) => player.checkedIn === true)) return;
		if (workspace.generated && !(await confirmAction(discardTeams))) return;

		saveWorkspaceState({
			...workspace,
			screen: 'players',
			generated: undefined,
			roster: workspace.roster.map((player) => ({ ...player, checkedIn: false }))
		});
	}

	function openSetup() {
		if (!rosterReady) {
			emptyView = 'setup';
			return;
		}
		saveWorkspaceState({ ...workspace, screen: 'setup' });
	}

	function openPlayers() {
		saveWorkspaceState({ ...workspace, screen: 'players' });
	}

	function chooseTeamSize(teamSize: number) {
		const teamCount = getTeamCountForTargetSize(workspace.roster.length, teamSize);
		if (!teamCount) return;
		if (workspace.teamSize === teamSize) return;
		saveWorkspaceState({
			schemaVersion: 1,
			screen: 'setup',
			roster: workspace.roster,
			teamSize,
			teamCount
		});
	}

	function openTeams() {
		if (!workspace.generated) {
			emptyView = 'teams';
			return;
		}
		saveWorkspaceState({ ...workspace, screen: 'teams' });
	}

	function generate() {
		if (!workspace.teamCount) return;
		const result = generateTeams({
			players: workspace.roster,
			teamCount: workspace.teamCount,
			seed: crypto.randomUUID()
		});
		if (!result.ok) {
			toast.error('Teams could not be generated.', { description: result.issues.join(' ') });
			return;
		}

		saveWorkspaceState({
			...workspace,
			screen: 'teams',
			generated: { seed: result.seed, teams: result.teams }
		});
	}

	function saveSwap(teams: GeneratedTeam[]) {
		if (!workspace.generated) return;
		saveWorkspaceState({ ...workspace, generated: { ...workspace.generated, teams } });
	}

	async function copyAllTeams() {
		if (!workspace.generated) return;
		try {
			await navigator.clipboard.writeText(formatTeams(workspace.roster, workspace.generated.teams));
			toast.success('All teams copied.');
		} catch {
			toast.error('Copy failed.', { description: 'Select and copy the team text manually.' });
		}
	}

	async function shareTeams() {
		if (!workspace.generated) return;
		try {
			await navigator.share({ text: formatTeams(workspace.roster, workspace.generated.teams) });
		} catch {
			return;
		}
	}
</script>

<svelte:head>
	<title
		>{screen === 'players' ? 'Players' : screen === 'setup' ? 'Team setup' : 'Teams'} · QTeam</title
	>
	<meta
		name="description"
		content="Add or import outfield football players and their eligible positions."
	/>
</svelte:head>

{#snippet emptyPitch()}
	<div
		class="relative flex w-40 flex-col gap-3 overflow-hidden rounded-xl border-2 border-black/10 bg-brand-faint px-2 pt-5 pb-9"
	>
		<span
			class="absolute -top-6 left-1/2 size-12 -translate-x-1/2 rounded-full border-2 border-black/10"
		></span>
		<span
			class="absolute bottom-0 left-1/2 h-6 w-1/2 -translate-x-1/2 border-2 border-b-0 border-black/10"
		></span>
		{#each [2, 3, 3] as count, row (row)}
			<span class="flex justify-evenly">
				{#each { length: count }, dot (dot)}
					<span class="size-4 rounded-full bg-black/10"></span>
				{/each}
			</span>
		{/each}
	</div>
{/snippet}

<div class="flex h-full min-h-0 flex-col">
	<div class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
		<div class="mx-auto flex w-full max-w-page flex-col gap-4 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
			{#if screen === 'players'}
				<section aria-label="Add players">
					<AddPlayersDialog
						rosterSize={workspace.roster.length}
						onAdd={(players) => commitRoster([...workspace.roster, ...players])}
					/>
				</section>

				<PlayerRoster
					players={workspace.roster}
					onUpdate={updatePlayer}
					onCheckIn={updateCheckIn}
					onRemove={(id) => commitRoster(workspace.roster.filter((player) => player.id !== id))}
				/>
			{:else if emptyView === 'setup'}
				<EmptyState
					title="Not enough players yet"
					description={`${rosterIssues.join(' ')} Then choose a team size here.`}
					art={emptyPitch}
				>
					{#snippet actions()}
						<button class={primaryButton} type="button" onclick={openPlayers}>Go to players</button>
					{/snippet}
				</EmptyState>
			{:else if emptyView === 'teams'}
				<EmptyState
					title="No teams yet"
					description={!rosterReady
						? `${rosterIssues.join(' ')} Then choose a team size and generate teams.`
						: workspace.teamCount
							? 'Your team size is set. Generate teams to see them here.'
							: 'Choose a team size, then generate teams to see them here.'}
					art={emptyPitch}
				>
					{#snippet actions()}
						{#if !rosterReady}
							<button class={primaryButton} type="button" onclick={openPlayers}
								>Go to players</button
							>
						{:else if workspace.teamCount}
							<button class={primaryButton} type="button" onclick={generate}>Generate teams</button>
						{:else}
							<button class={primaryButton} type="button" onclick={openSetup}>
								Choose a team size
							</button>
						{/if}
					{/snippet}
				</EmptyState>
			{:else if screen === 'setup'}
				<TeamSetup
					playerCount={workspace.roster.length}
					teamSize={workspace.teamSize}
					onChoose={chooseTeamSize}
				/>
			{:else}
				<GeneratedTeams
					players={workspace.roster}
					generated={workspace.generated!}
					onSwap={saveSwap}
				/>
			{/if}
		</div>
	</div>

	<div
		class={[
			'z-10 shrink-0 overflow-hidden transition-[max-height,opacity,transform] duration-150 ease-out motion-reduce:transition-none',
			showPlayerActions
				? 'max-h-24 translate-y-0 opacity-100'
				: 'pointer-events-none max-h-0 translate-y-full opacity-0'
		]}
		aria-hidden={!showPlayerActions}
	>
		<div
			class="mx-auto grid w-full max-w-page grid-cols-2 gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8"
		>
			<button
				class="min-h-12 rounded-full border border-black/10 bg-surface px-3 py-2 text-sm/5 font-medium whitespace-nowrap transition-[background-color,transform] duration-150 ease-out hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-disabled disabled:hover:bg-surface-muted disabled:active:scale-100 motion-reduce:active:scale-100 sm:px-4 sm:text-base/6"
				type="button"
				disabled={!showPlayerActions || !hasCheckIns}
				onclick={clearCheckIns}>Clear check-ins</button
			>
			<button
				class="min-h-12 rounded-full bg-brand px-3 py-2 text-sm/5 font-medium whitespace-nowrap text-ink transition-[background-color,box-shadow,transform] duration-150 ease-out hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] disabled:cursor-not-allowed disabled:bg-surface-strong disabled:text-disabled disabled:hover:shadow-none disabled:active:scale-100 motion-reduce:active:scale-100 sm:px-4 sm:text-base/6"
				type="button"
				disabled={!showPlayerActions || !rosterReady}
				onclick={openSetup}>Continue</button
			>
		</div>
	</div>

	<div
		class={[
			'z-10 shrink-0 overflow-hidden transition-[max-height,opacity,transform] duration-150 ease-out motion-reduce:transition-none',
			showSetupActions
				? 'max-h-24 translate-y-0 opacity-100'
				: 'pointer-events-none max-h-0 translate-y-full opacity-0'
		]}
		aria-hidden={!showSetupActions}
	>
		<div class="mx-auto w-full max-w-page px-4 py-3 sm:px-6 lg:px-8">
			<button
				class="min-h-12 w-full rounded-full bg-brand px-4 py-2.5 font-medium text-ink transition-[background-color,box-shadow,transform] duration-150 ease-out hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] disabled:cursor-not-allowed disabled:bg-surface-strong disabled:text-disabled disabled:hover:shadow-none disabled:active:scale-100 motion-reduce:active:scale-100"
				type="button"
				disabled={!showSetupActions || !workspace.teamSize || !workspace.teamCount}
				onclick={generate}>Generate teams</button
			>
		</div>
	</div>

	<div
		class={[
			'z-10 shrink-0 overflow-hidden transition-[max-height,opacity,transform] duration-150 ease-out motion-reduce:transition-none',
			showTeamsActions
				? 'max-h-24 translate-y-0 opacity-100'
				: 'pointer-events-none max-h-0 translate-y-full opacity-0'
		]}
		aria-hidden={!showTeamsActions}
	>
		<div
			class={[
				'mx-auto grid w-full max-w-page gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8',
				canShare ? 'grid-cols-3' : 'grid-cols-2'
			]}
		>
			<button
				class="flex min-h-12 items-center justify-center rounded-full border border-black/10 bg-surface px-2 py-2 text-sm/5 font-medium whitespace-nowrap transition-[background-color,transform] duration-150 ease-out hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] disabled:pointer-events-none motion-reduce:active:scale-100 sm:px-4 sm:text-base/6"
				type="button"
				disabled={!showTeamsActions}
				onclick={copyAllTeams}
			>
				Copy all
			</button>
			{#if canShare}
				<button
					class="flex min-h-12 items-center justify-center rounded-full border border-black/10 bg-surface px-2 py-2 text-sm/5 font-medium whitespace-nowrap transition-[background-color,transform] duration-150 ease-out hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] disabled:pointer-events-none motion-reduce:active:scale-100 sm:px-4 sm:text-base/6"
					type="button"
					disabled={!showTeamsActions}
					onclick={shareTeams}
				>
					Share
				</button>
			{/if}
			<button
				class="flex min-h-12 items-center justify-center rounded-full bg-brand px-2 py-2 text-sm/5 font-medium whitespace-nowrap text-ink transition-[box-shadow,transform] duration-150 ease-out hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] disabled:pointer-events-none motion-reduce:active:scale-100 sm:px-4 sm:text-base/6"
				type="button"
				disabled={!showTeamsActions}
				onclick={generate}
			>
				Generate
			</button>
		</div>
	</div>

	<WorkflowNav {screen} onPlayers={openPlayers} onSetup={openSetup} onTeams={openTeams} />
</div>

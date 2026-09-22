<script lang="ts">
	import { onMount } from 'svelte';
	import AddPlayersDialog from '$lib/components/AddPlayersDialog.svelte';
	import GeneratedTeams from '$lib/components/GeneratedTeams.svelte';
	import PlayerRoster from '$lib/components/PlayerRoster.svelte';
	import TeamSetup from '$lib/components/TeamSetup.svelte';
	import WorkflowNav from '$lib/components/WorkflowNav.svelte';
	import { getRosterIssues } from '$lib/players';
	import { emptyWorkspace, loadWorkspace, saveWorkspace } from '$lib/storage';
	import { generateTeams, isValidTeamCount } from '$lib/teams';
	import type { Player } from '$lib/types/players.types';
	import type { Workspace } from '$lib/types/storage.types';
	import type { GeneratedTeam } from '$lib/types/teams.types';

	let workspace = $state<Workspace>(emptyWorkspace());
	let storageMessage = $state('');
	const rosterReady = $derived(getRosterIssues(workspace.roster).length === 0);

	onMount(() => {
		const loaded = loadWorkspace(localStorage);
		workspace = loaded.workspace;
		storageMessage = loaded.error ?? '';
	});

	function commitRoster(roster: Player[]) {
		if (workspace.generated && !confirm('Changing the roster discards generated teams. Continue?'))
			return false;
		saveWorkspaceState({ schemaVersion: 1, screen: 'players', roster });
		return true;
	}

	function saveWorkspaceState(next: Workspace) {
		workspace = next;
		if (!saveWorkspace(localStorage, workspace)) {
			storageMessage = 'Changes could not be saved on this device.';
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

	function updateCheckIn(id: string) {
		if (workspace.generated && !confirm('Changing check-ins discards generated teams. Continue?'))
			return;

		saveWorkspaceState({
			...workspace,
			screen: 'players',
			generated: undefined,
			roster: workspace.roster.map((player) =>
				player.id === id ? { ...player, checkedIn: player.checkedIn !== true } : player
			)
		});
	}

	function clearCheckIns() {
		if (!workspace.roster.some((player) => player.checkedIn === true)) return;
		if (workspace.generated && !confirm('Changing check-ins discards generated teams. Continue?'))
			return;

		saveWorkspaceState({
			...workspace,
			screen: 'players',
			generated: undefined,
			roster: workspace.roster.map((player) => ({ ...player, checkedIn: false }))
		});
	}

	function openSetup() {
		if (!rosterReady) return;
		saveWorkspaceState({ ...workspace, screen: 'setup' });
	}

	function openPlayers() {
		saveWorkspaceState({ ...workspace, screen: 'players' });
	}

	function chooseTeamCount(teamCount: number) {
		if (!isValidTeamCount(workspace.roster.length, teamCount)) return;
		if (workspace.teamCount === teamCount) return;
		saveWorkspaceState({ schemaVersion: 1, screen: 'setup', roster: workspace.roster, teamCount });
	}

	function openTeams() {
		if (!workspace.generated) return;
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
			storageMessage = result.issues.join(' ');
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
</script>

<svelte:head>
	<title
		>{workspace.screen === 'players'
			? 'Players'
			: workspace.screen === 'setup'
				? 'Team setup'
				: 'Teams'} · QTeam</title
	>
	<meta
		name="description"
		content="Add or import outfield football players and their eligible positions."
	/>
</svelte:head>

<div class="flex h-full min-h-0 flex-col">
	<div
		class="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto overscroll-y-contain px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
	>
		{#if storageMessage}
			<div
				class="flex items-start justify-between gap-4 rounded-xl bg-(--color-danger-soft) p-4 text-sm/5 text-(--color-danger)"
				role="alert"
			>
				<p>{storageMessage}</p>
				<button
					class="min-h-11 shrink-0 rounded-lg px-3 font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-danger-soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-danger) active:scale-[0.96] motion-reduce:active:scale-100"
					type="button"
					onclick={() => (storageMessage = '')}>Dismiss</button
				>
			</div>
		{/if}

		{#if workspace.screen === 'players'}
			<section class="border-b border-black/10 pb-8" aria-label="Add players">
				<AddPlayersDialog onAdd={(players) => commitRoster([...workspace.roster, ...players])} />
			</section>

			<PlayerRoster
				players={workspace.roster}
				onUpdate={updatePlayer}
				onCheckIn={updateCheckIn}
				onClearCheckIns={clearCheckIns}
				onRemove={(id) => commitRoster(workspace.roster.filter((player) => player.id !== id))}
				onContinue={openSetup}
			/>
		{:else if workspace.screen === 'setup'}
			<TeamSetup
				playerCount={workspace.roster.length}
				teamCount={workspace.teamCount}
				onChoose={chooseTeamCount}
				onGenerate={generate}
			/>
		{:else}
			<GeneratedTeams
				players={workspace.roster}
				generated={workspace.generated!}
				onGenerate={generate}
				onSwap={saveSwap}
			/>
		{/if}
	</div>

	<WorkflowNav
		screen={workspace.screen}
		canOpenSetup={rosterReady}
		canOpenTeams={Boolean(workspace.generated)}
		onPlayers={openPlayers}
		onSetup={openSetup}
		onTeams={openTeams}
	/>
</div>

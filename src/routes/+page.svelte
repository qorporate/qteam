<script lang="ts">
	import { onMount } from 'svelte';
	import AddPlayersDialog from '$lib/components/AddPlayersDialog.svelte';
	import GeneratedTeams from '$lib/components/GeneratedTeams.svelte';
	import PlayerRoster from '$lib/components/PlayerRoster.svelte';
	import TeamSetup from '$lib/components/TeamSetup.svelte';
	import WorkflowNav from '$lib/components/WorkflowNav.svelte';
	import { getRosterIssues } from '$lib/players';
	import { clearWorkspace, emptyWorkspace, loadWorkspace, saveWorkspace } from '$lib/storage';
	import { generateTeams, isValidTeamCount } from '$lib/teams';
	import type { Player } from '$lib/types/players.types';
	import type { Workspace } from '$lib/types/storage.types';
	import type { GeneratedTeam } from '$lib/types/teams.types';

	let workspace = $state<Workspace>(emptyWorkspace());
	let storageMessage = $state('');
	let formKey = $state(0);
	const rosterReady = $derived(getRosterIssues(workspace.roster).length === 0);

	onMount(() => {
		const loaded = loadWorkspace(localStorage);
		workspace = loaded.workspace;
		storageMessage = loaded.error ?? '';
	});

	function commitRoster(roster: Player[]) {
		if (workspace.generated && !confirm('Changing the roster discards generated teams. Continue?'))
			return;
		saveWorkspaceState({ schemaVersion: 1, screen: 'players', roster });
	}

	function saveWorkspaceState(next: Workspace) {
		workspace = next;
		if (!saveWorkspace(localStorage, workspace)) {
			storageMessage = 'Changes could not be saved on this device.';
		}
	}

	function updatePlayer(id: string, update: Partial<Pick<Player, 'name' | 'eligiblePositions'>>) {
		commitRoster(
			workspace.roster.map((player) => (player.id === id ? { ...player, ...update } : player))
		);
	}

	function startOver() {
		if (!confirm('Start over? This removes every player from the roster.')) return;
		if (!clearWorkspace(localStorage)) {
			storageMessage = 'The saved roster could not be cleared.';
			return;
		}

		workspace = emptyWorkspace();
		formKey++;
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

<div class="flex flex-col gap-8">
	<WorkflowNav
		screen={workspace.screen}
		canOpenSetup={rosterReady}
		canOpenTeams={Boolean(workspace.generated)}
		onPlayers={openPlayers}
		onSetup={openSetup}
		onTeams={openTeams}
	/>

	{#if storageMessage}
		<div
			class="flex items-start justify-between gap-4 rounded-xl bg-(--color-danger-soft) p-4 text-sm/5 text-(--color-danger)"
			role="alert"
		>
			<p>{storageMessage}</p>
			<button
				class="min-h-11 shrink-0 rounded-lg px-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-danger)"
				type="button"
				onclick={() => (storageMessage = '')}>Dismiss</button
			>
		</div>
	{/if}

	{#if workspace.screen === 'players'}
		<header class="flex flex-col gap-2">
			<h1 class="text-2xl/8 font-medium">Build your player list</h1>
			<p class="text-base/6 text-(--color-muted)">
				Add players and the positions they can play. QTeam will use them to create balanced teams.
			</p>
		</header>

		<aside
			class="flex flex-col gap-1 rounded-xl bg-(--color-warning-soft) p-4 text-sm/5"
			aria-label="Goalkeeper notice"
		>
			<p class="font-medium">Outfield players only</p>
			<p class="text-(--color-muted)">
				QTeam does not include goalkeepers. Add only outfield players.
			</p>
		</aside>

		{#key formKey}
			<AddPlayersDialog onAdd={(players) => commitRoster([...workspace.roster, ...players])} />
		{/key}

		<PlayerRoster
			players={workspace.roster}
			onUpdate={updatePlayer}
			onRemove={(id) => commitRoster(workspace.roster.filter((player) => player.id !== id))}
			onStartOver={startOver}
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

<script lang="ts">
	import { onMount } from 'svelte';
	import AddPlayersDialog from '$lib/components/AddPlayersDialog.svelte';
	import PlayerRoster from '$lib/components/PlayerRoster.svelte';
	import type { Player } from '$lib/players';
	import {
		clearWorkspace,
		emptyWorkspace,
		loadWorkspace,
		saveWorkspace,
		type Workspace
	} from '$lib/storage';

	let workspace = $state<Workspace>(emptyWorkspace());
	let storageMessage = $state('');
	let formKey = $state(0);

	onMount(() => {
		const loaded = loadWorkspace(localStorage);
		workspace = loaded.workspace;
		storageMessage = loaded.error ?? '';
	});

	function commitRoster(roster: Player[]) {
		workspace = { ...workspace, roster };
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
</script>

<svelte:head>
	<title>Players · QTeam</title>
	<meta
		name="description"
		content="Add or import outfield football players and their eligible positions."
	/>
</svelte:head>

<div class="flex flex-col gap-8">
	<header class="flex flex-col gap-2">
		<h1 class="text-2xl/8 font-medium">Build your player list</h1>
		<p class="text-base/6 text-(--color-muted)">
			Add players and the positions they can play. QTeam will use them to create balanced teams.
		</p>
	</header>

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
	/>
</div>

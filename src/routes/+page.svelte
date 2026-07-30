<svelte:head>
	<title>Players · QTeam</title>
	<meta
		name="description"
		content="Turn a list of outfield football players into positionally balanced teams."
	/>
</svelte:head>

<div class="flex flex-col gap-6">
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

	<section
		class="flex flex-col gap-4 rounded-2xl bg-(--color-surface) p-6"
		aria-labelledby="empty-roster"
	>
		<p class="text-[40px]/11 font-medium tabular-nums">0</p>
		<div class="flex flex-col gap-2">
			<h2 id="empty-roster" class="text-xl/6 font-medium">No players yet</h2>
			<p class="text-base/6 text-(--color-muted)">
				Add or import players to start building your roster.
			</p>
		</div>
	</section>
</div>

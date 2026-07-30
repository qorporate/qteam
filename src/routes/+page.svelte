<svelte:head>
	<title>Players · QTeam</title>
	<meta
		name="description"
		content="Turn a list of outfield football players into positionally balanced teams."
	/>
</svelte:head>

<header>
	<h1 class="text-2xl/8 font-medium">Build your player list</h1>
	<p class="mt-2 text-base/6 text-(--color-muted)">
		Add players and the positions they can play. QTeam will use them to create balanced teams.
	</p>
</header>

<aside
	class="mt-6 rounded-xl bg-(--color-warning-soft) p-4 text-sm/5"
	aria-label="Goalkeeper notice"
>
	<p class="font-medium">Outfield players only</p>
	<p class="mt-1 text-(--color-muted)">
		QTeam does not include goalkeepers. Add only outfield players.
	</p>
</aside>

<section class="mt-6 rounded-2xl bg-(--color-surface) p-6" aria-labelledby="empty-roster">
	<p class="text-[40px]/11 font-medium tabular-nums">0</p>
	<h2 id="empty-roster" class="mt-4 text-xl/6 font-medium">No players yet</h2>
	<p class="mt-2 text-base/6 text-(--color-muted)">
		Add or import players to start building your roster.
	</p>
</section>

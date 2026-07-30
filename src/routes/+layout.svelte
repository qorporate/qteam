<script lang="ts">
	import './layout.css';
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#f7f7f7" />
</svelte:head>

<div class="flex min-h-screen flex-col bg-(--color-canvas) text-(--color-ink)">
	<header class="border-b border-black/10 bg-(--color-surface)">
		<div class="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6 lg:px-8">
			<a
				class="flex min-h-11 items-center gap-2 rounded-lg font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand)"
				href={resolve('/')}
				aria-label="QTeam home"
			>
				<span
					class="grid size-9 place-items-center rounded-lg bg-(--color-brand) text-lg"
					aria-hidden="true">Q</span
				>
				<span class="text-xl">QTeam</span>
			</a>
		</div>
	</header>

	<nav class="border-b border-black/10 bg-(--color-surface)" aria-label="Team creation">
		<ol class="mx-auto flex max-w-3xl gap-6 px-4 sm:px-6 lg:px-8">
			<li>
				<a
					class="flex min-h-11 items-center border-b-2 border-(--color-brand) text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand)"
					href={resolve('/')}
					aria-current="page">Players</a
				>
			</li>
			<li>
				<span
					class="flex min-h-11 items-center text-sm text-(--color-disabled)"
					aria-disabled="true">Team setup</span
				>
			</li>
			<li>
				<span
					class="flex min-h-11 items-center text-sm text-(--color-disabled)"
					aria-disabled="true">Teams</span
				>
			</li>
		</ol>
	</nav>

	<main class="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
		{@render children()}
	</main>
</div>

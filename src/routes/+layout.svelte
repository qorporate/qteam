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
	<header class="flex justify-center border-b border-black/10 bg-(--color-surface)">
		<div class="flex h-16 w-full max-w-3xl items-center px-4 sm:px-6 lg:px-8">
			<a
				class="flex min-h-11 items-center gap-2 rounded-lg font-bold transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100"
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

	<main class="w-full max-w-3xl flex-1 self-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
		{@render children()}
	</main>
</div>

<script lang="ts">
	import './layout.css';
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';
	import { clearWorkspace } from '$lib/storage';

	let { children } = $props();

	function reset() {
		if (!confirm('Reset QTeam? This removes every player from the roster.')) return;
		if (!clearWorkspace(localStorage)) {
			alert('The saved roster could not be cleared.');
			return;
		}

		location.reload();
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#f7f7f7" />
</svelte:head>

<div
	class="flex h-dvh min-h-dvh w-screen flex-col overflow-hidden bg-(--color-canvas) text-(--color-ink)"
>
	<header
		class="sticky top-0 z-10 flex shrink-0 justify-center border-b border-black/10 bg-(--color-surface) pt-[env(safe-area-inset-top)]"
	>
		<div class="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
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
			<button
				class="min-h-11 rounded-full border border-(--color-danger) bg-(--color-danger-soft) px-5 py-2 font-medium text-(--color-danger) transition-[background-color,color,transform] duration-150 ease-out hover:bg-(--color-danger) hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-danger) active:scale-[0.96] motion-reduce:active:scale-100"
				type="button"
				onclick={reset}>Reset</button
			>
		</div>
	</header>

	<main class="min-h-0 w-full flex-1">
		{@render children()}
	</main>
</div>

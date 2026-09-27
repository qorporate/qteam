<script lang="ts">
	import './layout.css';
	import { Toaster, toast } from 'svelte-sonner';
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';
	import logo from '$lib/assets/logo.svg';
	import { confirmAction } from '$lib/notify';
	import { clearWorkspace } from '$lib/storage';

	let { children } = $props();

	async function reset() {
		const confirmed = await confirmAction({
			title: 'Reset QTeam?',
			description: 'This removes every player and any generated teams.',
			actionLabel: 'Reset',
			destructive: true
		});
		if (!confirmed) return;
		if (!clearWorkspace(localStorage)) {
			toast.error('The saved roster could not be cleared.');
			return;
		}

		location.reload();
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#f7f7f7" />
</svelte:head>

<Toaster
	position="top-center"
	toastOptions={{
		unstyled: true,
		classes: {
			toast:
				'flex w-full flex-wrap items-center gap-x-3 gap-y-3 rounded-2xl bg-surface p-4 text-sm/5 text-ink shadow-overlay',
			content: 'flex min-w-0 flex-1 flex-col gap-0.5',
			title: 'font-medium',
			description: 'text-muted',
			icon: 'shrink-0',
			success: '[&_[data-icon]]:text-brand-strong',
			error: '[&_[data-icon]]:text-danger',
			actionButton:
				'min-h-11 rounded-full bg-ink px-4 font-medium text-white transition-[background-color,transform] duration-150 ease-out hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100',
			cancelButton:
				'min-h-11 rounded-full bg-surface-muted px-4 font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-surface-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100'
		}
	}}
/>

<div class="flex h-dvh w-full flex-col overflow-hidden bg-canvas text-ink">
	<header class="sticky top-0 z-10 shrink-0 pt-[env(safe-area-inset-top)]">
		<div class="mx-auto w-full max-w-page px-4 pt-2 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between gap-4 rounded-2xl bg-surface px-3">
				<a
					class="flex min-h-11 items-center gap-2 rounded-lg font-bold transition-[background-color,transform] duration-150 ease-out hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100"
					href={resolve('/')}
					aria-label="QTeam home"
				>
					<img class="size-9" src={logo} alt="" />
					<span class="text-xl">QTeam</span>
				</a>
				<button
					class="min-h-11 rounded-full border border-danger bg-danger-soft px-5 py-2 font-medium text-danger transition-[background-color,color,transform] duration-150 ease-out hover:bg-danger hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger active:scale-[0.96] motion-reduce:active:scale-100"
					type="button"
					onclick={reset}>Reset</button
				>
			</div>
		</div>
	</header>

	<main class="min-h-0 w-full flex-1">
		{@render children()}
	</main>
</div>

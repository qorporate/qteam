<script lang="ts">
	import ManualPlayerForm from '$lib/components/ManualPlayerForm.svelte';
	import PlayerImport from '$lib/components/PlayerImport.svelte';
	import type { Player } from '$lib/types/players.types';

	let { onAdd }: { onAdd: (players: Player[]) => void } = $props();
	let dialog: HTMLDialogElement;
	let mode = $state<'import' | 'manual'>('import');

	function open(nextMode: 'import' | 'manual') {
		mode = nextMode;
		dialog.showModal();
	}

	function close() {
		dialog.close();
	}
</script>

<div class="grid grid-cols-2 gap-3 sm:gap-4">
	<button
		class="flex min-h-14 items-center justify-center gap-2 rounded-full border border-black/15 bg-(--color-surface) px-3 py-2.5 font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100 sm:px-4"
		type="button"
		onclick={() => open('import')}
	>
		<svg
			class="size-5 shrink-0"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<path d="M12 16V4m0 0L7 9m5-5 5 5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
		</svg>
		Import players
	</button>
	<button
		class="flex min-h-14 items-center justify-center gap-2 rounded-full border border-black/15 bg-(--color-surface) px-3 py-2.5 font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100 sm:px-4"
		type="button"
		onclick={() => open('manual')}
	>
		<svg
			class="size-5 shrink-0"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<path d="M12 5v14M5 12h14" />
		</svg>
		Add manually
	</button>
</div>

<dialog
	bind:this={dialog}
	class="m-auto w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-2xl border-0 bg-(--color-surface) p-0 text-(--color-ink) shadow-(--shadow-overlay) backdrop:bg-black/70"
	aria-labelledby="add-players-heading"
>
	<div class="flex max-h-[calc(100dvh-2rem)] flex-col">
		<header class="flex items-center justify-between gap-4 p-4 sm:p-6">
			<h2 id="add-players-heading" class="text-2xl/8 font-medium text-balance">
				{mode === 'import' ? 'Import players' : 'Add manually'}
			</h2>
			<button
				class="grid size-11 shrink-0 place-items-center rounded-lg bg-(--color-surface-muted) transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-surface-strong) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100"
				type="button"
				aria-label="Close"
				title="Close"
				onclick={close}
			>
				<svg
					class="size-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<path d="m6 6 12 12M18 6 6 18" />
				</svg>
			</button>
		</header>

		<div class="flex flex-col gap-5 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6">
			{#if mode === 'import'}
				<PlayerImport {onAdd} onComplete={close} showHeader={false} />
			{:else}
				<ManualPlayerForm onAdd={(player) => onAdd([player])} onComplete={close} />
			{/if}
		</div>
	</div>
</dialog>

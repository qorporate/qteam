<script lang="ts">
	import ManualPlayerForm from '$lib/components/ManualPlayerForm.svelte';
	import PlayerImport from '$lib/components/PlayerImport.svelte';
	import type { Player } from '$lib/types/players.types';

	let { onAdd }: { onAdd: (players: Player[]) => void } = $props();
	let dialog: HTMLDialogElement;

	function open() {
		dialog.showModal();
	}

	function close() {
		dialog.close();
	}
</script>

<button
	class="flex min-h-11 items-center gap-2 self-start rounded-lg bg-(--color-brand) px-4 py-2.5 font-medium text-(--color-ink) transition-[box-shadow,transform] duration-150 ease-out hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100"
	type="button"
	onclick={open}
>
	<svg
		class="size-5"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		aria-hidden="true"
	>
		<path d="M12 5v14M5 12h14" />
	</svg>
	Add players
</button>

<dialog
	bind:this={dialog}
	class="m-auto w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-2xl border-0 bg-(--color-surface) p-0 text-(--color-ink) shadow-(--shadow-overlay) backdrop:bg-black/70"
	aria-labelledby="add-players-heading"
>
	<div class="flex max-h-[calc(100dvh-2rem)] flex-col">
		<header class="flex items-center justify-between gap-4 p-4 sm:p-6">
			<h2 id="add-players-heading" class="text-2xl/8 font-medium text-balance">Add players</h2>
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
			<PlayerImport {onAdd} onComplete={close} />
			<ManualPlayerForm onAdd={(player) => onAdd([player])} onComplete={close} />
		</div>
	</div>
</dialog>

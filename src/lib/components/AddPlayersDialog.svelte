<script lang="ts">
	import { faPaste, faUser } from '@fortawesome/free-regular-svg-icons';
	import Icon from '$lib/components/Icon.svelte';
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
		class="flex flex-col items-start gap-4 rounded-2xl bg-brand p-4 text-left text-ink transition-[background-color,transform] duration-150 ease-out hover:bg-brand/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100"
		type="button"
		onclick={() => open('import')}
	>
		<span class="grid size-10 place-items-center rounded-full bg-surface" aria-hidden="true">
			<Icon icon={faPaste} />
		</span>
		<span class="flex flex-col gap-0.5">
			<span class="font-medium">Import players</span>
			<span class="text-sm/5">Paste a list</span>
		</span>
	</button>
	<button
		class="flex flex-col items-start gap-4 rounded-2xl bg-surface p-4 text-left text-ink transition-[background-color,transform] duration-150 ease-out hover:bg-surface-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100"
		type="button"
		onclick={() => open('manual')}
	>
		<span class="grid size-10 place-items-center rounded-full bg-surface-muted" aria-hidden="true">
			<Icon icon={faUser} />
		</span>
		<span class="flex flex-col gap-0.5">
			<span class="font-medium">Add manually</span>
			<span class="text-sm/5 text-muted">One at a time</span>
		</span>
	</button>
</div>

<dialog
	bind:this={dialog}
	class="m-auto w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-2xl border-0 bg-surface p-0 text-ink shadow-overlay backdrop:bg-black/70"
	aria-labelledby="add-players-heading"
>
	<div class="flex max-h-[calc(100dvh-2rem)] flex-col">
		<header class="flex items-center justify-between gap-3 p-4 sm:p-6">
			<h2 id="add-players-heading" class="text-xl/7 font-medium text-balance">
				{mode === 'import' ? 'Import players' : 'Add player'}
			</h2>
			<button
				class="grid size-11 shrink-0 place-items-center rounded-full bg-surface-muted transition-[background-color,transform] duration-150 ease-out hover:bg-surface-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100"
				type="button"
				aria-label="Close"
				onclick={close}
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					aria-hidden="true"
				>
					<path d="M3 3l10 10M13 3L3 13" />
				</svg>
			</button>
		</header>

		<div class="flex flex-col gap-5 overflow-y-auto px-4 pt-1 pb-4 sm:px-6 sm:pb-6">
			{#if mode === 'import'}
				<PlayerImport {onAdd} onComplete={close} onCancel={close} />
			{:else}
				<ManualPlayerForm onAdd={(player) => onAdd([player])} onComplete={close} onCancel={close} />
			{/if}
		</div>
	</div>
</dialog>

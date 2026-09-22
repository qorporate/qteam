<script lang="ts">
	import { faShareFromSquare, faSquarePlus } from '@fortawesome/free-regular-svg-icons';
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
		class="flex min-h-14 items-center justify-center gap-2 rounded-full border border-black/15 bg-(--color-surface) px-3 py-2.5 font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100 sm:px-4"
		type="button"
		onclick={() => open('import')}
	>
		<Icon icon={faShareFromSquare} />
		Import players
	</button>
	<button
		class="flex min-h-14 items-center justify-center gap-2 rounded-full border border-black/15 bg-(--color-surface) px-3 py-2.5 font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-(--color-surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100 sm:px-4"
		type="button"
		onclick={() => open('manual')}
	>
		<Icon icon={faSquarePlus} />
		Add manually
	</button>
</div>

<dialog
	bind:this={dialog}
	class="m-auto w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-2xl border-0 bg-(--color-surface) p-0 text-(--color-ink) shadow-(--shadow-overlay) backdrop:bg-black/70"
	aria-labelledby="add-players-heading"
>
	<div class="flex max-h-[calc(100dvh-2rem)] flex-col">
		<header class="p-4 sm:p-6">
			<h2 id="add-players-heading" class="text-2xl/8 font-medium text-balance">
				{mode === 'import' ? 'Import players' : 'Add player'}
			</h2>
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

<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		art,
		children,
		actions
	}: {
		title: string;
		description: string;
		art?: Snippet;
		children?: Snippet;
		actions?: Snippet;
	} = $props();

	const id = $props.id();
</script>

<section
	class="flex flex-col items-center gap-6 rounded-2xl bg-surface px-6 py-10 text-center"
	aria-labelledby={id}
>
	{#if art}
		<div aria-hidden="true">{@render art()}</div>
	{/if}
	<div class="flex max-w-xs flex-col gap-1.5">
		<h2 {id} class="text-lg/6 font-medium text-balance">{title}</h2>
		<p class="text-sm/5 text-pretty text-muted">{description}</p>
	</div>
	{@render children?.()}
	{#if actions}
		<div class="flex w-full max-w-xs flex-col gap-2">{@render actions()}</div>
	{/if}
</section>

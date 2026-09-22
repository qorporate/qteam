<script lang="ts">
	import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

	let {
		icon,
		size = 20,
		colour = 'currentColor'
	}: {
		icon: IconDefinition;
		size?: number;
		colour?: string;
	} = $props();

	const width = $derived(icon.icon[0]);
	const height = $derived(icon.icon[1]);
	const paths = $derived(Array.isArray(icon.icon[4]) ? icon.icon[4] : [icon.icon[4]]);
</script>

<svg
	class="shrink-0"
	width={size}
	height={size}
	viewBox={`0 0 ${width} ${height}`}
	fill={colour}
	aria-hidden="true"
>
	{#each paths as path (path)}
		<path d={path} />
	{/each}
</svg>

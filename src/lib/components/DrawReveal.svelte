<script lang="ts">
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { getDrawOrder } from '$lib/draw';
	import { POSITION_LABELS, POSITIONS } from '$lib/players';
	import { teamName } from '$lib/teams';
	import type { Player, Position } from '$lib/types/players.types';
	import type { GeneratedResult } from '$lib/types/teams.types';

	let {
		players,
		generated,
		onFinish
	}: {
		players: Player[];
		generated: GeneratedResult;
		onFinish: () => void;
	} = $props();

	const MARKER_STYLES: Record<Position, string> = {
		DEFENDER: 'border-defender',
		MIDFIELDER: 'border-midfielder',
		FORWARD: 'border-forward'
	};
	const DOT_STYLES: Record<Position, string> = {
		DEFENDER: 'bg-defender',
		MIDFIELDER: 'bg-midfielder',
		FORWARD: 'bg-forward'
	};

	const playersById = $derived(new Map(players.map((player) => [player.id, player])));
	const order = $derived(getDrawOrder(generated.teams, generated.seed));
	let revealed = $state(0);
	let revealDuration = $state(180);
	const latest = $derived(revealed ? order[revealed - 1] : undefined);
	const next = $derived(order[revealed]);
	const finished = $derived(revealed >= order.length);
	const pots = $derived(
		POSITIONS.filter((position) => order.some((pick) => pick.position === position))
	);
	const currentPot = $derived(next?.position ?? latest?.position);

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) revealDuration = 0;
	});

	function initials(name: string): string {
		return name
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part.charAt(0).toUpperCase())
			.join('');
	}

	function potSummary(position: Position) {
		const picks = order.filter((pick) => pick.position === position);
		const drawn = order.slice(0, revealed).filter((pick) => pick.position === position).length;
		return { total: picks.length, drawn };
	}
</script>

<div class="flex flex-col gap-4">
	<section class="flex flex-col gap-3 rounded-2xl bg-surface p-4" aria-labelledby="draw-heading">
		<header class="flex items-baseline justify-between gap-3">
			<h2 id="draw-heading" class="text-lg/6 font-medium">Team draw</h2>
			<p class="text-sm/5 text-muted tabular-nums">{revealed} of {order.length} drawn</p>
		</header>
		<ol class="grid grid-cols-3 gap-2" aria-label="Pots">
			{#each pots as position, index (position)}
				{@const summary = potSummary(position)}
				{@const isCurrent = !finished && currentPot === position}
				<li
					class={[
						'flex flex-col gap-0.5 rounded-lg border-2 px-2 py-1.5 transition-[border-color] duration-150 ease-out',
						isCurrent ? 'border-ink bg-surface' : 'border-transparent bg-surface-muted'
					]}
					aria-current={isCurrent ? 'step' : undefined}
				>
					<span class="flex items-center gap-1.5 text-xs/4 text-muted">
						<span class={['size-2 rounded-full', DOT_STYLES[position]]} aria-hidden="true"></span>
						Pot {index + 1}
					</span>
					<span class="truncate text-sm/5 font-medium">{POSITION_LABELS[position]}s</span>
					<span class="text-xs/4 text-muted tabular-nums">{summary.drawn}/{summary.total}</span>
				</li>
			{/each}
		</ol>
	</section>

	<section
		class="flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl bg-surface p-4 text-center"
		aria-label="Latest pick"
		aria-live="polite"
	>
		{#key revealed}
			<div
				class="flex flex-col items-center gap-3"
				in:scale={{ duration: revealDuration, start: 0.9 }}
			>
				{#if latest}
					{@const player = playersById.get(latest.playerId)!}
					<span
						class={[
							'grid size-16 place-items-center rounded-full border-4 bg-surface text-lg font-bold',
							MARKER_STYLES[latest.position]
						]}
						aria-hidden="true">{initials(player.name)}</span
					>
					<p class="flex flex-col gap-1">
						<span class="text-2xl/8 font-medium text-balance">{player.name}</span>
						<span class="text-muted">
							{POSITION_LABELS[latest.position]} to
							<strong class="font-bold text-ink">Team {teamName(latest.teamIndex)}</strong>
						</span>
					</p>
				{:else}
					<p class="text-lg/6 font-medium">Ready to draw</p>
					<p class="text-sm/5 text-pretty text-muted">
						Players are revealed one at a time, starting with the
						{POSITION_LABELS[order[0]?.position ?? 'DEFENDER'].toLowerCase()}s pot.
					</p>
				{/if}
			</div>
		{/key}
	</section>

	<div class="grid grid-cols-2 gap-3 sm:gap-4">
		{#if finished}
			<button
				class="col-span-2 min-h-12 rounded-full bg-brand px-4 py-2.5 font-medium text-ink transition-[box-shadow,transform] duration-150 ease-out hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100"
				type="button"
				onclick={onFinish}>See teams</button
			>
		{:else}
			<button
				class="min-h-12 rounded-full border border-black/10 bg-surface px-4 py-2.5 font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100"
				type="button"
				onclick={() => (revealed = order.length)}>Show all</button
			>
			<button
				class="min-h-12 rounded-full bg-brand px-4 py-2.5 font-medium text-ink transition-[box-shadow,transform] duration-150 ease-out hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100"
				type="button"
				onclick={() => revealed++}>Draw next</button
			>
		{/if}
	</div>

	<div class="grid grid-cols-2 gap-3 sm:gap-4">
		{#each generated.teams as team, teamIndex (team.id)}
			{@const picks = order.slice(0, revealed).filter((pick) => pick.teamIndex === teamIndex)}
			<section
				class={[
					'flex flex-col gap-2 rounded-2xl border-2 bg-surface p-3 transition-[border-color] duration-150 ease-out',
					latest?.teamIndex === teamIndex && !finished
						? 'border-brand-strong'
						: 'border-transparent'
				]}
				aria-labelledby={`draw-team-${team.id}`}
			>
				<header class="flex items-baseline justify-between gap-2">
					<h3 id={`draw-team-${team.id}`} class="font-medium">Team {teamName(teamIndex)}</h3>
					<span class="text-xs/4 text-muted tabular-nums">{picks.length}/{team.players.length}</span
					>
				</header>
				<ul class="flex flex-col gap-1">
					{#each picks as pick (pick.playerId)}
						{@const isLatest = pick === latest && !finished}
						<li
							class={[
								'flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1 text-sm/5',
								isLatest ? 'bg-brand-soft font-medium' : ''
							]}
						>
							<span class={['size-2.5 shrink-0 rounded-full', DOT_STYLES[pick.position]]}></span>
							<span class="truncate">{playersById.get(pick.playerId)!.name}</span>
							<span class="sr-only">, {POSITION_LABELS[pick.position]}</span>
						</li>
					{/each}
					{#if picks.length < team.players.length}
						<li class="px-1.5 py-1 text-xs/4 text-muted">
							{team.players.length - picks.length} to come
						</li>
					{/if}
				</ul>
			</section>
		{/each}
	</div>
</div>

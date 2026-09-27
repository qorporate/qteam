<script lang="ts">
	let {
		screen,
		onPlayers,
		onSetup,
		onTeams
	}: {
		screen: 'players' | 'setup' | 'teams';
		onPlayers: () => void;
		onSetup: () => void;
		onTeams: () => void;
	} = $props();
</script>

<nav
	class="sticky bottom-0 z-10 shrink-0 pb-[env(safe-area-inset-bottom)]"
	aria-label="Team creation"
>
	<div class="mx-auto w-full max-w-page px-4 pb-2 sm:px-6 lg:px-8">
		<ol class="grid grid-cols-3 gap-1 rounded-2xl bg-surface p-1.5">
			<li>
				<button
					class={[
						'flex min-h-11 w-full items-center justify-center rounded-xl px-2 text-sm font-medium transition-[background-color,color,transform] duration-150 ease-out hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100',
						screen === 'players' ? 'bg-brand-soft' : 'hover:bg-surface-muted'
					]}
					type="button"
					aria-current={screen === 'players' ? 'step' : undefined}
					onclick={onPlayers}>Players</button
				>
			</li>
			<li>
				<button
					class={[
						'flex min-h-11 w-full items-center justify-center rounded-xl px-2 text-sm font-medium transition-[background-color,color,transform] duration-150 ease-out hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100',
						screen === 'setup' ? 'bg-brand-soft' : 'hover:bg-surface-muted'
					]}
					type="button"
					aria-current={screen === 'setup' ? 'step' : undefined}
					onclick={onSetup}>Team setup</button
				>
			</li>
			<li>
				<button
					class={[
						'flex min-h-11 w-full items-center justify-center rounded-xl px-2 text-sm font-medium transition-[background-color,color,transform] duration-150 ease-out hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] motion-reduce:active:scale-100',
						screen === 'teams' ? 'bg-brand-soft' : 'hover:bg-surface-muted'
					]}
					type="button"
					aria-current={screen === 'teams' ? 'step' : undefined}
					onclick={onTeams}>Teams</button
				>
			</li>
		</ol>
	</div>
</nav>

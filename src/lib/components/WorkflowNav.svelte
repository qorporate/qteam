<script lang="ts">
	let {
		screen,
		canOpenSetup,
		canOpenTeams,
		onPlayers,
		onSetup,
		onTeams
	}: {
		screen: 'players' | 'setup' | 'teams';
		canOpenSetup: boolean;
		canOpenTeams: boolean;
		onPlayers: () => void;
		onSetup: () => void;
		onTeams: () => void;
	} = $props();
</script>

<nav
	class="rounded-sm border-b border-black/10 bg-(--color-surface) px-2"
	aria-label="Team creation"
>
	<ol class="flex w-full justify-between">
		<li>
			<button
				class={[
					'flex min-h-11 items-center border-b-2 px-2 text-sm font-medium transition-[color,transform] duration-150 ease-out hover:text-(--color-brand) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] motion-reduce:active:scale-100',
					screen === 'players' ? 'border-(--color-brand)' : 'border-transparent'
				]}
				type="button"
				aria-current={screen === 'players' ? 'step' : undefined}
				onclick={onPlayers}>Players</button
			>
		</li>
		<li>
			<button
				class={[
					'flex min-h-11 items-center border-b-2 px-2 text-sm font-medium transition-[color,transform] duration-150 ease-out hover:text-(--color-brand) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] disabled:cursor-not-allowed disabled:text-(--color-disabled) disabled:hover:text-(--color-disabled) disabled:active:scale-100 motion-reduce:active:scale-100',
					screen === 'setup' ? 'border-(--color-brand)' : 'border-transparent'
				]}
				type="button"
				disabled={!canOpenSetup}
				aria-current={screen === 'setup' ? 'step' : undefined}
				onclick={onSetup}>Team setup</button
			>
		</li>
		<li>
			<button
				class={[
					'flex min-h-11 items-center border-b-2 px-2 text-sm font-medium transition-[color,transform] duration-150 ease-out hover:text-(--color-brand) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink) active:scale-[0.96] disabled:cursor-not-allowed disabled:text-(--color-disabled) disabled:hover:text-(--color-disabled) disabled:active:scale-100 motion-reduce:active:scale-100',
					screen === 'teams' ? 'border-(--color-brand)' : 'border-transparent'
				]}
				type="button"
				disabled={!canOpenTeams}
				aria-current={screen === 'teams' ? 'step' : undefined}
				onclick={onTeams}>Teams</button
			>
		</li>
	</ol>
</nav>

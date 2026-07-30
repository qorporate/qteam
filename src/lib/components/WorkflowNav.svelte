<script lang="ts">
	let {
		screen,
		canOpenSetup,
		onPlayers,
		onSetup
	}: {
		screen: 'players' | 'setup';
		canOpenSetup: boolean;
		onPlayers: () => void;
		onSetup: () => void;
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
					'flex min-h-11 items-center border-b-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand)',
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
					'flex min-h-11 items-center border-b-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand) disabled:cursor-not-allowed disabled:text-(--color-disabled)',
					screen === 'setup' ? 'border-(--color-brand)' : 'border-transparent'
				]}
				type="button"
				disabled={!canOpenSetup}
				aria-current={screen === 'setup' ? 'step' : undefined}
				onclick={onSetup}>Team setup</button
			>
		</li>
		<li>
			<span class="flex min-h-11 items-center text-sm text-(--color-disabled)" aria-disabled="true"
				>Teams</span
			>
		</li>
	</ol>
</nav>

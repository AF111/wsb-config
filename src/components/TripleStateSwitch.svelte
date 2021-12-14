<script lang="ts">
	import { beforeUpdate, createEventDispatcher } from 'svelte';

	const defaultStates = ['OFF', 'PARTIAL', 'ON'];
	export let states: string[] | { title: string; value: string }[] = [];
	export let value = '';

	const dispatch = createEventDispatcher();

	beforeUpdate(() => {
		if (!states.length) {
			states = defaultStates;
		}

		const v = value ?? states[0];
		value = typeof v === 'object' ? v.value : v;
	});

	const handleValueChange = (e) => dispatch('value', e.target.value);
</script>

<form on:change={handleValueChange} class="ts-switch">
	{#each states as state}
		{#if typeof state === 'object'}
			{#if state.title.toLowerCase() === value.toLowerCase()}
				<input type="radio" name="triple-state-switch" title={state.title} value={state.value} checked />
			{:else}
				<input type="radio" name="triple-state-switch" title={state.title} value={state.value} />
			{/if}
		{:else if state.toLowerCase() === value.toLowerCase()}
			<input type="radio" name="triple-state-switch" title={state} value={state} checked />
		{:else}
			<input type="radio" name="triple-state-switch" title={state} value={state} />
		{/if}
	{/each}
</form>

<style>
	.ts-switch {
		--toggle-size: 25px;
		--toggle-pos-x: 50%;
		--toggle-pos-y: 50%;
		display: flex;
		position: relative;
		align-items: center;
		background: var(--c-primary);
		min-width: calc(var(--toggle-size) * 3);
		height: 32px;
		border-radius: 32px;
	}

	.ts-switch input {
		display: block;
		position: relative;
		background: var(--c-primary);
		width: var(--toggle-size);
		height: var(--toggle-size);
		border: 0;
	}

	.ts-switch input::before {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		content: attr(value);
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: var(--c-primary);
		border-radius: var(--toggle-size);
		cursor: pointer;
	}

	.ts-switch input:checked::before {
		background: white;
	}

	:global(body.themed--dark .ts-switch::before) {
		background-color: white;
	}
</style>

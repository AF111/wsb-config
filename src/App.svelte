<script lang="ts">
	import './global.css';

	import { beforeUpdate, onMount, onDestroy } from 'svelte';
	import Header from './components/Header.svelte';
	import ConfigEditorScreen from './screens/ConfigEditor.svelte';
	import ConfigsScreen from './screens/Configs.svelte';
	import MainScreen from './screens/Main.svelte';
	import { Router, Route } from 'svelte-routing';
	import { darkModeMQ, changeTheme, getCurrentTheme } from './lib/theme';

	export let url = '';

	const handleThemeChange = (ev: MediaQueryListEvent) => changeTheme('system');

	onMount(() => {
		changeTheme(getCurrentTheme());
		darkModeMQ.addEventListener('change', handleThemeChange);
	});

	onDestroy(() => {
		darkModeMQ.removeEventListener('change', handleThemeChange);
	});

	beforeUpdate(() => {
		changeTheme();
	});
</script>

<Router {url}>
	<Header />
	<main class="router">
		<Route path="/">
			<section class="route">
				<MainScreen />
			</section>
		</Route>
		<Route path="/edit" a={1}>
			<section class="route">
				<ConfigEditorScreen id="" />
			</section>
		</Route>
		<Route path="/edit/:id" let:params>
			<section class="route">
				<ConfigEditorScreen id={params.id} />
			</section>
		</Route>
		<Route path="/configs">
			<section class="route">
				<ConfigsScreen />
			</section>
		</Route>
	</main>
</Router>

<style>
	.router {
		padding: 2rem;
		max-width: 800px;
		width: 100%;
		margin: 0 auto;
	}

	@keyframes animated-entry {
		from {
			opacity: 0;
			transform: translateX(-50%);
		}

		100% {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.router .route {
		animation: animated-entry 500ms cubic-bezier(0.19, 1, 0.22, 1) forwards;
		display: block;
	}

	@media (prefers-reduced-motion) {
		.router .route {
			animation: unset;
		}
	}

	:global(a) {
		text-decoration: none;
		color: initial;
	}
</style>

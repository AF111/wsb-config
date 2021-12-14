<script lang="ts">
	import { Link } from 'svelte-routing';
</script>

<div class="main-screen">
	<div class="main-screen__card">
		<img
			src="./src/assets/images/add-files.svg"
			alt="add files"
			width="179"
			height="151"
			srcset=""
		/>
		<p class="text-2xl">Upload & edit config file</p>
	</div>
	<h4 style="margin: 2rem;" class="text-center text-4xl">OR</h4>

	<Link to="/edit">
		<div class="main-screen__card">
			<img
				src="./src/assets/images/edit-files.svg"
				alt="add files"
				width="179"
				height="151"
				srcset=""
			/>
			<p class="text-2xl">Create a new config file</p>
		</div>
	</Link>
</div>

<style>
	.main-screen {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

	.main-screen__card {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		border-radius: 10px;
		background: var(--c-secondary);
		width: 318px;
		min-height: 252px;
		cursor: pointer;
		transition: box-shadow 100ms linear;
	}

	.main-screen__card:hover {
		box-shadow: 0px 0px 5px 4px rgb(0 0 0 / 16%);
	}

	.main-screen__card img {
		transition: transform 150ms linear;
	}

	.main-screen__card:hover img {
		transform: scale(1.1) rotate(-10deg);
	}

	.main-screen__card:nth-child(2n + 1):hover img {
		transform: scale(1.1) rotate(10deg);
	}

	.main-screen__card p {
		margin-top: 2rem;
	}

	@media screen and (max-width: 325px) {
		.main-screen__card {
			width: 100%;
			padding: 2rem;
			text-align: center;
		}
	}
</style>

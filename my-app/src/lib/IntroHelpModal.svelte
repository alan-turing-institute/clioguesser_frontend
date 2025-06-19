<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();
	export let show: boolean;
	export let min_year: number;
	export let max_year: number;
	export function formatYear(year: number): string {
		return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
	}

	function closeModal(): void {
		show = false;
		dispatch('close');
	}

	// Optional: Close modal with Escape key
	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') closeModal();
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

{#if show}
	<div
		class="modal-backdrop bg-opacity-90 fixed inset-0 z-[1000] flex items-center justify-center bg-white dark:bg-black"
	>
		<div
			class="z-[1001] flex w-[600px] max-w-[80vw]
	       flex-col items-center rounded-[30px] border border-black bg-[var(--color-card-bg)] p-4
	       text-center shadow-2xl sm:p-6 dark:border-gray-800"
			role="dialog"
			aria-modal="true"
			aria-label="How to Play"
		>
			<h2 class="mb-4 text-4xl font-bold text-black dark:text-white">Welcome to Clioguesser</h2>

			<ul class="mb-4 space-y-1 leading-tight text-black dark:text-white">
				<li>You will be shown 10 maps from {formatYear(min_year)} to {formatYear(max_year)}.</li>
				<li>Use the polity outlines to guess the age of the map</li>
				<li>Use the CE / BCE button to change the era</li>
				<li>Submit your guess to see how close you are</li>
				<li>Hover over a polity to show its boundaries</li>
				<li>
					You can use hints if you get stuck. Click on a country to see its name in the bottom left
				</li>
				<li>
					<span class="font-bold text-red-600">WARNING</span>: each hint reduces your score for that
					round!
				</li>
			</ul>

			<button
				class="rounded bg-gray-200 px-6 py-2 font-bold text-green-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-green-400 dark:hover:bg-gray-600"
				on:click={closeModal}
				aria-label="Close"
			>
				Play game
			</button>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 1000;
	}
	.modal-content {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 2rem 2.5rem;
		border-radius: 30px;
		box-shadow: 0 4px 32px rgba(0, 0, 0, 0.2);
		z-index: 1001;
		max-width: 90vw;
		width: 600px;
	}
	h2 {
		font-size: 2rem;
		margin: 1.5rem 0 1.5rem 0;
		letter-spacing: 0.08em;
		font-weight: 800;
		color: var(--bs-heading-color);
		line-height: 1.2;
		text-align: center;
	}
	ul {
		margin: 1rem 0 0 1.2rem;
		padding: 0;
		text-align: left;
		list-style-type: disc;
	}
	ul li {
		margin-left: 1.5em;
		margin-bottom: 0.7em;
	}
</style>

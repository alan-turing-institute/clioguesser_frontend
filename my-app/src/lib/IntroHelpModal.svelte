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
		class="modal-backdrop bg-white dark:bg-black bg-opacity-90 fixed inset-0 z-[1000] flex items-center justify-center"
	>
		<div
			class="flex flex-col items-center text-center
		       p-8 sm:p-10 rounded-[30px] shadow-2xl z-[1001] max-w-[90vw] w-[600px]
		       bg-[var(--color-card-bg)] border border-black dark:border-gray-800"
			role="dialog"
			aria-modal="true"
			aria-label="How to Play"
		>
			<h2 class="text-black dark:text-white font-bold text-4xl mb-6">Welcome to Clioguesser</h2>

			<ul class="text-black dark:text-white space-y-4 mb-8">
				<li>You will be shown 10 maps from {formatYear(min_year)} to {formatYear(max_year)}.</li>
				<li>Use the polity outlines to guess the age of the map.</li>
				<li>Submit your guess to see how close you are.</li>
				<li>You can use hints if you get stuck, but each hint reduces your score!</li>
				<li>To use a hint, click on a polity to show the name.</li>
			</ul>

			<button
				class="!bg-black/60 dark:!bg-black/40 hover:!bg-gray-800 !text-white font-bold py-2 px-6 rounded"
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

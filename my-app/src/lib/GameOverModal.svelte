<script lang="ts">
	import Button from '$lib/Button.svelte';
	import { goto } from '$app/navigation';

	let leaderboardSubmitted = false;

	export let show: boolean;
	export let score: number;
	export let initials: string;
	export let initialsError: string;

	export let setInitials: (val: string) => void;
	export let setInitialsError: (val: string) => void;

	export let submitLeaderboard: (initials: string) => Promise<boolean>;
	export let resetGame: () => Promise<void>;
</script>

{#if show}
	<div class="modal-backdrop">
		<div class="modal-content">
			<p>Your final score is <strong>{score}</strong> points.</p>

			<div class="mt-4">
				{#if leaderboardSubmitted}
					<p class="text-green-500">Your score has been submitted to the leaderboard!</p>
				{:else}
					<label for="initials" class="block mb-2 font-medium">Enter your initials:</label>
					<input
						id="initials"
						type="text"
						bind:value={initials}
						maxlength="3"
						placeholder="ABC"
						class="w-full px-3 py-2 border rounded-md text-black text-center uppercase font-bold"
					/>
				{/if}
				{#if initialsError}
					<p class="text-red-500 text-sm mt-1">{initialsError}</p>
				{/if}
			</div>
			<div class="button-row mt-4 flex gap-4">
				{#if leaderboardSubmitted}
					<Button
						class="primary sm"
						on:click={async () => {
							await goto('/leaderboard');
						}}
					>
						Go to Leaderboard
					</Button>
				{:else}
					<Button
						class="primary sm"
						on:click={async () => {
							const success = await submitLeaderboard(initials);
							if (success) {
								leaderboardSubmitted = true;
							} else {
								setInitialsError('Failed to submit score. Please try again.');
							}
						}}
					>
						Submit to Leaderboard
					</Button>
				{/if}

				<Button
					class="secondary sm"
					on:click={async () => {
						await resetGame();
					}}
				>
					Play Again
				</Button>
			</div>
		</div>
	</div>
{/if}

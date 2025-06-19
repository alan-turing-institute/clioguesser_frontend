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
					<label for="initials" class="mb-2 block font-medium">Enter your initials:</label>
					<input
						id="initials"
						type="text"
						bind:value={initials}
						maxlength="3"
						placeholder="ABC"
						class="w-full rounded-md border px-3 py-2 text-center font-bold text-black uppercase"
					/>
				{/if}
				{#if initialsError}
					<p class="mt-1 text-sm text-red-500">{initialsError}</p>
				{/if}
			</div>
			<div class="button-row mt-4 flex gap-4">
				{#if leaderboardSubmitted}
					<Button
						class="primary sm"
						on:click={async () => {
							resetGame();
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
								setInitialsError('Failed to submit score. Initials must be 3 characters.');
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
						leaderboardSubmitted = false;
					}}
				>
					Play Again
				</Button>
			</div>
		</div>
	</div>
{/if}

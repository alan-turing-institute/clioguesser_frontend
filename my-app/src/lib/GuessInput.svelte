<script lang="ts">
	import Button from '$lib/Button.svelte';
	export let guess: string;
	export let round: number;
	export let max_rounds: number;
	export let min_year: number;
	export let max_year: number;
	export let submitted: boolean;
	export let inputError: string;
	export let hint_penalty: number;
	export let guessAge: string;
	export let trueAge: number | null;
	export let trueAges: number[];
	export let L: any;

	export let getScore: () => Promise<void>;
	export let updateMap: (L: any) => Promise<void>;
	export let resetGame: () => Promise<void>;

	export let setGuess: (val: string) => void;
	export let setGuessAge: (val: string) => void;
	export let setInputError: (val: string) => void;
	export let setSubmitted: (val: boolean) => void;
	export let setHintPenalty: (val: number) => void;
	export let setRound: (val: number) => void;
	export let setTrueAge: (val: number) => void;
	export let setTrueAges: (val: number[]) => void;
	export function formatYear(year: number): string {
		return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
	}
</script>

<div class="two-column-row">
	<span class="left-align">
		Hint modifier: {Math.round(hint_penalty)}%
	</span>
	<span class="right-align">Year:</span>

	<input
		bind:value={guess}
		placeholder="Enter guess (minus for BCE)"
		disabled={round > max_rounds}
		style="min-width: 240px;"
		on:keydown={async (e) => {
			if (round > max_rounds) return;

			if (e.key === 'Enter') {
				e.preventDefault();
				setInputError('');

				if (!submitted) {
					if (
						isNaN(Number(guess)) ||
						guess.trim() === '' ||
						!Number.isInteger(Number(guess))
					) {
						setInputError('Please enter a valid year.');
						return;
					}
					if (Number(guess) < min_year || Number(guess) > max_year) {
						setInputError(`Please enter a year between ${formatYear(min_year)} and ${formatYear(max_year)}.`);
						return;
					}
					setGuessAge(guess);
					await getScore();
					setSubmitted(true);
					setHintPenalty(100.0);
					sessionStorage.setItem('hint_penalty', '100.0');
				} else if (submitted && round < max_rounds) {
					setSubmitted(false);
					setRound(round + 1);
					sessionStorage.setItem('round', (round + 1).toString());
					const next = trueAges.shift();
					setTrueAges([...trueAges]);
					setTrueAge(next);
					sessionStorage.setItem('trueAge', String(next));
					await updateMap(L);
					setGuess('');
					setGuessAge('');
				} else if (submitted && round >= max_rounds) {
					setSubmitted(false);
					setRound(round + 1);
					sessionStorage.setItem('round', (round + 1).toString());
				}
			}
		}}
	/>

	{#if submitted === false}
		<Button
			class="primary sm"
			disabled={round > max_rounds}
			on:click={async () => {
				setInputError('');
				if (
					isNaN(Number(guess)) ||
					guess.trim() === '' ||
					!Number.isInteger(Number(guess))
				) {
					setInputError('Please enter a valid year.');
					return;
				}
				if (Number(guess) < min_year || Number(guess) > max_year) {
					setInputError(`Please enter a year between ${formatYear(min_year)} and ${formatYear(max_year)}.`);
					return;
				}
				setGuessAge(guess);
				await getScore();
				setHintPenalty(100.0);
				sessionStorage.setItem('hint_penalty', '100.0');
				setSubmitted(true);
			}}
		>
			Submit
		</Button>
	{:else if round < max_rounds}
		<Button
			class="primary sm"
			disabled={round > max_rounds}
			on:click={async () => {
				setSubmitted(false);
				setRound(round + 1);
				sessionStorage.setItem('round', (round + 1).toString());
				const next = trueAges.shift();
				setTrueAges([...trueAges]);
				setTrueAge(next);
				sessionStorage.setItem('trueAge', String(next));
				await updateMap(L);
				setGuess('');
				setGuessAge('');
			}}
		>
			Next
		</Button>
	{:else}
		<Button
			class="primary sm"
			disabled={round > max_rounds}
			on:click={async () => {
				setSubmitted(false);
				setRound(round + 1);
				sessionStorage.setItem('round', (round + 1).toString());
			}}
		>
			Finish
		</Button>
	{/if}

	<Button
		class="secondary sm"
		on:click={async () => {
			await resetGame();
		}}
	>
		Restart game
	</Button>

	{#if inputError}
		<div class="text-red-500 text mt-1">
			<span style="color: red;">{inputError}</span>
		</div>
	{/if}
</div>

<style>
	.two-column-row {
		display: flex;
		justify-content: space-between;
		gap: 2rem;
		width: 100%;
	}
	.left-align {
		flex: 2;
		text-align: left;
	}
	.right-align {
		flex: 4;
		text-align: right;
	}
</style>

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
	export let finished: boolean;

	export let getScore: () => Promise<void>;
	export let updateMap: (L: any) => Promise<void>;
	export let resetGame: () => Promise<void>;

	export let setFinished: (val: boolean) => void;
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

	export let era: 'CE' | 'BCE';
	export let setEra: (val: 'CE' | 'BCE') => void;
	let popHint = false;

	$: if (hint_penalty !== undefined) {
		popHint = false;
		setTimeout(() => {
			popHint = true;
			setTimeout(() => (popHint = false), 500); // duration matches animation
		}, 0);
	}

	// Update guess_errors and input handling to use era
	function getEraAdjustedGuess(guess: string, era: 'CE' | 'BCE') {
		let n = Number(guess);
		if (era === 'BCE' && !isNaN(n)) n = -Math.abs(n);
		if (era === 'CE' && !isNaN(n)) n = Math.abs(n);
		return n;
	}

	function guess_errors(guess, min_year, max_year) {
		const n = getEraAdjustedGuess(guess, era);
		if (isNaN(n) || guess.trim() === '' || !Number.isInteger(Number(guess))) {
			setInputError('Please enter a valid year.');
			return true;
		}
		if (n < min_year || n > max_year) {
			setInputError(
				`Please enter a year between ${formatYear(min_year)} and ${formatYear(max_year)}.`
			);
			return true;
		}
		return false;
	}

	let inputDisabled = false;
	$: inputDisabled = submitted;
</script>

<div class="flex items-center gap-4 justify-center w-full h-16">
	{#if !submitted || round > max_rounds}
		<span class="text">Year:</span>
		<div class="input-era-row">
			<input
				id="guess-input"
				class="border rounded px-2 py-1 text-black"
				bind:value={guess}
				placeholder="Enter guess"
				disabled={round > max_rounds}
				style="max-width: 120px;"
				on:keydown={async (e) => {
					if (round == max_rounds && submitted) return;

					if (e.key === 'Enter') {
						e.preventDefault();
						setInputError('');

						if (!submitted) {
							let ge = guess_errors(guess, min_year, max_year);
							if (ge) return;
							// Use era-adjusted guess
							setGuessAge(String(getEraAdjustedGuess(guess, era)));
							await getScore();
							setHintPenalty(100.0);
							sessionStorage.setItem('hint_penalty', '100.0');
							setSubmitted(true);
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
			<button
				class="era-switch"
				type="button"
				aria-label="Switch CE/BCE"
				on:click={() => setEra(era === 'CE' ? 'BCE' : 'CE')}
				disabled={round > max_rounds}
			>
				{era}
			</button>
		</div>
	{/if}

	{#if submitted === false}
		<Button
			class="primary sm submit-btn"
			disabled={round > max_rounds}
			on:click={async () => {
				setInputError('');
				let ge = guess_errors(guess, min_year, max_year);
				if (ge) return;
				setGuessAge(guess);
				await getScore();
				setHintPenalty(100.0);
				sessionStorage.setItem('hint_penalty', '100.0');
				setSubmitted(true);
				setEra('CE'); // Reset era to CE after submission
			}}
		>
			Submit
		</Button>
	{:else if round < max_rounds}
		<Button
			class="primary sm next-btn"
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
			class="primary sm next-btn"
			disabled={round > max_rounds}
			on:click={async () => {
				setSubmitted(false);
				setFinished(true);
				// setRound(round + 1);
				// sessionStorage.setItem('round', (round + 1).toString());
			}}
		>
			Finish
		</Button>
	{/if}

	{#if inputError}
		<div class="popup-error">
			<span>{inputError}</span>
			<button class="close-btn" on:click={() => setInputError('')} aria-label="Close"
				>&times;</button
			>
		</div>
	{/if}
	{#if !submitted}
		<span class="centre-label" class:pop-effect={popHint}>
			Hint modifier: {Math.round(hint_penalty)}%
		</span>
	{/if}
	<Button
		class="secondary sm restart-btn"
		on:click={async () => {
			await resetGame();
		}}
	>
		Restart game
	</Button>
</div>

<style>
	.left-align {
		text-align: left;
		display: flex;
		justify-content: space-between;
		gap: 2rem;
	}
	.centre-label {
		display: flex;
		align-items: center;
		height: 100%;
	}
	.pop-effect {
		animation: pop 0.5s cubic-bezier(0.36, 2, 0.6, 0.99);
		color: #e63946;
		font-weight: bold;
		text-shadow:
			0 0 8px #fff,
			0 0 16px #e63946;
	}
	@keyframes pop {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		20% {
			transform: scale(1.5);
			opacity: 1;
		}
		60% {
			transform: scale(0.95);
			opacity: 1;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}
	.popup-error {
		position: fixed;
		top: 2rem;
		left: 50%;
		transform: translateX(-50%);
		background: #fff;
		color: #e63946;
		border: 1px solid #e63946;
		border-radius: 8px;
		box-shadow: 0 2px 16px rgba(0, 0, 0, 0.15);
		padding: 1rem 2.5rem 1rem 1.25rem;
		z-index: 1000;
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 1.1rem;
		min-width: 260px;
		max-width: 90vw;
		animation: pop 0.5s cubic-bezier(0.36, 2, 0.6, 0.99);
	}
	.close-btn {
		background: none;
		border: none;
		color: #e63946;
		font-size: 1.5rem;
		font-weight: bold;
		cursor: pointer;
		margin-left: auto;
		line-height: 1;
		padding: 0 0.25rem;
	}
	.era-switch {
		background: #f1f1f1;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 1rem;
		padding: 0.25rem 0.75rem;
		cursor: pointer;
		color: #333;
		font-weight: 600;
		transition: background 0.15s;
		min-width: 60px; /* Ensures consistent width for both 'CE' and 'BCE' */
		text-align: center;
		box-sizing: border-box;
	}
	.era-switch:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	:global(.restart-btn) {
		min-width: 140px;
		text-align: center;
		box-sizing: border-box;
		color: #e63946 !important; /* Red */
		font-weight: bold;
	}
	:global(.submit-btn),
	:global(.next-btn) {
		min-width: 140px;
		text-align: center;
		box-sizing: border-box;
		color: #2ca02c !important; /* Green */
		font-weight: bold;
	}
</style>

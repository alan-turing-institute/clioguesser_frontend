<script lang="ts">
	export let round: number;
	export let max_rounds: number;
	export let score: number;
	export let min_year: number;
	export let max_year: number;
	export let submitted: boolean;
	export let guessAge: string;
	export let trueAge: number | null;

	export function formatYear(year: number): string {
		return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
	}
</script>

<h1>Clioguesser</h1>

<p>
	Do you think you know your history? Guess the year of this map based on the polity outlines.
</p>

<p>Round {round} of {max_rounds}</p>
<p>Current score: {score}</p>
<p>The maps cover the years {formatYear(min_year)} to {formatYear(max_year)}.</p>

{#if submitted && trueAge !== null}
	<p>The actual year of the map is {formatYear(trueAge)}.</p>
	<p>
		{#if guessAge == String(trueAge)}
			<span class="correct">Correct! Very impressive</span>
		{:else if Math.abs(Number(guessAge) - trueAge) < 50}
			<span class="incorrect">Nearly! You were off by {Math.abs(Number(guessAge) - trueAge)} years.</span>
		{:else}
			<span class="incorrect">Incorrect! You were off by {Math.abs(Number(guessAge) - trueAge)} years.</span>
		{/if}
	</p>
{/if}

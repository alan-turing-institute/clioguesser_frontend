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

<div class="flex flex-col justify-center items-center text-center">
	<h1 class="text-3xl font-bold">Clioguesser</h1>

	<p class="mt-2">
		Do you think you know your history? Guess the year of this map based on the polity outlines.
	</p>

	<p class="mt-1">
		The maps cover the years {formatYear(min_year)} to {formatYear(max_year)}.
	</p>
</div>
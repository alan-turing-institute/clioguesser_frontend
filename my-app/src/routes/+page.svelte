<script lang="ts">
	import { onMount } from 'svelte';
	import { shuffle_years } from '$lib/Shuffle.js';
	import GuessInput from '$lib/GuessInput.svelte';
	import GameOverModal from '$lib/GameOverModal.svelte';
	import MapViewer from '$lib/MapViewer.svelte';
	import GameHeader from '$lib/GameHeader.svelte';
	import { getScore as fetchScore, submitLeaderboard as submitScore } from '$lib/api';

	let guess = '';
	let guessAge = '';
	let min_year = -1000;
	let max_year = 2024;
	let year_step = 1;
	let score: number = 0;
	let api_score = 0;
	let trueAges: number[] = [];
	let trueAge: number | null = null;
	let round = 1;
	let max_rounds = 10;
	let submitted = false;
	let initials = '';
	let initialsError = '';
	let inputError = '';
	let hint_penalty: number = 100.0;

	onMount(() => {
		// restore from sessionStorage
		const stored = (key: string, fallback: any) => sessionStorage.getItem(key) ?? fallback;
		hint_penalty = Number(stored('hint_penalty', '100.0'));
		trueAge = Number(stored('trueAge', 'NaN')) || null;
		score = Number(stored('score', '0'));
		round = Number(stored('round', '1'));

		if (!trueAge) {
			trueAges = shuffle_years(min_year, max_year, year_step);
			trueAge = trueAges.shift();
			sessionStorage.setItem('trueAge', String(trueAge));
		}
		if (!trueAges.length) {
			trueAges = shuffle_years(min_year, max_year, year_step).filter((y) => y !== trueAge);
		}
	});

	async function getScore() {
		const data = await fetchScore({ min_year, max_year, trueAge, guessAge, hint_penalty });
		if (!data) return;
		api_score = data.score;
		score += api_score;
		sessionStorage.setItem('score', score.toString());
	}

	async function handleSubmitLeaderboard(initials: string): Promise<boolean> {
		if (initials.length !== 3) {
			initialsError = 'Initials must be exactly 3 characters.';
			return false;
		}
		initialsError = '';
		const result = await submitScore(initials, score);
		if (!result) {
			initialsError = 'Failed to submit score. Please try again.';
			return false;
		}
		return true;
	}

	async function resetGame() {
		guess = '';
		guessAge = '';
		hint_penalty = 100.0;
		score = 0;
		round = 1;
		submitted = false;
		trueAges = shuffle_years(min_year, max_year, year_step);
		trueAge = trueAges.shift();

		sessionStorage.setItem('score', '0');
		sessionStorage.setItem('round', '1');
		sessionStorage.setItem('hint_penalty', '100.0');
		sessionStorage.setItem('trueAge', String(trueAge));
	}

	function formatYear(year: number): string {
		return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
	}
</script>

<div class="container">
	<a class="leaderboard-link" href="/leaderboard">
		<span role="img" aria-label="Leaderboard">🏅</span>
	</a>
	<GameHeader {round} {max_rounds} {score} {min_year} {max_year} {submitted} {guessAge} {trueAge} />

	<GuessInput
		{guess}
		{round}
		{max_rounds}
		{min_year}
		{max_year}
		{submitted}
		{inputError}
		{hint_penalty}
		{guessAge}
		{trueAge}
		{trueAges}
		{getScore}
		{resetGame}
		setGuess={(val) => (guess = val)}
		setGuessAge={(val) => (guessAge = val)}
		setInputError={(val) => (inputError = val)}
		setSubmitted={(val) => (submitted = val)}
		setHintPenalty={(val) => (hint_penalty = val)}
		setRound={(val) => (round = val)}
		setTrueAge={(val) => (trueAge = val)}
		setTrueAges={(val) => (trueAges = val)}
	/>

	<GameOverModal
		show={round > max_rounds}
		{score}
		{initials}
		{initialsError}
		setInitials={(val) => (initials = val)}
		setInitialsError={(val) => (initialsError = val)}
		submitLeaderboard={handleSubmitLeaderboard}
		{resetGame}
	/>
	<MapViewer
		{trueAge}
		{hint_penalty}
		on:hintPenaltyUpdate={(e) => {
			hint_penalty = e.detail;
			sessionStorage.setItem('hint_penalty', String(hint_penalty));
		}}
	/>

	<p>Based on <a href="https://seshat-db.com/">Seshat: Global History Databank</a>.</p>
</div>

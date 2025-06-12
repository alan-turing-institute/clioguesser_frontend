<script lang="ts">
	import { onMount } from 'svelte';
	import { shuffle_years } from '$lib/Shuffle.js';
	import GuessInput from '$lib/GuessInput.svelte';
	import GameOverModal from '$lib/GameOverModal.svelte';
	import MapViewer from '$lib/MapViewer.svelte';
	import GameHeader from '$lib/GameHeader.svelte';
	import IntroHelpModal  from '$lib/IntroHelpModal.svelte';
	import { getScore as fetchScore, submitLeaderboard as submitScore } from '$lib/api';

	let guess = '';
	let guessAge = '';
	let min_year = -1000;
	let max_year = 2024;
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
	let showIntroHelp = true;
	let finished = false;

	let era: 'CE' | 'BCE' = 'CE';

	function setEra(val: 'CE' | 'BCE') {
		era = val;
	}

	onMount(() => {
		// restore from sessionStorage
		const stored = (key: string, fallback: any) => sessionStorage.getItem(key) ?? fallback;
		hint_penalty = Number(stored('hint_penalty', '100.0'));
		trueAge = Number(stored('trueAge', 'NaN')) || null;
		score = Number(stored('score', '0'));
		round = Number(stored('round', '1'));

		if (!trueAge) {
			trueAges = shuffle_years(min_year, max_year, max_rounds);
			trueAge = trueAges.shift();
			sessionStorage.setItem('trueAge', String(trueAge));
		}
		if (!trueAges.length) {
			trueAges = shuffle_years(min_year, max_year, max_rounds).filter((y) => y !== trueAge);
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
		trueAges = shuffle_years(min_year, max_year, max_rounds);
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

<div class="container relative">
	<a class="leaderboard-link" href="/leaderboard">
		<span role="img" aria-label="Leaderboard">🏅</span>
	</a>
	
	<div style="position: absolute; top: 1rem; right: 1rem; z-index: 10;">
		<button class="help-btn" style="font-size: 2rem; padding: 1rem 1.5rem;" on:click={() => showIntroHelp = true}>
			<span role="img" aria-label="Help">❓</span>
		</button>
	</div>

	<IntroHelpModal
		show={showIntroHelp}
		on:close={() => (showIntroHelp = false)}
		{min_year}
		{max_year}
	/>
	

	<!-- Wrap header + input in a fixed-gap column -->
	<div class="flex flex-col gap-4 items-center">
		<div class="flex-none">
			<GameHeader
				{round}
				{max_rounds}
				{score}
				{min_year}
				{max_year}
				{submitted}
				{guessAge}
				{trueAge}
			/>
		</div>

		<!-- Fixed height or min-height to prevent shifting -->
		<div class="flex items-center gap-4 justify-center w-full">
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
				{era}
				{setEra}
				{finished}
				setFinished={(val) => (finished = val)}
				setGuess={(val) => (guess = val)}
				setGuessAge={(val) => (guessAge = val)}
				setInputError={(val) => (inputError = val)}
				setSubmitted={(val) => (submitted = val)}
				setHintPenalty={(val) => (hint_penalty = val)}
				setRound={(val) => (round = val)}
				setTrueAge={(val) => (trueAge = val)}
				setTrueAges={(val) => (trueAges = val)}
			/>
		</div>
	</div>

	<GameOverModal
		show={round == max_rounds && finished}
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
		{round}
		{max_rounds}
		{score}
		{min_year}
		{max_year}
		{submitted}
		{guessAge}
		{formatYear}
		{era}
		on:hintPenaltyUpdate={(e) => {
			hint_penalty = e.detail;
			sessionStorage.setItem('hint_penalty', String(hint_penalty));
		}}
	/>

	<p class="text-center mt-4 text-sm text-gray-400">
		Learn more at <a href="https://seshat-db.com/core/world_map" target="_blank"
			>Seshat: Global History Databank</a
		>.
	</p>
</div>

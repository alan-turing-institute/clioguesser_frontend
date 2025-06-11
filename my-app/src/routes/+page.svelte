<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/Button.svelte';
	import { shuffle_years } from '$lib/Shuffle.js';
	import { goto } from '$app/navigation';

	async function pick_year({ min_year, max_year }) {
		return Math.floor(Math.random() * (max_year - min_year + 1)) + min_year;
	}

	let guess = '';
	let guessAge = '';
	let min_year = 1500;
	let max_year = 2024;
	let score = null;
	let api_score = 0;
	let trueAges: number[] = [];
	let trueAge: number | null = null;
	let round = null;
	let max_rounds = 10;
	let submitted = false;
	let initials = '';
	let initialsError = '';
	let inputError = '';

	async function fetchGeojsonFeatures() {
		try {
			console.log('Getting data for year:', trueAge);
			const response = await fetch(`http://localhost:8000/api/polities/?year=${trueAge}`, {
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include'
			});
			const jsonData = await response.json();

			const features = jsonData.shapes.map((shape) => {
				console.log('Shape name:', shape.name);
				return {
					geometry: JSON.parse(shape.geom_json),
					colour: shape.colour,
					shape_name: shape.member_of || shape.name // Use member_of if available, otherwise use name
				};
			});

			console.log('Parsed GeoJSON features:', features);
			return features;
		} catch (error) {
			console.error('Failed to fetch or parse GeoJSON:', error);
			return [];
		}
	}

	let map;

	async function updateMap() {
		const features = await fetchGeojsonFeatures();
		const groups = {}; // group_id -> LayerGroup
		features.forEach((feature) => {
			const layer = L.geoJSON(feature.geometry, {
				style: {
					color: 'black',
					weight: 1,
					opacity: 1,
					fill: true,
					fillColor: feature.colour,
					fillOpacity: 1
				}
			});

			const groupId = feature.shape_name; // Assuming shape_id is the group identifier
			if (!groups[groupId]) {
				groups[groupId] = L.layerGroup();
			}

			groups[groupId].addLayer(layer);
		});

		// Add hover events to each group
		Object.values(groups).forEach((group) => {
			group.eachLayer((layer) => {
				layer.on('mouseover', () => {
					group.eachLayer((l) => {
						l.setStyle({
							weight: 3,
							color: '#FFD700',
							fillOpacity: 1
						});
					});
				});

				layer.on('mouseout', () => {
					group.eachLayer((l) => {
						l.setStyle({
							weight: 1,
							color: 'black',
							fillOpacity: 1
						});
					});
				});
			});

			group.addTo(map);
		});
	}

	onMount(async () => {
		const L = await import('leaflet');

		// Retrieve values directly from session storage
		const storedTrueAgeStr = sessionStorage.getItem('trueAge');
		const storedRoundStr = sessionStorage.getItem('round');
		const storedScoreStr = sessionStorage.getItem('score');

		// Only generate new trueAge if it's not in storage
		if (storedTrueAgeStr !== null) {
			trueAge = Number(storedTrueAgeStr);
		} else {
			trueAges = shuffle_years(min_year, max_year);
			trueAge = trueAges.shift();
			sessionStorage.setItem('trueAge', String(trueAge));
		}

		// Populate trueAges
		if (!trueAges || trueAges.length === 0) {
			trueAges = shuffle_years(min_year, max_year).filter((year) => year !== trueAge);
		}

		// Round logic — default to 1 if not set
		if (storedRoundStr !== null) {
			round = Number(storedRoundStr);
		} else {
			round = 1;
			sessionStorage.setItem('round', '1');
		}

		// Score logic — default to 0 if not set
		if (storedScoreStr !== null) {
			score = Number(storedScoreStr);
		} else {
			score = 0;
			sessionStorage.setItem('score', '0');
		}

		// Map setup
		map = L.map('map', { crs: L.CRS.EPSG3857 }).setView([0, 0], 2);

		L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			{
				maxZoom: 10,
				minZoom: 1,
				attribution: '© ArcGIS, Powered by Esri'
			}
		).addTo(map);

		await updateMap();
	});

	async function getScore() {
		try {
			const response = await fetch(
				`http://localhost:8000/api/score/?min_year=${min_year}&max_year=${max_year}&true_year=${trueAge}&guess_year=${guessAge}`,
				{
					headers: {
						'Content-Type': 'application/json'
					},
					credentials: 'include'
				}
			);

			if (response.ok) {
				const data = await response.json();
				api_score = data.score;

				const current = Number(sessionStorage.getItem('score')) || 0;
				const updated = current + api_score;

				sessionStorage.setItem('score', updated.toString());

				// ✅ Manually update score to trigger reactivity
				score = updated;

				console.log('Score updated:', api_score);
			} else {
				console.error('Failed to fetch score:', response.statusText);
			}
		} catch (error) {
			console.error('Error occurred while fetching score:', error);
		}
	}

	async function submitLeaderboard(initials: string): Promise<boolean> {
		if (initials.length !== 3) {
			initialsError = 'Initials must be exactly 3 characters.';
			return false;
		}

		initialsError = '';

		try {
			const response = await fetch('http://localhost:8000/api/leaderboard/update/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: new URLSearchParams({
					initials,
					score: score.toString()
				})
			});

			if (response.ok) {
				const data = await response.json();
				console.log('Leaderboard submission successful:', data);
				return true;
			} else {
				console.error('Failed to submit to leaderboard:', response.statusText);
				initialsError = 'Failed to submit score. Please try again.';
				return false;
			}
		} catch (error) {
			console.error('Error occurred while submitting to leaderboard:', error);
			initialsError = 'An error occurred. Please try again.';
			return false;
		}
	}
	async function resetGame() {
		sessionStorage.setItem('score', '0');
		sessionStorage.setItem('round', '1');

		trueAges = shuffle_years(min_year, max_year);
		trueAge = trueAges.shift();
		sessionStorage.setItem('trueAge', trueAge!.toString());

		score = 0;
		round = 1;
		guess = '';
		guessAge = '';
		submitted = false;

		await updateMap();
	}
</script>

<div class="container">
	<a class="leaderboard-link" href="/leaderboard">
		<span role="img" aria-label="Leaderboard">🏅</span>
	</a>
	<h1>Clioguesser</h1>

	<p>Do you think you know your history? Guess the age of this map based on the polity outlines.</p>
	<p>Round {round} of {max_rounds}</p>
	<p>Current score: {score}</p>
	<p>
		Do you think you know your history? Guess the age of this map based on the polity outlines. The
		maps cover the years {min_year} CE to {max_year} CE.
	</p>

	<p>
		Age:
		<input bind:value={guess} placeholder="enter your guess" />
		{#if submitted === false}
			<Button
				class="primary sm"
				on:click={async () => {
					inputError = '';
					if (isNaN(Number(guess)) || guess.trim() === '') {
						inputError = 'Please enter a valid number.';
						return;
					}
					if (Number(guess) < min_year || Number(guess) > max_year) {
						inputError = `Please enter a number between ${min_year} and ${max_year}.`;
						return;
					}
					guessAge = guess;
					await getScore();
					submitted = true;
				}}>Submit</Button
			>
		{:else if round < max_rounds}
			<Button
				class="primary sm"
				on:click={async () => {
					submitted = false;
					round += 1;
					sessionStorage.setItem('round', round.toString());
					trueAge = trueAges.shift();
					sessionStorage.setItem('trueAge', String(trueAge));
					await updateMap();
					guess = '';
					guessAge = '';
				}}
			>
				Next
			</Button>
		{:else}
			<Button
				class="primary sm"
				on:click={async () => {
					submitted = false;
					round += 1;
					sessionStorage.setItem('round', round.toString());
				}}>Finish</Button
			>
		{/if}
		<Button
			class="secondary sm"
			on:click={async () => {
				await resetGame();
			}}>Restart game</Button
		>
		{#if inputError}
			<span style="color: red;">{inputError}</span>
		{/if}
	</p>

	{#if round > max_rounds}
		<div class="modal-backdrop">
			<div class="modal-content">
				<h2 class="text-xl font-bold mb-2">Game Over</h2>
				<p>Your final score is <strong>{score}</strong> points.</p>

				<div class="mt-4">
					<label for="initials" class="block mb-2 font-medium">Enter your initials:</label>
					<input
						id="initials"
						type="text"
						bind:value={initials}
						maxlength="3"
						placeholder="ABC"
						class="w-full px-3 py-2 border rounded-md text-black text-center uppercase font-bold"
					/>
					{#if initialsError}
						<p class="text-red-500 text-sm mt-1">{initialsError}</p>
					{/if}
				</div>

				<div class="button-row">
					<Button
						class="primary sm"
						on:click={async () => {
							const success = await submitLeaderboard(initials);
							if (success) {
								goto('/leaderboard');
							}
						}}
					>
						Submit to Leaderboard
					</Button>

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

	{#if submitted === true}
		<p>
			The actual age of the map is {trueAge} CE.
		</p>
		<p>
			{#if guessAge == trueAge}
				<span class="correct">Correct! Very impressive</span>
			{:else if Math.abs(guessAge - trueAge) < 50}
				<span class="incorrect"
					>Nearly! You were only off by {Math.abs(guessAge - trueAge)} years, good try</span
				>
			{:else}
				<span class="incorrect"
					>Incorrect! You were out by {Math.abs(guessAge - trueAge)} years, oh dear</span
				>
			{/if}
		</p>
		<!-- <p>Score: {score}</p> -->
	{/if}

	<div id="map"></div>
	<p>
		Based on <a href="https://seshat-db.com/">Seshat: Global History Databank</a>.
	</p>
</div>

<style>
	.leaderboard-link {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;
		width: 100px;
		height: 100px;
		pointer-events: auto;
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		transition: transform 0.15s;
	}
	.leaderboard-link span {
		font-size: 80px;
		width: 100px;
		height: 100px;
		display: block;
		line-height: 1;
		user-select: none;
		pointer-events: none;
	}
	.leaderboard-link:hover {
		transform: scale(1.08) rotate(-2deg);
	}
</style>

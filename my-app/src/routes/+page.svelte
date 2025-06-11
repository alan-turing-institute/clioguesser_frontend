<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/Button.svelte';
	import { shuffledYears } from '$lib/Shuffle.js';

	async function pick_year({ min_year, max_year }) {
		return Math.floor(Math.random() * (max_year - min_year + 1)) + min_year;
	}

	let guess = '';
	let guessAge = '';
	let min_year = 1500;
	let max_year = 2024;
	let score = 0;
	let api_score = 0;
	let trueAge = null;
	let round = 1;
	let max_rounds = 1;
	let submitted = false;
	let initials = null;
	let initialsError = '';

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
		// TODO: Update so we use this instead of a random year
		console.log('First year', shuffledYears.shift());
		const L = await import('leaflet');
		trueAge = await pick_year({ min_year, max_year });
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
		const stored = Number(sessionStorage.getItem('score'));
		score = isNaN(stored) ? 0 : stored;
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

	async function submitLeaderboard(initials: string) {
		if (initials.length !== 3) {
			initialsError = 'Initials must be exactly 3 characters.';
			return;
		}
		initialsError = ''; // clear previous error

		try {
			const response = await fetch(
				`http://localhost:8000/api/leaderboard/?initials=${initials}&score=${score}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				}
			);

			if (response.ok) {
				const data = await response.json();
				console.log('Leaderboard submission successful:', data);
			} else {
				console.error('Failed to submit to leaderboard:', response.statusText);
			}
		} catch (error) {
			console.error('Error occurred while submitting to leaderboard:', error);
		}
	}
	async function resetGame() {
		sessionStorage.setItem('score', '0');
		score = 0;
		guess = '';
		guessAge = '';
		round = 1;
		submitted = false;
		trueAge = await pick_year({ min_year, max_year });
		updateMap();
	}
</script>

<div class="container">
	<h1>Clioguesser</h1>

	<p>Do you think you know your history? Guess the age of this map based on the polity outlines.</p>
	<p>Round {round} of {max_rounds}</p>
	<p>Current score: {score}</p>

	<p>
		Age:
		<input bind:value={guess} placeholder="enter your guess" />
		{#if submitted === false}
			<Button
				class="primary sm"
				on:click={async () => {
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
					trueAge = await pick_year({ min_year, max_year });
					await updateMap();
					guess = '';
					guessAge = '';
				}}>next</Button
			>
		{:else}
			<Button
				class="primary sm"
				on:click={async () => {
					submitted = false;
					round += 1;
				}}>Finish</Button
			>
		{/if}
		<Button
			class="secondary sm"
			on:click={async () => {
				await resetGame();
			}}>Restart game</Button
		>
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
					<Button class="primary sm" on:click={() => submitLeaderboard(initials)}>
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
			The actual age of the map is {trueAge} years.
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

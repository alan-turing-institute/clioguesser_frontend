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
	let score = null;
	let trueAge = null;

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
							fillOpacity: 0.7
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
			score = data.score;

			const sessionScore = sessionStorage.getItem('score');
			if (sessionScore === null) {
				sessionStorage.setItem('score', score.toString());
			} else {
				const newScore = parseInt(sessionScore, 10) + score;
				sessionStorage.setItem('score', newScore.toString());
			}

			console.log('Score updated:', score);
			console.log('Session score:', sessionStorage.getItem('score'));
		} else {
			score = 'Error fetching score';
			console.error('Failed to fetch score:', response.statusText);
		}
	} catch (error) {
		score = 'Error fetching score';
		console.error('Error occurred while fetching score:', error);
	}
}
</script>

<div class="container">
	<h1>Clioguesser</h1>

	<p>Do you think you know your history? Guess the age of this map based on the polity outlines.</p>

	<p>
		Age:
		<input bind:value={guess} placeholder="enter your guess" />
		<Button
			class="primary sm"
			on:click={async () => {
				guessAge = guess;
				await getScore();
			}}>Submit</Button
		>
	</p>

	{#if score !== null}
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
		<p>Score: {score}</p>
	{/if}

	<div id="map"></div>
	<p>
		Based on <a href="https://seshat-db.com/">Seshat: Global History Databank</a>.
	</p>
</div>

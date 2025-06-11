<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/Button.svelte';
	import { shuffle_years } from '$lib/shuffle.js';

	async function pick_year({ min_year, max_year }) {
		return Math.floor(Math.random() * (max_year - min_year + 1)) + min_year;
	}

	let guess = '';
	let guessAge = '';
	let min_year = 1500;
	let max_year = 2024;
	let score = null;
	let trueAge = null;
	let hint_penalty: number = 100.0; // The penalty for using a hint, in years

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

	async function updateMap(l) {
		// l is L (leaflet)
		const features = await fetchGeojsonFeatures();
		const groups = {}; // group_id -> LayerGroup
		features.forEach((feature) => {
			const layer = l.geoJSON(feature.geometry, {
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
				let layer_group = l.layerGroup();
				layer_group.the_name = feature.shape_name;
				groups[groupId] = layer_group;
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

				layer.on('mouseup', (event) => {
					// On a mouse up event, add a popup with the shape name
					layer
						.bindTooltip(group.the_name, {
							permanent: false,
							direction: 'top',
							className: 'custom-tooltip' // Optional: for custom styling
						})
						.openTooltip(event.latlng);
						hint_penalty *= 0.9; // Reduce the hint penalty by 10% on each click
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
		const L = await import('leaflet');
		let trueAges = shuffle_years(min_year, max_year);
		trueAge = trueAges.shift();

		map = L.map('map', { crs: L.CRS.EPSG3857 }).setView([0, 0], 2);

		L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			{
				maxZoom: 10,
				minZoom: 1,
				attribution: '© ArcGIS, Powered by Esri'
			}
		).addTo(map);
		await updateMap(L);
	});

	async function getScore() {
		let multiplier = 365 * (hint_penalty / 100.0);
		const response = await fetch(
			`http://localhost:8000/api/score/?min_year=${min_year}&max_year=${max_year}&true_year=${trueAge}&guess_year=${guessAge}&multiplier=${multiplier}`,
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
		} else {
			score = 'Error fetching score';
		}
	}
</script>

<div class="container">
	<a class="leaderboard-link" href="/leaderboard">
		<span role="img" aria-label="Leaderboard">🏅</span>
	</a>
	<h1>Clioguesser</h1>

	<div>
		<p>Do you think you know your history? Guess the age of this map based on the polity outlines.</p>

		<p class="two-column-row">
			<span class="left-align">
				Hint Penalty: {Math.round(hint_penalty)}%
			</span>
			<span class="right-align">
				Age:
				<input bind:value={guess} placeholder="enter your guess" />
				<Button
					class="primary sm"
					on:click={async () => {
						guessAge = guess;
						await getScore();
					}}>Submit</Button
				>
			</span>
		</p>
	</div>	

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

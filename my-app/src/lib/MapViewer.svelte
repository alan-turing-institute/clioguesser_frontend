<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchGeojsonFeatures } from '$lib/api';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let round: number;
	export let max_rounds: number;
	export let score: number;
	export let min_year: number;
	export let max_year: number;
	export let submitted: boolean;
	export let guessAge: string;
	export let showIntroHelp: boolean;
	export let formatYear: (y: number) => string;

	let highlightedCountry: string | null = null;

	export let trueAge: number;
	export let hint_penalty: number;
	export let onHintUsed: (penalty: number) => void;
	export let era: 'CE' | 'BCE';

	let map;
	let L: any;
	let layers: any[] = [];

	onMount(async () => {
		L = await import('leaflet');

		map = L.map('map', {
			crs: L.CRS.EPSG3857,
			maxBounds: [
				[-85, -180],
				[85, 180]
			],
			maxBoundsViscosity: 1.0 // Prevents panning outside bounds
		}).setView([20, 0], 2); // Centered 20° north of the equator

		map.createPane('borders');
		map.getPane('borders').style.zIndex = '650';

		L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			{ maxZoom: 10, minZoom: 2 }
		).addTo(map);

		await renderMap(); // initial load
	});

	$: trueAge, renderMap(); // re-run when trueAge changes

	async function renderMap() {
		if (!map || !L || !trueAge) return;

		// Clear old layers
		layers.forEach((layer) => map.removeLayer(layer));
		layers = [];

		const features = await fetchGeojsonFeatures(trueAge);
		const groups = {};

		for (const feature of features) {
			const geoLayer = L.geoJSON(feature.geometry, {
				style: {
					color: 'black',
					weight: 1,
					opacity: 1,
					fill: true,
					fillColor: feature.colour,
					fillOpacity: 1
				}
			});

			const groupId = feature.shape_name;
			if (!groups[groupId]) {
				let groupLayer = L.layerGroup();
				groupLayer.the_name = groupId;
				groups[groupId] = groupLayer;
			}

			groups[groupId].addLayer(geoLayer);
		}

		Object.values(groups).forEach((group) => {
			group.wasClicked = false; // Add a custom flag to the group

			group.eachLayer((layer) => {
				layer.options.pane = 'borders';

				layer.on('mouseover', () => {
					group.eachLayer((l) => {
						l.setStyle({ weight: 3, color: '#FFD700', fillOpacity: 1 });
						l.bringToFront(); // 💡 ensures the highlighted outline goes above others
					});

					if (group.wasClicked) {
						highlightedCountry = group.the_name;
					} else {
						highlightedCountry = null;
					}
				});

				layer.on('mouseup', () => {
					if (group.wasClicked) return; // Only allow first click

					group.wasClicked = true;
					highlightedCountry = group.the_name;

					const newPenalty = hint_penalty * 0.95;
					dispatch('hintPenaltyUpdate', newPenalty);
				});

				layer.on('mouseout', () => {
					group.eachLayer((l) => l.setStyle({ weight: 1, color: 'black', fillOpacity: 1 }));
				});
			});

			group.addTo(map);
			layers.push(group);
		});
	}

	function getEraAdjustedGuess(guess: string, era: 'BCE' | 'CE'): number {
		const n = Math.abs(Number(guess));
		return era === 'BCE' ? -n : n;
	}

	function formatEraAdjustedYear(year: number): string {
		return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
	}

	function formatScore(score: number): string {
		return new Intl.NumberFormat('en-US').format(score);
	}

	$: adjustedGuess = getEraAdjustedGuess(guessAge, era);
	$: errorMargin = Math.abs(adjustedGuess - trueAge);
</script>

<!-- <div id="map" class="map-container"></div> -->

<div class="map-wrapper">
	<div id="map" class="map-container"></div>
	{#if showIntroHelp === false}
		<div
			class="bg-white/80 dark:bg-black/60 text-black dark:text-white p-4 rounded shadow max-w-sm text-sm absolute top-2 right-2 z-[1000] pointer-events-none"
		>
			<div class="text-red-600 text-xl font-bold">Round {round}/{max_rounds}</div>
			<div class="text-black dark:text-white text-xl">
				<span class="font-bold">Current score:</span>
				<span class="font-normal ml-1">{formatScore(score)}</span>
			</div>
		</div>
		{#if submitted}
			<div
				class="absolute top-2 left-15 transform
	       bg-white/80 dark:bg-black/60 text-black dark:text-white
	       p-4 rounded shadow max-w-sm text-sm z-[1000] pointer-events-none"
			>
				<div class="text-red-600 text-xl font-bold">
					You guessed {formatEraAdjustedYear(guessAge)}
				</div>

				<div class="text-red-600 text-xl font-bold">
					The true year was {formatEraAdjustedYear(trueAge)}
				</div>

				<div class="text-red-600 text-xl font-bold">
					You were off by {errorMargin} years
				</div>
			</div>
		{/if}
		<div
			class="
				absolute bottom-4 left-4 bg-white/80 text-black dark:text-white
				dark:bg-black/60 px-6 py-3 rounded-xl shadow-2xl z-[1001]
			    text-lg font-bold border border-white dark:border-black backdrop-blur-sm
				pointer-events-none w-[250px] h-[100px] flex flex-col justify-start
				items-center text-center gap-1"
		>
			<div class="text-base font-semibold">Current Hint</div>
			<div
				class="w-full text-center font-normal leading-tight whitespace-pre-wrap break-words"
				style="font-size: clamp(0.75rem, 3.5vw, 1.125rem); line-height: 1.1;"
			>
				{highlightedCountry || ''}
			</div>
		</div>
	{/if}
</div>

<!-- 		{#if submitted && trueAge !== null}
			<p>The actual year of the map is {formatYear(trueAge)}.</p>
			<p>
				{#if guessAge == String(trueAge)}
					<span class="correct">Correct! Very impressive</span>
				{:else if Math.abs(Number(guessAge) - trueAge) < 50}
					<span class="incorrect"
						>Nearly! You were off by {Math.abs(Number(guessAge) - trueAge)} years.</span
					>
				{:else}
					<span class="incorrect"
						>Incorrect! You were off by {Math.abs(Number(guessAge) - trueAge)} years.</span
					>
				{/if}
			</p>
		{/if} -->

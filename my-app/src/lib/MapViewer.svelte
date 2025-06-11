<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchGeojsonFeatures } from '$lib/api';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let trueAge: number;
	export let hint_penalty: number;
	export let onHintUsed: (penalty: number) => void;

	let map;
	let L: any;
	let layers: any[] = [];

	onMount(async () => {
		L = await import('leaflet');

		map = L.map('map', {
			crs: L.CRS.EPSG3857
		}).setView([0, 0], 2);

		map.createPane('borders');
		map.getPane('borders').style.zIndex = '650';

		L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			{ maxZoom: 10, minZoom: 1 }
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
			group.eachLayer((layer) => {
				layer.options.pane = 'borders';

				layer.on('mouseover', () => {
					group.eachLayer((l) => l.setStyle({ weight: 3, color: '#FFD700', fillOpacity: 1 }));
				});

				layer.on('mouseup', (event) => {
					if (!layer._tooltip) {
						layer
							.bindTooltip(group.the_name, {
								permanent: false,
								direction: 'top',
								className: 'custom-tooltip'
							})
							.openTooltip(event.latlng);

						const newPenalty = hint_penalty * 0.9;
						dispatch('hintPenaltyUpdate', newPenalty);
					}
				});

				layer.on('mouseout', () => {
					group.eachLayer((l) => l.setStyle({ weight: 1, color: 'black', fillOpacity: 1 }));
				});
			});

			group.addTo(map);
			layers.push(group);
		});
	}
</script>

<div id="map" class="map-container"></div>

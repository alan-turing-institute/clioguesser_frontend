<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchGeojsonFeatures } from '$lib/api'; // move fetch out here

  export let trueAge: number;
  export let hint_penalty: number;
  export let onHintUsed: (penalty: number) => void;

  let map;
  let L: any;

  onMount(async () => {
    L = await import('leaflet');
    map = L.map('map', { crs: L.CRS.EPSG3857 }).setView([0, 0], 2);

    map.createPane('borders');
    map.getPane('borders').style.zIndex = '650';

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 10, minZoom: 1 }
    ).addTo(map);

    await renderMap();
  });

  async function renderMap() {
    const features = await fetchGeojsonFeatures(trueAge);

    const groups = {};
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

      const groupId = feature.shape_name;
      if (!groups[groupId]) {
        let layerGroup = L.layerGroup();
        layerGroup.the_name = groupId;
        groups[groupId] = layerGroup;
      }

      groups[groupId].addLayer(layer);
    });

    Object.values(groups).forEach((group) => {
      group.eachLayer((layer) => {
        layer.options.pane = 'borders';

        layer.on('mouseover', () => {
          group.eachLayer((l) =>
            l.setStyle({ weight: 3, color: '#FFD700', fillOpacity: 1 })
          );
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
            onHintUsed(newPenalty);
          }
        });

        layer.on('mouseout', () => {
          group.eachLayer((l) =>
            l.setStyle({ weight: 1, color: 'black', fillOpacity: 1 })
          );
        });
      });

      group.addTo(map);
    });
  }
</script>

<div id="map" class="map-container"></div>

<!-- <style>
  .map-container {
    height: 100vh;
    width: 100%;
  }
</style> -->

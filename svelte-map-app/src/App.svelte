<script>
  import { onMount } from "svelte";
  import L from "leaflet";
  import Button from "./lib/Button.svelte"
  
  let guess = $state('');
  let guessAge = $state('');
  let trueAge = 1745
  let geojsonFeature = {
    type: "MultiPolygon",
    coordinates: [
      [
        [
          [6.16488075, 50.04647446],
          [6.16281986, 50.11296082],
          [6.07890368, 50.11296082],
          [6.0768013, 50.17946243],
          [5.74549675, 50.04647446],
          [5.84482479, 49.58156967],
          [6.09980154, 49.4488945],
          [6.34645844, 49.58156967],
          [6.33857012, 49.84712601],
          [6.16693926, 49.98000717],
          [6.16488075, 50.04647446],
        ],
      ],
    ],
  };
  

  let map;

  onMount(() => {
    map = L.map("map", { crs: L.CRS.EPSG3857 }).setView([0, 0], 2);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 10,
        minZoom: 1,
        attribution: "© ArcGIS, Powered by Esri",
      },
    ).addTo(map);

    L.geoJSON(geojsonFeature).addTo(map);
  });
</script>
<main>
  <h1>Clioguesser</h1>
  <p>Do you think you know your history? Guess the age of this map based on the polity outlines.</p>
  <p>Age (to the nearest decade):</p>

  <input bind:value={guess} placeholder="enter your guess" />
  <Button class="primary sm" on:click={() => guessAge = guess}>
    Submit
  </Button>

  <p>Your guess: {guessAge || ''} CE</p>

  <div id="map"></div>
  <p> Based on <a href="https://seshat-db.com/">Seshat: Global History Databank</a>.</p>
</main>
<!-- <main>
  <div id="map"></div>
  <div>
    <a href="https://vite.dev" target="_blank" rel="noreferrer">
      <img src={viteLogo} class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>
  <h1>Viteeeee + Svelte</h1>

  <div class="card">
    <Counter />
  </div>

  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">
    Click on the Vite and Svelte logos to learn more
  </p>
</main> -->

<style>
  #map {
    height: 100vh;
  }
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>

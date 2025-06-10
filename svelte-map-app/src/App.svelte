<script>
  import { onMount } from "svelte";
  import L from "leaflet";
  import Button from "./lib/Button.svelte";

  let guess = $state("");
  let guessAge = $state("");
  // eslint-disable-next-line no-unused-vars
  let trueAge = 1745;

  async function fetchGeojsonFeatures() {
    try {
      const response = await fetch(
        `http://localhost:8000/api/polities/?year=${trueAge}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );
      const jsonData = await response.json();

      const features = jsonData.shapes.map((shape) => {
        return JSON.parse(shape.geom_json);
      });

      console.log("Parsed GeoJSON features:", features);
      return features;
    } catch (error) {
      console.error("Failed to fetch or parse GeoJSON:", error);
      return [];
    }
  }

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

    (async () => {
      const features = await fetchGeojsonFeatures();
      features.forEach((feature) => {
        L.geoJSON(feature, {
          style: {
            color: "#ff7800",
            weight: 2,
            opacity: 0.8,
          },
        }).addTo(map);
      });
    })();
  });
</script>

<main>
  <h1>Clioguesser</h1>
  
  <p>
    Do you think you know your history? Guess the age of this map based on the
    polity outlines.
  </p>
  
  <p>Age:
    <input bind:value={guess} placeholder="enter your guess" />
    <Button class="primary sm" on:click={() => (guessAge = guess)}>Submit</Button>
  </p>

  <p>Your guess: {guessAge || ""} CE</p>

  <div id="map"></div>
  <p>
    Based on <a href="https://seshat-db.com/">Seshat: Global History Databank</a
    >.
  </p>
</main>

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

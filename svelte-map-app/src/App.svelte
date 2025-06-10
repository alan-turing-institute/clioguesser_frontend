<script>
  import { onMount } from "svelte";
  import L from "leaflet";
  import Button from "./lib/Button.svelte";
  import { shuffledYears } from "./lib/Shuffle.js";

  let guess = $state("");
  let guessAge = $state("");
  let trueAge = 1745;

  function getCentroid(polygon) {
    // console.log("lng_lat", multipolygon);
    // let polygon = multipolygon.coordinates[0];
    // if (!polygon) {
      // return;
    // }
    console.log("polygon", polygon.length);
    // console.log("polygon[0]", polygon[0].length);
    let first_loop = polygon[0];
    if (!first_loop) {
      return;
    }
    let x = 0, y = 0, n = 0;
    first_loop.forEach(([lng,lat]) => {
      x += lng;
      y += lat;
      n++;
    });
    return [y / n, x / n]; // [lat, lng]
    // return [0,0];
  }

  async function fetchGeojsonFeatures() {
    try {
      console.log("Getting data for year:", trueAge);
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
        return {
          geometry: JSON.parse(shape.geom_json),
          colour: shape.colour,
          name: shape.name,
        };
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
    console.log("First year", shuffledYears.shift());

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
        if (feature.name !== "Spanish Empire") {
          return;
        }
        feature.geometry.coordinates.forEach((polygon) => {
          let centroid = getCentroid(polygon);
          L.marker(
            [centroid[0],centroid[1]],
            {title: feature.name}
          ).addTo(map);
        });
        console.log("Centroid for feature:", feature.name, feature.geometry.type);
        L.geoJSON(feature.geometry, {
          style: {
            color: "black",
            weight: 1,
            opacity: 1,
            fill: true,
            fillColor: feature.colour,
            fillOpacity: 1,
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

<script>
	import { onMount } from 'svelte';
	import Button from '$lib/Button.svelte';
	import { shuffledYears } from '$lib/Shuffle.js';

	async function pick_year({ min_year, max_year }) {
		return Math.floor(Math.random() * (max_year - min_year + 1)) + min_year;
	}

  let guess = "";
  let guessAge = "";
  let min_year = 1500;
  let max_year = 2024;
  let score = null;
  let trueAge = null;
  let inputError = "";

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
  
  async function updateMap() {
		const features = await fetchGeojsonFeatures();
		features.forEach((feature) => {
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
	}

	async function getNewMap() {
		await updateMap();
	}


	onMount(async () => {
    // TODO: Update so we use this instead of a random year
    console.log("First year", shuffledYears.shift());
		const L = await import('leaflet');
		trueAge = await pick_year({ min_year, max_year });
    map = L.map("map", { crs: L.CRS.EPSG3857 }).setView([0, 0], 2);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 10,
        minZoom: 1,
        attribution: "© ArcGIS, Powered by Esri",
      },
    ).addTo(map);
		await updateMap();
  });
  async function getScore() {
    const response = await fetch(
      `http://localhost:8000/api/score/?min_year=${min_year}&max_year=${max_year}&true_year=${trueAge}&guess_year=${guessAge}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (response.ok) {
      const data = await response.json();
      score = data.score;
    } else {
      score = "Error fetching score";
    }
  }
</script>

<div class="container">
	<h1>Clioguesser</h1>

  <p>
    Do you think you know your history? Guess the age of this map based on the
    polity outlines. Maps cover the period from {min_year} CE to {max_year} CE.
  </p>

  <p>
    <input bind:value={guess} placeholder="enter your guess" />
    <Button
      class="primary sm"
      on:click={async () => {
        inputError = "";
        if (isNaN(Number(guess)) || guess.trim() === "") {
          inputError = "Please enter a valid number.";
          return;
        }
        if (guess < min_year || guess > max_year) {
          inputError = `Please enter a number between ${min_year} and ${max_year}.`;
          return;
        }
        guessAge = Number(guess);
        await getScore();
      }}>Submit</Button
    >
    {#if inputError}
      <span style="color: red;">{inputError}</span>
    {/if}
    
  </p>

  {#if score !== null}
    <p>
      The actual age of the map is {trueAge} CE.
    </p>
    <p>
      {#if guessAge == trueAge}
        <span class="correct">Correct! Very impressive</span>
      {:else if Math.abs(guessAge - trueAge) < 50}
        <span class="incorrect"
          >Nearly! You were only off by {Math.abs(guessAge - trueAge)} years, good
          try</span
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
    Based on <a href="https://seshat-db.com/">Seshat: Global History Databank</a
    >.
  </p>
</div>

<style>
	html, body, #svelte {
		height: 100%;
		margin: 0;
		padding: 0;
	}
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		width: 100vw;
		overflow: hidden;
	}
	.center-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-bottom: 1rem;
		z-index: 2;
		padding: 2rem 2rem 1rem 2rem;
		border-radius: 1rem;
		box-shadow: 0 2px 16px rgba(0,0,0,0.08);
		max-width: 90vw;
	}
	#map {
		flex: 1 1 auto;
		height: 60vh;
		width: 90vw;
		max-width: 1200px;
		max-height: 70vh;
		margin: 1rem auto;
		border-radius: 1rem;
		overflow: hidden;
		box-shadow: 0 2px 16px rgba(0,0,0,0.08);
		z-index: 1;
	}
	.footer {
		text-align: center;
		margin-top: 0.5rem;
		color: #888;
		z-index: 2;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
	}
	input {
		margin-right: 0.5rem;
		color:black
	}
</style>

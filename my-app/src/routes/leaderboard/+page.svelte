<script>
	import { onMount } from 'svelte';
  const API_HOST = import.meta.env.VITE_API_HOST;

	let leaderboard = [];
	let loading = true;
	let error = null;

	onMount(() => {
		const eventSource = new EventSource(`${API_HOST}/api/leaderboard/stream/`);

		eventSource.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				leaderboard = Array.isArray(data) ? data : [];
				loading = false;
			} catch (e) {
				error = 'Invalid leaderboard data received';
			}
		};

		eventSource.onerror = (e) => {
			console.error('Leaderboard SSE connection error:', e);
			error = 'Connection to leaderboard updates lost.';
			eventSource.close(); // Optional: close stream on error
		};

		// Cleanup on component destroy
		return () => {
			eventSource.close();
		};
	});
</script>

<a class="map-link" href="/">
	<span role="img" aria-label="Map">🗺️</span>
</a>

<main>
	<h1>🏆 Top scorers 🕹️</h1>

	{#if loading}
		<p>Loading...</p>
	{:else if error}
		<p style="color: #ffe600; background: #ff0033; padding: 0.5rem 1rem; border-radius: 8px;">
			{error}
		</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th>Rank</th>
					<th>Name</th>
					<th>Score</th>
				</tr>
			</thead>
			<tbody>
				{#each leaderboard.slice().sort((a, b) => b.score - a.score) as player, i}
					<tr>
						<td>{i + 1}</td>
						<td>{player.initials}</td>
						<td>{Intl.NumberFormat('en-US').format(player.score)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
	<p>
		Learn more at <a href="https://seshat-db.com/core/world_map" target="_blank">Seshat: Global History Databank</a>.
	</p>
</main>

<!--
Tip: Place a map image at /static/map_icon.png or update the src above to your preferred image!
-->

<style>
	.map-link {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;
		pointer-events: auto;
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		transition: transform 0.15s;
	}
	.map-link span {
		font-size: 100px;
		display: block;
		line-height: 1;
		user-select: none;
		pointer-events: none;
	}
	.map-link:hover {
		transform: scale(1.03) rotate(-2deg);
	}

	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-family: 'Press Start 2P', 'VT323', 'Courier New', Courier, monospace;
		background: linear-gradient(135deg, #1a1a40 0%, #3a1c71 100%);
		min-height: 100vh;
		color: #fff;
		padding-bottom: 3rem;
		width: 100vw;
		min-width: 100vw;
		box-sizing: border-box;
		position: relative;
	}

	h1 {
		font-size: 3.5rem;
		margin: 3rem 0 2rem 0;
		letter-spacing: 0.15em;
		text-shadow:
			0 0 12px #ff00cc,
			0 0 24px #3333ff;
		text-align: center;
	}

	table {
		margin-top: 2rem;
		border-collapse: separate;
		border-spacing: 0;
		background: rgba(30, 30, 60, 0.97);
		border-radius: 24px;
		box-shadow:
			0 0 48px #ff00cc88,
			0 0 16px #3333ff88;
		overflow: hidden;
		min-width: 700px;
		max-width: 90vw;
		width: 80vw;
		font-size: 1.4rem;
	}

	th,
	td {
		padding: 1.5rem 2.5rem;
		text-align: center;
		font-size: 1.3rem;
		border-bottom: 2px solid #ff00cc55;
		letter-spacing: 0.07em;
	}

	th {
		background: #ff00cc;
		color: #fff;
		text-shadow: 0 0 6px #3333ff;
		font-size: 1.3rem;
		border-bottom: 4px solid #3333ff;
	}

	tr:nth-child(even) td {
		background: #222255cc;
	}

	tr:nth-child(odd) td {
		background: #333377cc;
	}

	tr:first-child td {
		font-size: 1.6rem;
		color: #ffe600;
		text-shadow:
			0 0 12px #ff00cc,
			0 0 6px #fff;
		font-weight: bold;
		background: linear-gradient(90deg, #ff00cc 0%, #3333ff 100%);
		border-top: 2px solid #ffe600;
	}

	td {
		transition:
			background 0.2s,
			color 0.2s;
	}

	tr:hover td {
		background: #ff00cc66;
		color: #fff;
	}

	#map {
		margin-top: 3rem;
		width: 90vw;
		max-width: 1200px;
		min-height: 240px;
		border-radius: 18px;
		background: #222244;
		box-shadow: 0 0 24px #3333ff55;
	}

	a {
		color: #ffe600;
		text-shadow: 0 0 6px #ff00cc;
		transition: color 0.2s;
	}
	a:hover {
		color: #ff00cc;
	}

	p {
		margin-top: 2rem;
		font-size: 1.2rem;
		text-align: center;
		text-shadow: 0 0 3px #3333ff;
	}

	@media (max-width: 900px) {
		.map-link {
			top: 0.7rem;
			left: 0.7rem;
		}
		table {
			min-width: 340px;
			width: 98vw;
			font-size: 1rem;
		}
		th,
		td {
			padding: 0.7rem 0.5rem;
			font-size: 1rem;
		}
		#map {
			min-height: 120px;
		}
		h1 {
			font-size: 2rem;
		}
	}
</style>

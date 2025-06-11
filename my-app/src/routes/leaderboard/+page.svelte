<script>
  import { onMount } from 'svelte';

  let leaderboard = [];
  let loading = true;
  let error = null;

  onMount(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/leaderboard/');
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const data = await res.json();
      leaderboard = Array.isArray(data.leaderboard) ? [...data.leaderboard] : [];
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });
</script>

<style>
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
  }

  h1 {
    font-size: 3.5rem;
    margin: 3rem 0 2rem 0;
    letter-spacing: 0.15em;
    text-shadow: 0 0 12px #ff00cc, 0 0 24px #3333ff;
    text-align: center;
  }

  table {
    margin-top: 2rem;
    border-collapse: separate;
    border-spacing: 0;
    background: rgba(30, 30, 60, 0.97);
    border-radius: 24px;
    box-shadow: 0 0 48px #ff00cc88, 0 0 16px #3333ff88;
    overflow: hidden;
    min-width: 700px;
    max-width: 90vw;
    width: 80vw;
    font-size: 1.4rem;
  }

  th, td {
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
    text-shadow: 0 0 12px #ff00cc, 0 0 6px #fff;
    font-weight: bold;
    background: linear-gradient(90deg, #ff00cc 0%, #3333ff 100%);
    border-top: 2px solid #ffe600;
  }

  td {
    transition: background 0.2s, color 0.2s;
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
    table {
      min-width: 340px;
      width: 98vw;
      font-size: 1rem;
    }
    th, td {
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

<main>
  <h1>🏆 Top scorers 🕹️</h1>

  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p style="color: #ffe600; background: #ff0033; padding: 0.5rem 1rem; border-radius: 8px;">{error}</p>
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
            <td>{player.score}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  <div id="map"></div>
  <p>
    Based on <a href="https://seshat-db.com/" target="_blank">Seshat: Global History Databank</a>.
  </p>
</main>

<!--
Tip: For the best arcade look, add the "Press Start 2P" or "VT323" font from Google Fonts in your main HTML!
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet">
-->
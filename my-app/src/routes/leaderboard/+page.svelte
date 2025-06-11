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

<main>
  <h1>Leaderboard</h1>

  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p style="color: red;">{error}</p>
  {:else}
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {#each leaderboard.slice().sort((a, b) => b.score - a.score) as player, i}
          <tr>
            <td>{player.initials}</td>
            <td>{player.score}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  <div id="map"></div>
  <p>
    Based on <a href="https://seshat-db.com/">Seshat: Global History Databank</a
    >.
  </p>
</main>
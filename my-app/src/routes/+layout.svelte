<script lang="ts">
	import '../app.css';
	import '$app/environment'; // optional, just ensures side effects load
  	import '../app.css';
	// export const prerender = true;

	let { children } = $props();
</script>

{@render children()}

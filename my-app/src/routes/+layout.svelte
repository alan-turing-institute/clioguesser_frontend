<script lang="ts">
	import '../app.css';
	import '$app/environment'; // optional, just ensures side effects load
  	import '../app.css';

	let { children } = $props();
</script>

{@render children()}

<script>
  import { fly } from "svelte/transition";
  export let enemy;
</script>

<g
  transform={`translate(${enemy.x}, ${enemy.y})`}
  out:fly={{ y: -5, duration: 200 }}>
  <rect width="30" height="30" fill="#212121" />
</g>

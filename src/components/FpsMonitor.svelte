<script>
  import { onDestroy } from "svelte";
  let tickId = null;
  const times = [];
  let fps;

  function refreshLoop() {
    tickId = window.requestAnimationFrame(() => {
      const now = performance.now();
      while (times.length > 0 && times[0] <= now - 1000) {
        times.shift();
      }
      times.push(now);
      fps = times.length;
      refreshLoop();
    });
  }
  onDestroy(() => {
    window.cancelAnimationFrame(tickId);
  });
  tickId = refreshLoop();
</script>

<style>
  .fps {
    position: fixed;
    right: 1rem;
    top: 1rem;
  }
</style>

<div class="fps">{fps} FPS</div>

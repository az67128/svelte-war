<script>
  import Controls from "./components/Controls.svelte";
  import FpsMonitor from "./components/FpsMonitor.svelte";
  import GameField from "./components/GameField.svelte";
  import Modal from "./components/Modal.svelte";
  import { isPlaying } from "./stores/game";
</script>

<style>
  :global(html) {
    height: 100%;
  }
  :global(body) {
    height: 100%;
    overscroll-behavior: none;
    user-select: none;
    margin: 0;
    background-color: #efefef;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }
</style>

<GameField />
<FpsMonitor />
<Controls />
<div>
  {#if !$isPlaying}
    <Modal />
  {/if}
</div>

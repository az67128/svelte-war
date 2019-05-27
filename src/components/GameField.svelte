<script>
  import Cannon from "./Cannon.svelte";
</script>

<style>
  .container {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    max-height: 100%;
  }
</style>

<div class="container">
  <svg viewBox="0 0 480 800">
    <!-- Отображаем компонент пушки -->
    <Cannon />
  </svg>
</div>

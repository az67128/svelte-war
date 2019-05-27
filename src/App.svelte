<script>
  import Controls from "./components/Controls.svelte";
  import GameField from "./components/GameField.svelte";
  // импортируем функцию страта игры
  import { startGame } from "./gameLoop/gameLoop";
  // Запускаем
  startGame();
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

<Controls />
<GameField />

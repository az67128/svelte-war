<script>
  import { score } from "../stores/game";
</script>

<style>
  .score {
    position: fixed;
    left: 1rem;
    top: 1rem;
  }
</style>

<div class="score">Score: {$score}</div>

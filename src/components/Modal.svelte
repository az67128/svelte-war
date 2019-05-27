<script>
  import { score, maxScore, isPlaying } from "../stores/game";
  import { startGame } from "../gameLoop/gameLoop";
  import { fade } from "svelte/transition";
</script>

<style>
  .overlay {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal {
    padding: 2rem 1rem;
    background: white;
    border-radius: 8px;
    width: 300px;
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }
  .message {
    font-size: 1.4rem;
    font-weight: bold;
  }
  .button {
    border: 1px solid black;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  .button:hover {
    background-color: #efefef;
  }
</style>

<div class="overlay" transition:fade>
  <div class="modal">
    {#if $isPlaying === false}
      <div class="message">Game Over</div>
    {/if}
    {#if $score > 0}
      <div class="message">Your score: {$score}</div>
    {/if}
    <div class="message">Your record: {$maxScore}</div>
    <div class="button" on:click={startGame}>
      PLAY{$isPlaying === false ? ' AGAIN' : ''}
    </div>
  </div>
</div>

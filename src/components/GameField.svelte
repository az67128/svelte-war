<script>
  import Cannon from "./Cannon.svelte";
  import Bullet from "./Bullet.svelte";
  import Enemy from "./Enemy.svelte";

  import { bulletList } from "../stores/cannon";
  import { enemyList } from "../stores/enemy";
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
    {#each $enemyList as enemy (enemy.id)}
      <Enemy {enemy} />
    {/each}
    {#each $bulletList as bullet (bullet.id)}
      <Bullet {bullet} />
    {/each}
    <Cannon />
  </svg>
</div>

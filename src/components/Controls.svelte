<script>
  import { onDestroy } from "svelte";
  import IconButton from "./IconButton.svelte";
  import LeftArrow from "../assets/LeftArrow.svelte";
  import RightArrow from "../assets/RightArrow.svelte";
  import Bullet from "../assets/Bullet.svelte";
  import { direction, isFiring } from "../stores/cannon.js";

  const resetDirection = () => direction.set(null);

  const setDirectionLeft = () => direction.set("left");

  const setDirectionRight = () => direction.set("right");

  const startFire = () => isFiring.set(true);

  const stopFire = () => isFiring.set(false);

  function handleKeyDown(e) {
    window.requestAnimationFrame(() => {
      switch (e.keyCode) {
        case 39:
          setDirectionRight();
          break;
        case 37:
          setDirectionLeft();
          break;
        case 32:
          startFire();
          break;
        default:
          return;
      }
    });
  }

  function handleKeyUp(e) {
    window.requestAnimationFrame(() => {
      switch (e.keyCode) {
        case 39:
          resetDirection();
          break;
        case 37:
          resetDirection();
          break;
        case 32:
          stopFire();
          break;
        default:
          return;
      }
    });
  }

  document.body.addEventListener("keydown", handleKeyDown, false);
  document.body.addEventListener("keyup", handleKeyUp, false);
  onDestroy(() => {
    document.body.removeEventListener("keydown", handleKeyDown);
    document.body.removeEventListener("keyup", handleKeyUp);
  });
</script>

<style>
  .controls {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
  }
  .container {
    display: flex;
    justify-content: space-between;
    margin: 1rem;
  }
  .arrowGroup {
    display: flex;
    justify-content: space-between;
    width: 150px;
  }
</style>

<div class="controls">
  <div class="container">
    <div class="arrowGroup">
      <IconButton
        start={setDirectionLeft}
        release={resetDirection}
        active={$direction === 'left'}>
        <LeftArrow />
      </IconButton>
      <IconButton
        start={setDirectionRight}
        release={resetDirection}
        active={$direction === 'right'}>
        <RightArrow />
      </IconButton>
    </div>
    <IconButton start={startFire} release={stopFire} active={$isFiring}>
      <Bullet />
    </IconButton>

  </div>
</div>

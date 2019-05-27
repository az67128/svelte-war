<script>
  // импортируем компонент кнопки и иконки
  import IconButton from "./IconButton.svelte";
  import LeftArrow from "../assets/LeftArrow.svelte";
  import RightArrow from "../assets/RightArrow.svelte";
  import Bullet from "../assets/Bullet.svelte";
  import { direction } from "../stores/cannon.js"; // импортируем переменную направления поворота из хранилища

  // создаем обработчики событий
  const resetDirection = () => direction.set(null);
  const setDirectionLeft = () => direction.set("left");
  const setDirectionRight = () => direction.set("right");
</script>

<style>
  /* положение элементов управления фиксированное, внизу экрана */
  .controls {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
  }
  /* контейнер кнопок будет разносить наши элементы по краям экрана */
  .container {
    display: flex;
    justify-content: space-between;
    margin: 1rem;
  }
  /* сделаем отступ между стрелок */
  .arrowGroup {
    display: flex;
    justify-content: space-between;
    width: 150px;
  }
</style>

<div class="controls">
  <div class="container">
    <div class="arrowGroup">
      <!-- Передаем наши обработчики и направление в атрибуты -->
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
    <IconButton>
      <Bullet />
    </IconButton>
  </div>
</div>

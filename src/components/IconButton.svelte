<script>
  export let start;
  export let release;
  export let active;
</script>

<style>
  .iconButton {
    display: flex;
    width: 60px;
    height: 60px;
    border: 1px solid black;
    border-radius: 50px;
    align-items: center;
    justify-content: center;
  }
  .active {
    background-color: #bdbdbd;
  }
</style>

<div
  on:mousedown={start}
  on:touchstart={start}
  on:mouseup={release}
  on:touchend={release}
  class={`iconButton ${active ? 'active' : ''}`}>
  <slot />
</div>

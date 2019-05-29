<script>
  export let start;
  export let release;
  export let active;
</script>

<style>
  .iconButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border: 1px solid black;
    border-radius: 50px;
    outline: none;
    background: transparent;
  }
  .active {
    background-color: #bdbdbd;
  }
</style>

<button
  on:mousedown={start}
  on:touchstart={start}
  on:mouseup={release}
  on:touchend={release}
  class={`iconButton ${active ? 'active' : ''}`}>
  <slot />
</button>

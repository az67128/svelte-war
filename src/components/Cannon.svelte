<script>
  import { angle } from "../stores/cannon.js";
</script>

<style>
  .cannon {
    transform-origin: 4px 55px;
  }
</style>

<g class="cannon" transform={`translate(236, 700) rotate(${$angle})`}>
  <rect width="8 " height="60" fill="#212121" />
</g>

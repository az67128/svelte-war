<script>
  export let enemy;
</script>

<g transform={`translate(${enemy.x}, ${enemy.y})`}>
  <rect width="30" height="30" fill="#212121" />
</g>

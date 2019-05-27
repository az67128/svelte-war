<script>
  export let bullet;
</script>

<g
  class="mashineGun"
  transform={`translate(${bullet.x}, ${bullet.y}) rotate(${bullet.angle})`}>
  <rect width="3" height="5" fill="#212121" />
</g>

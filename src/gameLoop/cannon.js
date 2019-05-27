import { get } from 'svelte/store';
import { angle, direction, isFiring, lastFireAt, bulletList } from '../stores/cannon.js';

export function rotateCannon() {
  const currentAngle = get(angle);
  switch (get(direction)) {
    case 'left':
      if (currentAngle > -45) angle.update(a => a - 0.4);
      break;
    case 'right':
      if (currentAngle < 45) angle.update(a => a + 0.4);
      break;
    default:
      break;
  }
}

export function shoot() {
  if (get(isFiring) && Date.now() - get(lastFireAt) > 800) {
    lastFireAt.set(Date.now());
    bulletList.update(bullets => [
      ...bullets,
      {
        x: 238,
        y: 760,
        angle: get(angle),
        id: () => Math.random() + Date.now(),
      },
    ]);
  }
}

export function moveBullet() {
  bulletList.update(bullets =>
    bullets.map(bullet => ({
      ...bullet,
      y: bullet.y - 20,
      x: (780 - bullet.y) * Math.tan((bullet.angle * Math.PI) / 180) + 238,
    })),
  );
}

export function clearBullets() {
  bulletList.update(bullets => bullets.filter(bullet => bullet.y > 0));
}

export function removeBullet(id) {
  bulletList.update(bullets => bullets.filter(bullet => bullet.id !== id));
}

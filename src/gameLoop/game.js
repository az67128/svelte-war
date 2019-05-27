import { get } from 'svelte/store';
import { bulletList } from '../stores/cannon';
import { enemyList } from '../stores/enemy';
import { removeBullet } from './cannon';
import { removeEnemy } from './enemy';

const enemyWidth = 30;
const bulletWidth = 5;
const enemyHeight = 30;
const bulletHeight = 8;

export function checkCollision() {
  get(bulletList).forEach(bullet => {
    get(enemyList).forEach(enemy => {
      if (
        bullet.x < enemy.x + enemyWidth &&
        bullet.x + bulletWidth > enemy.x &&
        bullet.y < enemy.y + enemyHeight &&
        bullet.y + bulletHeight > enemy.y
      ) {
        removeBullet(bullet.id);
        removeEnemy(enemy.id);
      }
    });
  });
}

import { get } from 'svelte/store';
import { enemyList, lastEnemyAddedAt, enemyInterval, enemySpeed } from '../stores/enemy.js';

export function addEnemy() {
  if (Date.now() - get(lastEnemyAddedAt) > get(enemyInterval)) {
    lastEnemyAddedAt.set(Date.now());
    enemyList.update(enemies => [
      ...enemies,
      {
        x: Math.floor(Math.random() * 449) + 1,
        y: 0,
        id: () => Math.random() + Date.now(),
        speed: get(enemySpeed),
      },
    ]);
  }
}

export function moveEnemy() {
  enemyList.update(enemyList =>
    enemyList.map(enemy => ({
      ...enemy,
      y: enemy.y + enemy.speed,
    })),
  );
}

export function removeEnemy(id) {
  enemyList.update(enemies => enemies.filter(enemy => enemy.id !== id));
}

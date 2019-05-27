import { get } from 'svelte/store';
import { enemyList, lastEnemyAddedAt } from '../stores/enemy.js';

export function addEnemy() {
  if (Date.now() - get(lastEnemyAddedAt) > 2500) {
    lastEnemyAddedAt.set(Date.now());
    enemyList.update(enemies => [
      ...enemies,
      {
        x: Math.floor(Math.random() * 449) + 1,
        y: 0,
        id: () => Math.random() + Date.now(),
      },
    ]);
  }
}

export function moveEnemy() {
  enemyList.update(enemyList =>
    enemyList.map(enemy => ({
      ...enemy,
      y: enemy.y + 0.5,
    })),
  );
}

export function removeEnemy(id) {
  enemyList.update(enemies => enemies.filter(enemy => enemy.id !== id));
}

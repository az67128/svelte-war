import { get } from 'svelte/store';
import { bulletList } from '../stores/cannon';
import { enemyList, enemyInterval, enemySpeed } from '../stores/enemy';
import { score, maxScore } from '../stores/game';
import { removeBullet } from './cannon';
import { removeEnemy } from './enemy';
import { stopGame } from './gameLoop';

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
        score.update(val => val + 1);
        Math.random() > 0.3
          ? enemyInterval.update(value => (value > 500 ? value - 50 : value))
          : enemySpeed.update(value => value + 0.05);
      }
    });
  });
}

export function enemyAttack() {
  if (get(enemyList).find(({ y }) => y > 780)) {
    gameOver();
  }
}

function gameOver() {
  enemyList.set([]);
  bulletList.set([]);
  enemySpeed.set(0.5);
  enemyInterval.set(3000);
  stopGame();
  const currentScore = get(score);
  if (currentScore > get(maxScore)) {
    maxScore.set(currentScore);
    localStorage.setItem('maxScore', currentScore);
  }
}

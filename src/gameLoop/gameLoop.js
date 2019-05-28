import { isPlaying, score } from '../stores/game';
import { get } from 'svelte/store';
import { rotateCannon, shoot, moveBullet, clearBullets } from './cannon';
import { addEnemy, moveEnemy } from './enemy';
import { checkCollision, enemyAttack } from './game';

function startLoop(steps) {
  window.requestAnimationFrame(() => {
    steps.forEach(step => {
      if (typeof step === 'function') step();
    });
    if (get(isPlaying)) startLoop(steps);
  });
}

export const startGame = () => {
  isPlaying.set(true);
  score.set(0);
  startLoop([
    rotateCannon,
    shoot,
    addEnemy,
    moveEnemy,
    enemyAttack,
    moveBullet,
    checkCollision,
    clearBullets,
  ]);
};

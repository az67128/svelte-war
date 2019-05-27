import { isPlaying } from '../stores/game';
import { get } from 'svelte/store';
// Импортируем все обработчики событий пушки и снарядов
import { rotateCannon, shoot, moveBullet, clearBullets } from './cannon';

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
  // добавим обработчики в игровой цикл
  startLoop([rotateCannon, shoot, moveBullet, clearBullets]);
};

export function stopGame() {
  isPlaying.set(false);
}

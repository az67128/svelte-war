import { get } from 'svelte/store';
// Обновим импорты
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

// Функция выстрела
export function shoot() {
  // Если зажата кнопка огня и последний выстрел произошел более чем 800мс назад, то добавляем снаряд в массив и обновляем временную метку
  if (get(isFiring) && Date.now() - get(lastFireAt) > 800) {
    lastFireAt.set(Date.now());
    // Позиция и угол поворота снаряда совпадают с положением пушки. Для Id используем библиотеку nanoid
    bulletList.update(bullets => [...bullets, { x: 238, y: 760, angle: get(angle), id: nanoid() }]);
  }
}

// Функция перемещения снарядов
export function moveBullet() {
  // Возвращаем новый массив снарядов, в котором сдвигаем положение оси y на -20, а положение
  // по оси х рассчитываем по формуле прямоугольного треугольника.
  // Для знатоков геометрии отвечу, да, по диагонали снаряд летит быстрее. Но визуально вы этого не заметили, верно?
  bulletList.update(bullets =>
    bullets.map(bullet => ({
      ...bullet,
      y: bullet.y - 20,
      x: (780 - bullet.y) * Math.tan((bullet.angle * Math.PI) / 180) + 238,
    })),
  );
}

// Удаляем снаряд из массива, есл он вылетел за экран.
export function clearBullets() {
  bulletList.update(bullets => bullets.filter(bullet => bullet.y > 0));
}

// Функция удаления снаряда по Id. Пригодится, когда мы добавим противников и обработку столкновений
export function removeBullet(id) {
  bulletList.update(bullets => bullets.filter(bullet => bullet.id !== id));
}

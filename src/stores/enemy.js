import { writable } from 'svelte/store';

// Массив врагов
export const enemyList = writable([]);
// Временная метка добавления последнего врага
export const lastEnemyAddedAt = writable(0);

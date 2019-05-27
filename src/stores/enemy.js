import { writable } from 'svelte/store';

export const enemyList = writable([]);
export const enemySpeed = writable(0.5);
export const lastEnemyAddedAt = writable(0);
export const enemyInterval = writable(3000);

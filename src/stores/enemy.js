import { writable } from 'svelte/store';

export const enemyList = writable([]);
export const lastEnemyAddedAt = writable(0);

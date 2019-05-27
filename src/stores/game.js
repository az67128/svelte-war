import { writable } from 'svelte/store';

export const isPlaying = writable(false);
export const score = writable(0);
const maxScoreFromLocalStorage = localStorage.getItem('maxScore') || 0;

export const maxScore = writable(maxScoreFromLocalStorage);

import { writable } from 'svelte/store';

export const gameState = writable({
  guess: '',
  guessAge: '',
  round: 1,
  score: 0,
  hint_penalty: 100,
  submitted: false,
  max_rounds: 10
});
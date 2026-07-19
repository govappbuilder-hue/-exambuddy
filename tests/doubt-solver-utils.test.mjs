import test from 'node:test';
import assert from 'node:assert/strict';
import { getDoubtSolverFallbackMessage } from '../src/lib/doubt-solver-utils.mjs';

test('returns a friendly Gujlish fallback message when the AI call fails', () => {
  const message = getDoubtSolverFallbackMessage('quota exceeded');
  assert.match(message, /માફ|હમણાં|થોડીવાર/i);
});

test('returns a friendly fallback message even with no error detail', () => {
  const message = getDoubtSolverFallbackMessage();
  assert.match(message, /માફ|હમણાં|થોડીવાર/i);
});

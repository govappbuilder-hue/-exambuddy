import test from 'node:test';
import assert from 'node:assert/strict';
import { signAdminSession, verifyAdminSession } from '../src/lib/admin-auth.mjs';

test('signs and verifies a valid admin session token', () => {
  process.env.ADMIN_SESSION_SECRET = 'test-secret';
  const token = signAdminSession();
  assert.equal(verifyAdminSession(token), true);
});

test('rejects tampered admin session tokens', () => {
  process.env.ADMIN_SESSION_SECRET = 'test-secret';
  const token = signAdminSession();
  const tampered = token.slice(0, -1) + (token.at(-1) === 'A' ? 'B' : 'A');
  assert.equal(verifyAdminSession(tampered), false);
});

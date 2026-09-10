import assert from 'node:assert/strict';
import test from 'node:test';
import { hashPassword, verifyPassword } from '../src/utils/password.js';

test('passwords are salted, hashed, and verified', async () => {
  const firstHash = await hashPassword('test-password');
  const secondHash = await hashPassword('test-password');

  assert.notEqual(firstHash, secondHash);
  assert.match(firstHash, /^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/);
  assert.equal(await verifyPassword('test-password', firstHash), true);
  assert.equal(await verifyPassword('wrong-password', firstHash), false);
  assert.equal(await verifyPassword('test-password', 'invalid'), false);
});

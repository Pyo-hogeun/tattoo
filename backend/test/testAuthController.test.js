import assert from 'node:assert/strict';
import test from 'node:test';
import { env } from '../src/config/env.js';
import { testLogin, testSignUp } from '../src/controllers/authController.js';

const invoke = async (controller, body = {}) => {
  let forwardedError;
  await controller({ body }, {}, (error) => { forwardedError = error; });
  return forwardedError;
};

test('temporary signup and login return 404 while the feature flag is disabled', async (t) => {
  const originalValue = env.enableTestAuth;
  env.enableTestAuth = false;
  t.after(() => { env.enableTestAuth = originalValue; });

  const signupError = await invoke(testSignUp);
  const loginError = await invoke(testLogin);

  assert.equal(signupError.statusCode, 404);
  assert.equal(loginError.statusCode, 404);
  assert.match(signupError.message, /비활성화/);
});

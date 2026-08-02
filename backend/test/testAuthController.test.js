import assert from 'node:assert/strict';
import test from 'node:test';
import { env } from '../src/config/env.js';
import { Shop } from '../src/models/Shop.js';
import { User } from '../src/models/User.js';
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

test('temporary admin signup does not require or create a shop', async (t) => {
  const originals = { enabled: env.enableTestAuth, exists: User.exists, createUser: User.create, createShop: Shop.create };
  env.enableTestAuth = true;
  t.after(() => {
    env.enableTestAuth = originals.enabled;
    User.exists = originals.exists;
    User.create = originals.createUser;
    Shop.create = originals.createShop;
  });
  User.exists = async () => false;
  Shop.create = async () => assert.fail('admin 가입은 매장을 생성하지 않아야 합니다.');
  let createdPayload;
  User.create = async (payload) => {
    createdPayload = payload;
    return {
      id: 'admin-id', ...payload, isActive: true,
      async populate() {},
      createdAt: new Date(), updatedAt: new Date()
    };
  };
  const response = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };

  await testSignUp(
    { body: { loginId: 'testadmin', password: 'password123', nickname: '관리자', role: 'admin' } },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 201);
  assert.equal(createdPayload.role, 'admin');
  assert.equal('shop' in createdPayload, false);
  assert.equal(response.body.user.shop, undefined);
});

test('only manager users require a shop reference', async () => {
  const credentials = { loginId: 'test-user', passwordHash: 'salt:hash' };
  await new User({ ...credentials, role: 'admin' }).validate();
  await new User({ ...credentials, role: 'master' }).validate();
  await assert.rejects(new User({ ...credentials, role: 'manager' }).validate(), /shop/);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { env } from '../src/config/env.js';
import { kakaoCustomerSignUp } from '../src/controllers/authController.js';
import { Customer } from '../src/models/Customer.js';

test('general Kakao signup creates a customer separately from backoffice users', async (t) => {
  const originals = {
    clientId: env.kakaoClientId, userRedirectUri: env.kakaoUserRedirectUri, fetch: global.fetch,
    exists: Customer.exists, create: Customer.create
  };
  Object.assign(env, { kakaoClientId: 'client-id', kakaoUserRedirectUri: 'http://localhost/user-callback' });
  t.after(() => {
    Object.assign(env, { kakaoClientId: originals.clientId, kakaoUserRedirectUri: originals.userRedirectUri });
    global.fetch = originals.fetch;
    Customer.exists = originals.exists;
    Customer.create = originals.create;
  });

  const requests = [];
  global.fetch = async (url) => {
    requests.push(String(url));
    if (String(url).includes('/oauth/token')) return { ok: true, json: async () => ({ access_token: 'kakao-token' }) };
    return { ok: true, json: async () => ({ id: 12345, properties: { nickname: '일반 사용자' } }) };
  };
  Customer.exists = async () => false;
  let customerPayload;
  Customer.create = async (payload) => { customerPayload = payload; return { id: 'customer-id', ...payload }; };
  const response = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; } };

  await kakaoCustomerSignUp({ body: { code: 'authorization-code', clientId: 'client-id', redirectUri: 'http://localhost/user-callback' } }, response, assert.fail);

  assert.equal(response.statusCode, 201);
  assert.deepEqual(customerPayload, { kakaoId: '12345', nickname: '일반 사용자' });
  assert.equal(response.body.user.role, 'user');
  assert.ok(response.body.token);
  assert.equal(requests.length, 2);
});

test('general Kakao signup rejects the backoffice redirect URI', async (t) => {
  const originals = { clientId: env.kakaoClientId, redirectUri: env.kakaoRedirectUri, userRedirectUri: env.kakaoUserRedirectUri };
  Object.assign(env, {
    kakaoClientId: 'client-id',
    kakaoRedirectUri: 'http://localhost/backoffice-callback',
    kakaoUserRedirectUri: 'http://localhost/user-callback'
  });
  t.after(() => Object.assign(env, originals));
  let forwardedError;

  await kakaoCustomerSignUp(
    { body: { code: 'authorization-code', clientId: 'client-id', redirectUri: env.kakaoRedirectUri } },
    {},
    (error) => { forwardedError = error; }
  );

  assert.equal(forwardedError.statusCode, 400);
  assert.match(forwardedError.message, /Redirect URI/);
});

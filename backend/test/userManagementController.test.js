import assert from 'node:assert/strict';
import test from 'node:test';
import { updateUser } from '../src/controllers/authController.js';
import { User } from '../src/models/User.js';

const response = () => ({
  statusCode: 200,
  body: undefined,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; }
});

test('admin cannot modify a master account', async (t) => {
  const originalFindById = User.findById;
  t.after(() => { User.findById = originalFindById; });
  User.findById = () => ({ populate: async () => ({ _id: 'master-id', role: 'master' }) });
  const res = response();

  await updateUser(
    { params: { id: 'master-id' }, body: { nickname: '변경' }, user: { _id: 'admin-id', role: 'admin' } },
    res,
    assert.fail
  );

  assert.equal(res.statusCode, 403);
  assert.match(res.body.message, /master 계정/);
});

test('master can update user profile, role and active state', async (t) => {
  const originalFindById = User.findById;
  t.after(() => { User.findById = originalFindById; });
  let saved = false;
  const user = {
    id: 'manager-id', _id: 'manager-id', nickname: '기존 이름', role: 'manager', isActive: true,
    loginId: 'manager1', shop: { name: '테스트 매장' }, createdAt: new Date(), updatedAt: new Date(),
    async save() { saved = true; }
  };
  User.findById = () => ({ populate: async () => user });
  const res = response();

  await updateUser(
    { params: { id: user.id }, body: { nickname: '새 이름', role: 'admin', isActive: false }, user: { _id: 'master-id', role: 'master' } },
    res,
    assert.fail
  );

  assert.equal(saved, true);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.user.nickname, '새 이름');
  assert.equal(res.body.user.role, 'admin');
  assert.equal(res.body.user.isActive, false);
});

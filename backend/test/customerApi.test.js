import assert from 'node:assert/strict';
import test from 'node:test';
import { Customer } from '../src/models/Customer.js';
import { Interaction } from '../src/models/Interaction.js';
import { authenticateCustomer } from '../src/middleware/customerAuth.js';
import { createInteraction, deleteInteraction, listInteractions } from '../src/controllers/interactionController.js';
import { signToken } from '../src/utils/token.js';
import { customerMe, deleteCustomerAccount } from '../src/controllers/authController.js';

const response = () => ({
  statusCode: 200, body: undefined,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
  send() { return this; }
});

test('customer middleware accepts a user token and loads Customer', async (t) => {
  const originalFindById = Customer.findById;
  t.after(() => { Customer.findById = originalFindById; });
  const customer = { id: 'customer-id', _id: 'customer-id', isActive: true };
  Customer.findById = async () => customer;
  const req = { headers: { authorization: `Bearer ${signToken({ id: customer.id, role: 'user' })}` } };
  const res = response();
  let nextCalled = false;

  await authenticateCustomer(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(req.customer, customer);
});

test('customer middleware rejects a backoffice token', async () => {
  const req = { headers: { authorization: `Bearer ${signToken({ id: 'manager-id', role: 'manager' })}` } };
  const res = response();
  await authenticateCustomer(req, res, assert.fail);
  assert.equal(res.statusCode, 403);
});

test('interaction CRUD is scoped to the authenticated customer', async (t) => {
  const originals = { find: Interaction.find, findOneAndUpdate: Interaction.findOneAndUpdate, findOneAndDelete: Interaction.findOneAndDelete };
  t.after(() => Object.assign(Interaction, originals));
  const customer = { _id: 'customer-id' };
  const item = { id: 'interaction-id', customer: customer._id, targetType: 'gallery', targetId: 'gallery/key.webp', type: 'like', createdAt: new Date(), updatedAt: new Date() };

  Interaction.findOneAndUpdate = async (filter) => { assert.equal(filter.customer, customer._id); return item; };
  let res = response();
  await createInteraction({ customer, body: { targetType: 'gallery', targetId: item.targetId, type: 'like' } }, res, assert.fail);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.interaction.id, item.id);

  Interaction.find = (filter) => ({ sort: async () => { assert.equal(filter.customer, customer._id); return [item]; } });
  res = response();
  await listInteractions({ customer, query: {} }, res, assert.fail);
  assert.equal(res.body.total, 1);

  Interaction.findOneAndDelete = async (filter) => { assert.deepEqual(filter, { _id: item.id, customer: customer._id }); return item; };
  res = response();
  await deleteInteraction({ customer, params: { id: item.id } }, res, assert.fail);
  assert.equal(res.statusCode, 204);
});

test('customer me returns public profile and account deletion cascades interactions', async (t) => {
  const originals = { deleteInteractions: Interaction.deleteMany, deleteCustomer: Customer.deleteOne };
  t.after(() => {
    Interaction.deleteMany = originals.deleteInteractions;
    Customer.deleteOne = originals.deleteCustomer;
  });
  const customer = { id: 'customer-id', _id: 'customer-id', nickname: '일반 사용자' };
  let res = response();
  customerMe({ customer }, res);
  assert.deepEqual(res.body, { user: { id: 'customer-id', nickname: '일반 사용자', role: 'user' } });

  const calls = [];
  Interaction.deleteMany = async (filter) => { calls.push(['interactions', filter]); };
  Customer.deleteOne = async (filter) => { calls.push(['customer', filter]); };
  res = response();
  await deleteCustomerAccount({ customer }, res, assert.fail);
  assert.equal(res.statusCode, 204);
  assert.deepEqual(calls, [
    ['interactions', { customer: 'customer-id' }],
    ['customer', { _id: 'customer-id' }]
  ]);
});

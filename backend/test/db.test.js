import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';

test('database startup synchronizes the User indexes after connecting', async (t) => {
  const originalConnect = mongoose.connect;
  const originalSyncIndexes = User.syncIndexes;
  const originalLog = console.log;
  const calls = [];
  t.after(() => {
    mongoose.connect = originalConnect;
    User.syncIndexes = originalSyncIndexes;
    console.log = originalLog;
  });
  mongoose.connect = async (uri) => { calls.push(['connect', uri]); };
  User.syncIndexes = async () => { calls.push(['syncIndexes']); };
  console.log = () => {};

  await connectDB('mongodb://test/user-indexes');

  assert.deepEqual(calls, [
    ['connect', 'mongodb://test/user-indexes'],
    ['syncIndexes']
  ]);
});

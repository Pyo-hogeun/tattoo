import assert from 'node:assert/strict';
import test from 'node:test';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { env } from '../src/config/env.js';
import { r2 } from '../src/config/r2.js';
import { listR2Gallery } from '../src/controllers/galleryController.js';

test('listR2Gallery returns every paginated gallery object with a public URL', async (t) => {
  const originalEnv = { ...env };
  const originalSend = r2.send;
  Object.assign(env, {
    r2Endpoint: 'https://account.example.com',
    r2AccessKey: 'access',
    r2SecretKey: 'secret',
    r2Bucket: 'bucket',
    r2PublicUrl: 'https://cdn.example.com'
  });
  t.after(() => {
    Object.assign(env, originalEnv);
    r2.send = originalSend;
  });

  const commands = [];
  r2.send = async (command) => {
    commands.push(command);
    if (!command.input.ContinuationToken) {
      return {
        IsTruncated: true,
        NextContinuationToken: 'next-page',
        Contents: [
          { Key: 'gallery/', Size: 0 },
          { Key: 'gallery/older image.png', Size: 12, LastModified: new Date('2026-01-01'), ETag: '"old"' }
        ]
      };
    }
    return {
      IsTruncated: false,
      Contents: [{ Key: 'gallery/nested/new.webp', Size: 34, LastModified: new Date('2026-02-01'), ETag: '"new"' }]
    };
  };

  let responseBody;
  let forwardedError;
  await listR2Gallery({}, { json: (body) => { responseBody = body; } }, (error) => { forwardedError = error; });

  assert.equal(forwardedError, undefined);
  assert.equal(commands.length, 2);
  assert.ok(commands.every((command) => command instanceof ListObjectsV2Command));
  assert.deepEqual(commands.map((command) => command.input), [
    { Bucket: 'bucket', Prefix: 'gallery/', ContinuationToken: undefined },
    { Bucket: 'bucket', Prefix: 'gallery/', ContinuationToken: 'next-page' }
  ]);
  assert.deepEqual(responseBody, {
    items: [
      {
        key: 'gallery/nested/new.webp',
        url: 'https://cdn.example.com/gallery/nested/new.webp',
        size: 34,
        lastModified: new Date('2026-02-01'),
        etag: 'new'
      },
      {
        key: 'gallery/older image.png',
        url: 'https://cdn.example.com/gallery/older%20image.png',
        size: 12,
        lastModified: new Date('2026-01-01'),
        etag: 'old'
      }
    ],
    total: 2
  });
});

test('listR2Gallery reports missing R2 configuration as 503', async (t) => {
  const originalBucket = env.r2Bucket;
  env.r2Bucket = '';
  t.after(() => { env.r2Bucket = originalBucket; });

  let forwardedError;
  await listR2Gallery({}, { json: assert.fail }, (error) => { forwardedError = error; });

  assert.equal(forwardedError.statusCode, 503);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';

const requestApp = async (origin) => {
  const app = createApp();
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const { port } = server.address();
    return await fetch(`http://127.0.0.1:${port}/api/auth/test/login`, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
      }
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

test('CORS preflight allows both backoffice and general-user origins', async (t) => {
  const originalOrigins = env.frontendOrigins;
  env.frontendOrigins = ['http://localhost:3000', 'http://localhost:3001'];
  t.after(() => { env.frontendOrigins = originalOrigins; });

  for (const origin of env.frontendOrigins) {
    const response = await requestApp(origin);
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), origin);
    assert.match(response.headers.get('access-control-allow-methods'), /POST/);
    assert.match(response.headers.get('access-control-allow-headers'), /Content-Type/i);
  }
});

test('CORS preflight rejects unconfigured origins', async (t) => {
  const originalOrigins = env.frontendOrigins;
  env.frontendOrigins = ['http://localhost:3000'];
  t.after(() => { env.frontendOrigins = originalOrigins; });

  const response = await requestApp('https://untrusted.example.com');
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

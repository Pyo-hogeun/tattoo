import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import shopRoutes from './routes/shopRoutes.js';
import browShapeRoutes from './routes/browShapeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import { env } from './config/env.js';
import { openapiDocument } from './config/openapi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: [env.frontendOrigin, env.frontendOriginUser].filter(Boolean)
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('dev'));

  app.get('/api-docs/openapi.json', (_req, res) => {
    res.json(openapiDocument);
  });

  app.get('/api-docs', (_req, res) => {
    res.type('html').send(`<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Eyebrow Backoffice API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>SwaggerUIBundle({ url: '/api-docs/openapi.json', dom_id: '#swagger-ui' });</script>
  </body>
</html>`);
  });

  app.get('/health', (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
  });

  app.use('/api/uploads', express.static(path.resolve(__dirname, '../uploads')));

  app.use('/api/shops', shopRoutes);
  app.use('/api/brow-shapes', browShapeRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/gallery', galleryRoutes);

  app.use((err, _req, res, _next) => {
    console.error(err);
    if (err?.code === 11000) return res.status(409).json({ message: '이미 등록된 정보입니다.', fields: Object.keys(err.keyPattern || {}) });
    if (err?.name === 'ValidationError') return res.status(400).json({ message: err.message });
    res.status(500).json({ message: err.message || 'Internal server error' });
  });

  return app;
};

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import shopRoutes from './routes/shopRoutes.js';
import sourceRoutes from './routes/sourceRoutes.js';
import scrapeRoutes from './routes/scrapeRoutes.js';
import { env } from './config/env.js';

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.frontendOrigin
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
  });

  app.use('/api/shops', shopRoutes);
  app.use('/api/sources', sourceRoutes);
  app.use('/api/scrape', scrapeRoutes);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  });

  return app;
};

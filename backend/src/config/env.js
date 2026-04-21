import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/eyebrow_backoffice',
  scrapeCron: process.env.SCRAPE_CRON || '0 */6 * * *',
  scrapeTimeoutMs: Number(process.env.SCRAPE_TIMEOUT_MS || 10000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000'
};

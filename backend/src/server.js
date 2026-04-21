import cron from 'node-cron';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { createApp } from './app.js';
import { ScrapeSource } from './models/ScrapeSource.js';
import { scrapeSource } from './services/scraperService.js';

const start = async () => {
  await connectDB(env.mongoUri);

  cron.schedule(env.scrapeCron, async () => {
    console.log('[SCRAPE] scheduled run started');
    const sources = await ScrapeSource.find({ enabled: true });

    for (const source of sources) {
      try {
        await scrapeSource(source, 'scheduled');
        source.lastRunAt = new Date();
        await source.save();
        console.log(`[SCRAPE] success: ${source.name}`);
      } catch (error) {
        console.error(`[SCRAPE] failed: ${source.name}`, error.message);
      }
    }
  });

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[SERVER] listening on ${env.port}`);
  });
};

start().catch((error) => {
  console.error('[SERVER] fatal error', error);
  process.exit(1);
});

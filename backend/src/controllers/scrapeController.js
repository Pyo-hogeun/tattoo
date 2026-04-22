import { ScrapeSource } from '../models/ScrapeSource.js';
import { ScrapeRun } from '../models/ScrapeRun.js';
import { scrapeSource } from '../services/scraperService.js';

export const runScraping = async (req, res, next) => {
  try {
    const { sourceId } = req.body;
    const query = sourceId ? { _id: sourceId } : { enabled: true };
    const sources = await ScrapeSource.find(query);

    if (!sources.length) {
      if (sourceId) {
        return res.status(404).json({ message: 'No scraping source found' });
      }

      return res.json({
        results: [],
        message: 'No enabled scraping sources found'
      });
    }

    const results = [];
    for (const source of sources) {
      try {
        const stats = await scrapeSource(source, 'manual');
        source.lastRunAt = new Date();
        await source.save();
        results.push({ source: source.name, success: true, stats });
      } catch (error) {
        results.push({ source: source.name, success: false, error: error.message });
      }
    }

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

export const recentRuns = async (_req, res, next) => {
  try {
    const items = await ScrapeRun.find().sort({ createdAt: -1 }).limit(30);
    res.json(items);
  } catch (error) {
    next(error);
  }
};

import { ScrapeSource } from '../models/ScrapeSource.js';
import { ScrapeRun } from '../models/ScrapeRun.js';
import { scrapeSource } from '../services/scraperService.js';

export const runScraping = async (req, res, next) => {
  try {
    const { sourceId } = req.body;
    // 참고: `enabled: true`는 "자동(크론) 수집 대상"으로 켜둔 소스만 의미합니다.
    // 수동 전체 실행은 운영자가 의도적으로 누르는 액션이므로 enabled 여부와 무관하게 전체 소스를 대상으로 합니다.
    const query = sourceId ? { _id: sourceId } : {};
    const sources = await ScrapeSource.find(query);

    if (!sources.length) {
      if (sourceId) {
        return res.status(404).json({ message: 'No scraping source found' });
      }

      return res.json({
        results: [],
        message: 'No scraping sources found. Please register a source first.'
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

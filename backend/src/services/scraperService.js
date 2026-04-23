import axios from 'axios';
import * as cheerio from 'cheerio';
import { env } from '../config/env.js';
import { crawlNaverBlog } from '../crawlers/naverBlogCrawler.js';
import { crawlNaverMap } from '../crawlers/naverMapCrawler.js';
import { Shop } from '../models/Shop.js';
import { ScrapeRun } from '../models/ScrapeRun.js';
import { buildDedupeCandidates, buildExternalId } from './pipeline/dedupeKey.js';
import { normalizeShop } from './pipeline/normalizeShop.js';

const pickText = ($item, selector) => {
  if (!selector) return undefined;
  const value = $item.find(selector).first().text().trim();
  return value || undefined;
};

const pickLink = ($item, selector) => {
  if (!selector) return undefined;
  const value = $item.find(selector).first().attr('href');
  return value?.trim() || undefined;
};

const crawlCustomSource = async (source) => {
  const response = await axios.get(source.url, { timeout: env.scrapeTimeoutMs });
  const $ = cheerio.load(response.data);
  const items = $(source.selectors.item).toArray();

  return items
    .map((element) => {
      const $item = $(element);
      const name = pickText($item, source.selectors.name);
      if (!name) return null;

      return {
        name,
        address: pickText($item, source.selectors.address),
        city: pickText($item, source.selectors.city),
        phone: pickText($item, source.selectors.phone),
        description: pickText($item, source.selectors.description),
        homepage: pickLink($item, source.selectors.link),
        externalId: pickText($item, source.selectors.externalId),
        sourceName: source.name,
        sourceUrl: source.url,
        tags: source.defaultTags || [],
        raw: {
          html: $item.html()
        },
        lastScrapedAt: new Date()
      };
    })
    .filter(Boolean);
};

const crawlBySourceType = async (source) => {
  if (source.type === 'naver-map') {
    return crawlNaverMap(source);
  }

  if (source.type === 'naver-blog') {
    return crawlNaverBlog(source);
  }

  return crawlCustomSource(source);
};

const upsertShop = async (shopData) => {
  const dedupeCandidates = buildDedupeCandidates(shopData);

  let existing = null;
  for (const query of dedupeCandidates) {
    existing = await Shop.findOne(query);
    if (existing) break;
  }

  if (!existing) {
    try {
      await Shop.create(shopData);
      return 'inserted';
    } catch (error) {
      if (error?.code !== 11000) throw error;

      for (const query of dedupeCandidates) {
        existing = await Shop.findOne(query);
        if (existing) break;
      }

      if (!existing) throw error;
    }
  }

  existing.set(shopData);
  await existing.save();
  return 'updated';
};

export const scrapeSource = async (source, mode = 'manual') => {
  const startedAt = Date.now();
  const stats = { inserted: 0, updated: 0, totalParsed: 0 };

  try {
    const rawShops = await crawlBySourceType(source);

    for (const item of rawShops) {
      const normalized = normalizeShop({
        ...item,
        sourceName: source.name,
        sourceUrl: item.sourceUrl || source.url,
        tags: [...(source.defaultTags || []), ...(item.tags || [])],
        lastScrapedAt: new Date()
      });

      if (!normalized.name) continue;
      normalized.externalId = buildExternalId(normalized);

      const result = await upsertShop(normalized);
      stats[result] += 1;
      stats.totalParsed += 1;
    }

    await ScrapeRun.create({
      sourceName: source.name,
      sourceUrl: source.url,
      status: 'success',
      mode,
      ...stats,
      durationMs: Date.now() - startedAt
    });

    return stats;
  } catch (error) {
    await ScrapeRun.create({
      sourceName: source.name,
      sourceUrl: source.url,
      status: 'failed',
      mode,
      errorMessage: error.message,
      durationMs: Date.now() - startedAt
    });
    throw error;
  }
};

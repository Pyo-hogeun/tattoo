import axios from 'axios';
import cheerio from 'cheerio';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { Shop } from '../models/Shop.js';
import { ScrapeRun } from '../models/ScrapeRun.js';

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

const buildExternalId = (data) => {
  if (data.externalId) return data.externalId;
  const fallback = `${data.name || ''}|${data.address || ''}|${data.phone || ''}`;
  return crypto.createHash('md5').update(fallback).digest('hex');
};

const upsertShop = async (shopData) => {
  const query = shopData.externalId
    ? { externalId: shopData.externalId }
    : { name: shopData.name, address: shopData.address || '' };

  const existing = await Shop.findOne(query);
  if (!existing) {
    await Shop.create(shopData);
    return 'inserted';
  }

  existing.set(shopData);
  await existing.save();
  return 'updated';
};

export const scrapeSource = async (source, mode = 'manual') => {
  const startedAt = Date.now();
  const stats = { inserted: 0, updated: 0, totalParsed: 0 };

  try {
    const response = await axios.get(source.url, { timeout: env.scrapeTimeoutMs });
    const $ = cheerio.load(response.data);
    const items = $(source.selectors.item).toArray();

    for (const element of items) {
      const $item = $(element);
      const name = pickText($item, source.selectors.name);
      if (!name) continue;

      const payload = {
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

      payload.externalId = buildExternalId(payload);
      const result = await upsertShop(payload);
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

import axios from 'axios';
import * as cheerio from 'cheerio';
import { env } from '../config/env.js';

const clean = (value = '') => value.replace(/\s+/g, ' ').trim();
const SEARCH_BASE_URL = 'https://search.naver.com/search.naver';

const parseMapSearchHtml = (html, source) => {
  const $ = cheerio.load(html);
  const candidates = [];

  $('[data-laim-exp-id], .place_bluelink, .TYaxT').each((_, element) => {
    const root = $(element).closest('li, .place_box, .place_area');
    const name =
      clean(root.find('.place_bluelink, .TYaxT, [data-testid="place-name"]').first().text()) || clean($(element).text());
    const address = clean(root.find('.load_adress, .KCMnt').first().text());
    const phone = clean(root.find('.xlx7Q, .hTf54, [data-testid="place-phone"]').first().text());
    const category = clean(root.find('.KCMnt + .KCMnt, .YzBgS').first().text());

    if (!name) return;

    candidates.push({
      name,
      address,
      phone,
      description: category,
      sourceName: source.name,
      sourceUrl: source.url,
      raw: {
        html: root.html()
      }
    });
  });

  return candidates;
};

const buildPagedUrl = (url, start) => {
  const parsed = new URL(url);
  parsed.searchParams.set('start', String(start));
  return parsed.toString();
};

const dedupeByIdentity = (items) => {
  const byKey = new Map();

  for (const item of items) {
    const key = [item.name, item.address, item.phone].map((part) => clean(part || '').toLowerCase()).join('|');
    if (!byKey.has(key)) byKey.set(key, item);
  }

  return [...byKey.values()];
};

export const crawlNaverMap = async (source) => {
  const query = source.query || source.name;
  const baseUrl = source.url || `${SEARCH_BASE_URL}?query=${encodeURIComponent(query)}`;
  const collected = [];
  const maxPages = Number.isFinite(env.naverMapMaxPages) && env.naverMapMaxPages > 0 ? env.naverMapMaxPages : 1;

  for (let page = 0; page < maxPages; page += 1) {
    const start = page * 10 + 1;
    const url = buildPagedUrl(baseUrl, start);
    const response = await axios.get(url, {
      timeout: env.scrapeTimeoutMs,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
      }
    });

    const parsed = parseMapSearchHtml(response.data, { ...source, url });
    if (!parsed.length) break;
    collected.push(...parsed);
  }

  return dedupeByIdentity(collected);
};

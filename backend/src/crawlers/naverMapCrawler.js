import axios from 'axios';
import * as cheerio from 'cheerio';
import { env } from '../config/env.js';

const clean = (value = '') => value.replace(/\s+/g, ' ').trim();

const parseMapSearchHtml = (html, source) => {
  const $ = cheerio.load(html);
  const candidates = [];

  $('[data-laim-exp-id], .place_bluelink').each((_, element) => {
    const root = $(element).closest('li, .place_box, .place_area');
    const name = clean(root.find('.place_bluelink, .TYaxT').first().text()) || clean($(element).text());
    const address = clean(root.find('.load_adress, .KCMnt').first().text());
    const phone = clean(root.find('.xlx7Q, .hTf54').first().text());
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

export const crawlNaverMap = async (source) => {
  const query = source.query || source.name;
  const url = source.url || `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`;

  const response = await axios.get(url, {
    timeout: env.scrapeTimeoutMs,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
    }
  });

  return parseMapSearchHtml(response.data, { ...source, url });
};

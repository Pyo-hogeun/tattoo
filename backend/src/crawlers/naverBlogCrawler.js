import axios from 'axios';
import * as cheerio from 'cheerio';
import { env } from '../config/env.js';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const clean = (value = '') => value.replace(/\s+/g, ' ').trim();

const parseBlogDocument = (html, meta = {}) => {
  const $ = cheerio.load(html);
  const title = clean($('title').first().text());
  const text = clean($('body').text());

  const phoneMatch = text.match(/(01[016789]|02|0[3-6][1-5]|070)[-\s.]?\d{3,4}[-\s.]?\d{4}/);

  const addressPatterns = [
    /(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)[^\n]{5,80}/,
    /\b\d{1,4}\s?[가-힣A-Za-z0-9\-로길동읍면리]{3,80}/
  ];

  const address = addressPatterns.map((pattern) => text.match(pattern)?.[0]).find(Boolean);

  return {
    name: title || meta.query,
    address,
    phone: phoneMatch?.[0],
    description: text.slice(0, 500),
    homepage: meta.url,
    sourceName: meta.sourceName,
    sourceUrl: meta.sourceUrl,
    raw: {
      title,
      snippet: text.slice(0, 2000)
    }
  };
};

const resolveTargets = async (source) => {
  if (source.url) {
    return [source.url];
  }

  if (!source.query) {
    throw new Error('naver-blog source에는 url 또는 query가 필요합니다.');
  }

  const searchUrl = `https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(source.query)}`;
  const response = await axios.get(searchUrl, {
    timeout: env.scrapeTimeoutMs,
    headers: { 'User-Agent': USER_AGENT }
  });

  const $ = cheerio.load(response.data);
  const links = [
    ...new Set(
      $('a[href*="blog.naver.com"], a[href*="m.blog.naver.com"]')
        .map((_, el) => $(el).attr('href'))
        .get()
        .filter(Boolean)
    )
  ];

  if (!links.length) {
    throw new Error(`blog 검색 결과가 없습니다. query=${source.query}`);
  }

  return links.slice(0, 3);
};

export const crawlNaverBlog = async (source) => {
  const targetUrls = await resolveTargets(source);
  const items = [];

  for (const url of targetUrls) {
    try {
      const response = await axios.get(url, {
        timeout: env.scrapeTimeoutMs,
        headers: { 'User-Agent': USER_AGENT }
      });

      const parsed = parseBlogDocument(response.data, {
        query: source.query,
        sourceName: source.name,
        sourceUrl: source.url || `naver-search:${source.query}`,
        url
      });

      if (parsed.name) items.push(parsed);
    } catch (_error) {
      // 블로그 개별 문서 실패는 건너뛰고 다음 URL 진행
    }
  }

  if (!items.length) {
    throw new Error(`blog 문서 파싱 실패. query=${source.query || 'n/a'}`);
  }

  return items;
};

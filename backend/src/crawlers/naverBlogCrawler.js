import axios from 'axios';
import * as cheerio from 'cheerio';
import { env } from '../config/env.js';

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

  return [
    {
      name: title || meta.query,
      address,
      phone: phoneMatch?.[0],
      description: text.slice(0, 500),
      homepage: meta.url,
      sourceName: meta.sourceName,
      sourceUrl: meta.url,
      raw: {
        title,
        snippet: text.slice(0, 2000)
      }
    }
  ];
};

export const crawlNaverBlog = async (source) => {
  const response = await axios.get(source.url, {
    timeout: env.scrapeTimeoutMs,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
    }
  });

  return parseBlogDocument(response.data, {
    url: source.url,
    query: source.query,
    sourceName: source.name
  });
};

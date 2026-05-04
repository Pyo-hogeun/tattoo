import fs from 'fs/promises';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { Shop } from '../models/Shop.js';
import { validateSeoulShopPayload } from '../utils/seoulValidation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../..');
const SEOUL_DISTRICTS_FILE = path.join(ROOT_DIR, 'frontend/data/seoulDistricts.ts');

const KAKAO_KEY = process.env.KAKAO_REST_API_KEY;
const KEYWORD = process.env.KAKAO_KEYWORD || '눈썹문신';
const PAGE_SIZE = Number(process.env.KAKAO_PAGE_SIZE || 15);
const MAX_PAGES = Number(process.env.KAKAO_MAX_PAGES || 3);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const loadSeoulDistricts = async () => {
  const content = await fs.readFile(SEOUL_DISTRICTS_FILE, 'utf8');
  const match = content.match(/export const seoulDistricts: SeoulDistrict\[] = (\[[\s\S]*\]);/);
  if (!match) throw new Error('seoulDistricts 배열을 frontend/data/seoulDistricts.ts 에서 찾을 수 없습니다.');

  const script = new vm.Script(`(${match[1]})`);
  const districts = script.runInNewContext({});

  if (!Array.isArray(districts)) throw new Error('seoulDistricts 파싱 실패');
  return districts;
};

const searchKakaoPlaces = async (query, page = 1, size = 15) => {
  const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
  url.searchParams.set('query', query);
  url.searchParams.set('page', String(page));
  url.searchParams.set('size', String(size));
  url.searchParams.set('sort', 'accuracy');

  const response = await fetch(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_KEY}` }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`[Kakao API] ${response.status} ${text}`);
  }

  return response.json();
};

const normalizeDocumentToShop = (district, town, keyword, document) => ({
  name: document.place_name,
  address: document.road_address_name || document.address_name || '',
  cityProvince: '서울특별시',
  city: '서울',
  district,
  town,
  phone: document.phone || undefined,
  sourceName: 'kakao-local-api',
  sourceUrl: document.place_url || undefined,
  externalId: `kakao:${document.id}`,
  description: `${district} ${town} ${keyword}`,
  dataSourceType: 'crawl',
  raw: document,
  lastScrapedAt: new Date()
});

const upsertShop = async (shopPayload) => {
  const { externalId, phone, name, address } = shopPayload;

  const filter = externalId
    ? { externalId }
    : phone
      ? { phone }
      : { name, address };

  return Shop.findOneAndUpdate(filter, { $set: shopPayload }, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  });
};

const run = async () => {
  if (!KAKAO_KEY) {
    throw new Error('KAKAO_REST_API_KEY 환경변수가 필요합니다.');
  }

  const districts = await loadSeoulDistricts();
  await connectDB(env.mongoUri);

  let searchedCount = 0;
  let upsertedCount = 0;

  for (const { district, towns } of districts) {
    for (const town of towns) {
      const query = `${district} ${town} ${KEYWORD}`;
      let page = 1;
      let isEnd = false;

      while (!isEnd && page <= MAX_PAGES) {
        const data = await searchKakaoPlaces(query, page, PAGE_SIZE);
        searchedCount += data.documents.length;

        for (const document of data.documents) {
          const payload = normalizeDocumentToShop(district, town, KEYWORD, document);
          const validation = validateSeoulShopPayload(payload);
          if (!validation.isValid) continue;

          await upsertShop(payload);
          upsertedCount += 1;
        }

        isEnd = data.meta?.is_end ?? true;
        page += 1;
        await sleep(120);
      }

      console.log(`[DONE] ${query}`);
    }
  }

  console.log(`\n완료: 검색 문서 ${searchedCount}건 처리, upsert ${upsertedCount}건`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

# 눈썹문신 매장 데이터 수집 백오피스

눈썹문신 샵/매장 정보를 자동 수집하고, MongoDB에 저장/관리하는 백오피스 프로젝트입니다.

## 기술스택
- Frontend: Nuxt 3 (Vue 3), Pinia, TailwindCSS
- Backend: Node.js, Express
- Database: MongoDB

## 프로젝트 구조
```
.
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── crawlers
│   │   │   ├── naverMapCrawler.js
│   │   │   └── naverBlogCrawler.js
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   │   ├── pipeline
│   │   │   │   ├── dedupeKey.js
│   │   │   │   └── normalizeShop.js
│   │   │   └── scraperService.js
│   │   └── server.js
│   └── package.json
└── frontend
    ├── pages
    ├── stores
    ├── types
    └── package.json
```

## 1) Backend 실행
```bash
cd backend
npm install
npm run dev
```

### Backend 주요 API
- `GET /health`
- `GET /api/shops` 매장 목록 조회
- `POST /api/shops` 매장 수동 등록
- `PUT /api/shops/:id` 매장 수정
- `DELETE /api/shops/:id` 매장 삭제
- `GET /api/sources` 스크래핑 소스 목록
- `POST /api/sources` 스크래핑 소스 추가
- `PUT /api/sources/:id` 스크래핑 소스 수정
- `POST /api/scrape/run` 스크래핑 실행 (전체 또는 sourceId 지정)
- `GET /api/scrape/runs` 최근 실행 이력

## 2) 수집 소스 타입
- `custom`: URL + CSS selector 기반 범용 HTML 크롤링
- `naver-map`: 네이버 검색 기반 지도/플레이스 후보 수집
- `naver-blog`: 네이버 블로그 페이지 본문 기반 매장 정보 추출

> 실서비스 적용 시 robots.txt, 이용약관, API 정책 준수 여부를 반드시 확인하세요.

## 3) 데이터 파이프라인
1. 소스별 crawler에서 raw item 수집
2. `normalizeShop`에서 이름/주소/전화번호 정제
3. `buildExternalId`/dedupe 후보 생성
4. `Shop` upsert + `ScrapeRun` 이력 저장

## 자동 수집 스케줄
- 기본 cron: `0 */6 * * *` (6시간마다)
- `.env`의 `SCRAPE_CRON`으로 조정 가능

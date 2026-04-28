# 눈썹문신 매장 데이터 수집 백오피스

눈썹문신 샵/매장 정보를 관리하는 백오피스 프로젝트입니다. 기본 운영 방식은 **수동 입력 기반 DB 적재**이며, 스크래핑은 선택적으로만 사용할 수 있습니다.

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

## 2) 수동 수집 중심 스키마
`Shop` 문서에 수동 관리용 필드를 추가했습니다.

- 기본 정보: `name`, `address`, `city`, `phone`, `description`
- 채널 정보: `homepage`, `instagram`, `kakaoChannel`
- 운영 정보: `businessHours`, `bookingNotes`, `manualMemo`, `isActive`
- 데이터 출처 구분: `dataSourceType` (`manual` | `crawl`), `sourceName`

> 기본 등록은 `dataSourceType=manual`, `sourceName=manual`로 저장됩니다.

## 3) 백오피스 UI 변경점
- 상단에 **수동 매장 등록/수정 폼** 추가
- 목록에서 바로 **수정/삭제** 가능
- 매장 상태(활성/비활성) 관리 가능
- 스크래핑 제어/소스 관리는 하단으로 이동하여 **선택 기능**으로 유지

## (선택) 자동 수집 스케줄
- 기본 cron: `0 */6 * * *` (6시간마다)
- `.env`의 `SCRAPE_CRON`으로 조정 가능

# 눈썹문신 매장 데이터 수집 백오피스

눈썹문신 샵/매장 정보를 자동 스크래핑하고, MongoDB에 저장/관리하는 백오피스 프로젝트입니다.

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
│   │   ├── models
│   │   ├── routes
│   │   ├── services
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
cp .env.example .env
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

## 2) Frontend 실행
```bash
cd frontend
npm install
NUXT_PUBLIC_API_BASE=http://localhost:4000/api npm run dev
```

## 스크래핑 동작 방식
1. 백오피스에서 `스크래핑 소스`를 등록 (url + CSS selector)
2. 수동 실행 또는 cron 스케줄에 따라 페이지를 수집
3. 파싱된 매장을 `name/address/phone` 기반 externalId로 정규화하여 upsert
4. 실행 결과를 `ScrapeRun`에 저장

## 자동 수집 스케줄
- 기본 cron: `*/30 * * * *` (30분마다)
- `.env`의 `SCRAPE_CRON`으로 조정 가능

## 참고
- 사이트별 robots.txt/이용약관/법적 이슈를 확인 후 수집하세요.
- 동적 렌더링(JS 실행 필요) 사이트는 Playwright/Puppeteer 기반 수집기로 확장 가능합니다.

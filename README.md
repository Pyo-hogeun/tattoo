# 눈썹문신 매장 데이터 관리 백오피스

눈썹문신 샵/매장 정보를 **수동 입력 기반**으로 관리하는 백오피스 프로젝트입니다.

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

## 2) 수동 수집 중심 스키마
`Shop` 문서에 수동 관리용 필드를 추가했습니다.

- 기본 정보: `name`, `address`, `city`, `phone`, `description`
- 채널 정보: `homepage`, `instagram`, `kakaoChannel`
- 운영 정보: `businessHours`, `bookingNotes`, `manualMemo`, `isActive`
- 데이터 출처 구분: `dataSourceType` (`manual` | `crawl`), `sourceName`

> 기본 등록은 `dataSourceType=manual`, `sourceName=manual`로 저장됩니다.

## 3) 백오피스 UI
- 상단에 **수동 매장 등록/수정 폼**
- 목록에서 **검색/수정/삭제**
- 매장 상태(활성/비활성) 관리

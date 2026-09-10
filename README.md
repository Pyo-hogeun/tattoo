# Tattoo 통합 모노레포

백엔드, 관리자 프론트엔드와 일반 사용자 프론트엔드를 한 저장소에서 함께 관리하기 위한 npm workspaces 기반 모노레포입니다. API 변경과 두 프론트엔드의 연동을 하나의 브랜치와 Pull Request에서 처리할 수 있습니다.

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
├── frontend                 # 관리자 프론트엔드
│   ├── pages
│   ├── stores
│   ├── types
│   └── package.json
└── tattoo-web               # 일반 사용자 프론트엔드
    └── package.json
```

> `tattoo-web`의 소스는 별도 저장소의 Git 이력을 보존하는 방식으로 아래 절차에 따라 가져옵니다. 소스를 가져오기 전에도 백엔드와 관리자 프론트엔드는 루트 명령으로 실행할 수 있습니다.

## 설치 및 통합 실행

루트에서 한 번 설치하면 모든 workspace의 의존성이 함께 설치됩니다.

```bash
npm install
cp backend/.env.example backend/.env
npm run dev
```

`npm run dev`는 현재 존재하는 workspace의 `dev` 스크립트를 병렬 실행합니다. 기본 개발 포트는 API `4000`, 관리자 화면 `3000`, 일반 사용자 화면 `3001`을 사용합니다.

개별 실행도 가능합니다.

```bash
npm run dev:api
npm run dev:admin
npm run dev:web       # tattoo-web을 가져온 뒤 사용
npm run build         # 빌드 스크립트가 있는 모든 workspace 빌드
```

## 기존 tattoo-web 저장소 합치기

일반 사용자 프론트엔드의 기존 커밋 이력을 유지하려면 이 저장소의 루트에서 다음을 실행합니다. `<TATTOO_WEB_GIT_URL>`은 실제 저장소 URL로 바꿉니다.

```bash
git remote add tattoo-web <TATTOO_WEB_GIT_URL>
git fetch tattoo-web
git subtree add --prefix=tattoo-web tattoo-web main
git remote remove tattoo-web
npm install
```

기본 브랜치가 `master`라면 `main` 대신 `master`를 사용합니다. 가져온 프로젝트의 `package.json`에 고유한 `name`과 `dev`, `build` 스크립트가 있는지 확인하고, 이름을 `tattoo-web`으로 설정하면 루트의 `npm run dev:web` 명령도 바로 사용할 수 있습니다. 이후 사용자 프론트엔드만 다시 동기화해야 할 경우 `git subtree pull --prefix=tattoo-web tattoo-web main`을 사용할 수 있지만, 통합 완료 후에는 이 모노레포를 단일 원본으로 운영하는 것을 권장합니다.

## Backend 개별 실행
```bash
cd backend
npm install
npm run dev
```

### Backend 주요 API
- `GET /api-docs` Swagger UI API 문서
- `GET /api-docs/openapi.json` OpenAPI 3.0 명세(JSON)
- `GET /health`
- `GET /api/shops` 매장 목록 조회
- `POST /api/shops` 매장 수동 등록
- `PUT /api/shops/:id` 매장 수정
- `DELETE /api/shops/:id` 매장 삭제

Swagger 명세는 `backend/src/config/openapi.js`에서 관리합니다. API를 추가하거나 요청/응답 형식을 변경할 때 이 파일의 경로와 스키마도 함께 갱신하세요.

## 수동 수집 중심 스키마
`Shop` 문서에 수동 관리용 필드를 추가했습니다.

- 기본 정보: `name`, `address`, `city`, `phone`, `description`
- 채널 정보: `homepage`, `instagram`, `kakaoChannel`
- 운영 정보: `businessHours`, `bookingNotes`, `manualMemo`, `isActive`
- 데이터 출처 구분: `dataSourceType` (`manual` | `crawl`), `sourceName`

> 기본 등록은 `dataSourceType=manual`, `sourceName=manual`로 저장됩니다.

## 백오피스 UI
- 상단에 **수동 매장 등록/수정 폼**
- 목록에서 **검색/수정/삭제**
- 매장 상태(활성/비활성) 관리

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
- `GET /api-docs` Swagger UI API 문서
- `GET /api-docs/openapi.json` OpenAPI 3.0 명세(JSON)
- `GET /health`
- `GET /api/shops` 매장 목록 조회
- `POST /api/shops` 매장 수동 등록
- `PUT /api/shops/:id` 매장 수정
- `DELETE /api/shops/:id` 매장 삭제

Swagger 명세는 `backend/src/config/openapi.js`에서 관리합니다. API를 추가하거나 요청/응답 형식을 변경할 때 이 파일의 경로와 스키마도 함께 갱신하세요.

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

## 4) 카카오 회원가입 및 권한

필수 환경 변수는 `JWT_SECRET`, `KAKAO_CLIENT_ID`, 프론트엔드의
`NUXT_PUBLIC_KAKAO_CLIENT_ID`, `NUXT_PUBLIC_KAKAO_REDIRECT_URI`입니다. 카카오 개발자
콘솔에도 동일한 Redirect URI를 등록해야 합니다.

### 카카오 REST API 키 설정 방법

1. [카카오 개발자 콘솔](https://developers.kakao.com/console/app)에 로그인하고 애플리케이션을 생성합니다.
2. 애플리케이션의 **앱 키** 화면에서 **REST API 키**를 복사합니다. JavaScript 키가 아닙니다.
3. **카카오 로그인**을 활성화하고 Redirect URI에
   `http://localhost:3000/auth/kakao/callback`을 등록합니다. 운영 환경에서는 실제 HTTPS
   도메인의 `/auth/kakao/callback`도 별도로 등록해야 합니다.
4. 예제 파일을 복사하고, `your_kakao_rest_api_key`를 2번에서 복사한 같은 키로 교체합니다.

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

프론트엔드 `frontend/.env`:

```dotenv
NUXT_PUBLIC_KAKAO_CLIENT_ID=발급받은_REST_API_키
NUXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback
NUXT_PUBLIC_API_BASE=http://localhost:4000/api
```

백엔드 `backend/.env`:

```dotenv
KAKAO_CLIENT_ID=발급받은_동일한_REST_API_키
KAKAO_CLIENT_SECRET=
JWT_SECRET=충분히_긴_임의의_비밀문자열
```

Client Secret은 카카오 개발자 콘솔에서 별도로 활성화한 경우에만 입력합니다. `.env`를
수정한 뒤에는 Nuxt와 Express 개발 서버를 모두 완전히 종료하고 다시 실행해야 합니다.
`카카오 REST API 키가 설정되지 않았습니다.` 메시지는 브라우저에 전달되는
`NUXT_PUBLIC_KAKAO_CLIENT_ID` 값이 비어 있을 때 표시됩니다.

- `manager`: 카카오 가입 시 기본 권한. 본인이 등록한 갤러리 사진만 조회·등록·수정·삭제
- `admin`: 전체 매장 목록 조회 및 매장 정보 수정
- `master`: 전체 매장 관리 및 회원 권한 변경

회원가입 화면은 `/signup`, manager 갤러리는 `/gallery/manage`에서 이용합니다.
운영 환경에서는 최초 master 계정을 DB에서 지정한 뒤 `PATCH /api/auth/users/:id/role`로
나머지 회원의 권한을 관리하세요.

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
- `GET /api/gallery` R2 버킷의 `gallery/` 하위 이미지 전체 조회
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
`NUXT_PUBLIC_KAKAO_CLIENT_ID`, 백오피스용 `NUXT_PUBLIC_KAKAO_REDIRECT_URI`, 일반 사용자용
`NUXT_PUBLIC_KAKAO_USER_REDIRECT_URI`입니다. 카카오 개발자 콘솔에도 두 Redirect URI를 모두
등록해야 합니다.

### 카카오 REST API 키 설정 방법

1. [카카오 개발자 콘솔](https://developers.kakao.com/console/app)에 로그인하고 애플리케이션을 생성합니다.
2. 애플리케이션의 **앱 키** 화면에서 **REST API 키**를 복사합니다. JavaScript 키가 아닙니다.
3. **카카오 로그인**을 활성화하고 Redirect URI에 백오피스
   `http://localhost:3000/auth/kakao/callback`과 일반 사용자
   `http://localhost:3001/auth/kakao/callback`을 등록합니다. 운영 환경에서도 각 프론트엔드의
   실제 HTTPS Redirect URI를 별도로 등록해야 합니다.
4. 예제 파일을 복사하고, `your_kakao_rest_api_key`를 2번에서 복사한 같은 키로 교체합니다.

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

프론트엔드 `frontend/.env`:

```dotenv
NUXT_PUBLIC_KAKAO_CLIENT_ID=발급받은_REST_API_키
NUXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback
NUXT_PUBLIC_KAKAO_USER_REDIRECT_URI=http://localhost:3001/auth/kakao/callback
NUXT_PUBLIC_API_BASE=http://localhost:4000/api
```

백엔드 `backend/.env`:

```dotenv
KAKAO_CLIENT_ID=발급받은_동일한_REST_API_키
KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback
KAKAO_USER_REDIRECT_URI=http://localhost:3001/auth/kakao/callback
KAKAO_CLIENT_SECRET=
JWT_SECRET=충분히_긴_임의의_비밀문자열
```

Client Secret은 카카오 개발자 콘솔에서 별도로 활성화한 경우에만 입력합니다. `.env`를
수정한 뒤에는 Nuxt와 Express 개발 서버를 모두 완전히 종료하고 다시 실행해야 합니다.
`카카오 REST API 키가 설정되지 않았습니다.` 메시지는 브라우저에 전달되는
`NUXT_PUBLIC_KAKAO_CLIENT_ID` 값이 비어 있을 때 표시됩니다.

카카오 동의 후 `Not exist client_id []`가 표시된다면 프론트엔드 키는 있으나 백엔드의
`KAKAO_CLIENT_ID`가 비어 있다는 뜻입니다. `backend/.env`가 저장소 루트가 아닌
`backend` 디렉터리 안에 있는지 확인하고 백엔드 서버를 재시작하세요. 백엔드의
`KAKAO_REDIRECT_URI`와 `KAKAO_USER_REDIRECT_URI`도 각각의 프론트엔드 환경 변수 및 카카오
개발자 콘솔에 등록한 값과 정확히 같아야 합니다.

`Bad client credentials`가 표시되면 다음 두 항목을 확인하세요.

1. `frontend/.env`의 `NUXT_PUBLIC_KAKAO_CLIENT_ID`와 `backend/.env`의
   `KAKAO_CLIENT_ID`가 같은 애플리케이션의 **REST API 키**로 완전히 동일해야 합니다.
2. 카카오 개발자 콘솔에서 Client Secret을 활성화하지 않았다면
   `KAKAO_CLIENT_SECRET=`을 빈 값으로 둡니다. 활성화했다면 REST API 키나 Admin 키가
   아니라 콘솔의 **Client Secret 코드**를 입력하고 활성화 상태가 `사용함`인지 확인합니다.

환경 변수를 수정한 후에는 진행 중이던 카카오 동의 창을 닫고 프론트엔드와 백엔드 서버를
모두 재시작한 다음 처음부터 다시 시도해야 합니다. 인가 코드는 일회용이므로 오류가 발생한
콜백 페이지를 새로고침해서 재사용할 수 없습니다.

### 테스트 전용 ID/PW 인증

여러 매장 계정과 `manager`, `admin`, `master` 권한을 로컬에서 테스트할 때만 양쪽 환경
변수를 활성화할 수 있습니다.

```dotenv
# backend/.env
ENABLE_TEST_AUTH=true

# frontend/.env
NUXT_PUBLIC_ENABLE_TEST_AUTH=true
```

활성화하면 `/signup`과 `/`에 테스트 전용 ID/PW 입력란이 표시되고
`POST /api/auth/test/signup`, `POST /api/auth/test/login`을 사용할 수 있습니다. 테스트
가입에서 `manager`를 선택하면 매장명, 주소, 전화번호가 필요합니다. `admin` 또는 `master`는
매장 정보를 입력하지 않아도 가입할 수 있으며 선택한 역할로 계정이 생성됩니다. 비밀번호는
scrypt 해시로만 저장됩니다. 이 기능은 임시 테스트 용도이므로 **운영 환경에서는 두 값을
반드시 `false`로 유지해야 합니다. 백엔드 API는 코드에서도 `NODE_ENV=production`일 때
강제로 비활성화됩니다.

백엔드 시작 시 기존 `User.kakaoId` unique index를 현재 sparse index 정의와 동기화합니다.
따라서 테스트 인증 기능을 처음 적용한 뒤에는 백엔드를 재시작해야 여러 ID/PW 계정을
카카오 ID 없이 생성할 수 있습니다.

- `manager`: 카카오 가입 시 기본 권한. 본인이 등록한 갤러리 사진만 조회·등록·수정·삭제
- `admin`: 전체 매장 목록 조회 및 매장 정보 수정
- `master`: 전체 매장 관리 및 회원 권한 변경

회원가입 화면은 `/signup`, manager 갤러리는 `/gallery/manage`에서 이용합니다.
운영 환경에서는 최초 master 계정을 DB에서 지정한 뒤 `PATCH /api/auth/users/:id/role`로
나머지 회원의 권한을 관리하세요.

`master`, `admin` 계정은 백오피스의 `/users`에서 사용자 목록을 검색·필터링하고 상세 화면에서
닉네임, 권한, 활성 상태를 수정할 수 있습니다. `admin`은 `master` 계정을 수정하거나 다른
사용자에게 `master` 권한을 부여할 수 없으며, 현재 로그인한 계정은 스스로 비활성화할 수 없습니다.
사용자 상세 화면에서 `master`와 `admin`이 계정을 삭제할 수 있으며 `admin`은 `master`를 삭제할 수
없습니다. 로그인한 본인은 상단 프로필 메뉴의 **내 계정 삭제**를 사용할 수 있습니다. 관리 권한이
완전히 사라지는 것을 막기 위해 마지막 활성 `master` 계정은 본인 또는 다른 관리자도 삭제할 수 없습니다.

로그인 후 백오피스 상단 GNB에서 현재 세션 상태, 닉네임, 권한과 소속 매장을 확인할 수 있습니다.
프로필 메뉴의 로그아웃을 선택하면 브라우저에 저장된 인증 토큰과 사용자 정보를 삭제하고 로그인
화면으로 이동합니다.

### 일반 사용자 카카오 회원가입

`/user/signup`은 매장 관리자를 위한 `/signup`과 분리된 일반 사용자 회원가입 화면입니다.
매장명·주소·전화번호를 입력하지 않고 카카오 인증과 필수 안내 동의만으로 가입하며,
`POST /api/auth/kakao/user/signup`을 호출해 별도의 `Customer` 컬렉션에 저장합니다. 동일한 카카오
계정이 일반 사용자와 매장 파트너 계정으로 각각 가입할 수 있습니다. 일반 사용자 인증 결과는
백오피스의 `auth_token`, `auth_user`와 섞이지 않도록 `customer_auth_token`,
`customer_auth_user` 키에 저장합니다.

일반 사용자 API는 다음과 같습니다. 모든 인증 API와 상호작용 API는 백오피스 토큰이 아닌
`customer_auth_token`을 `Authorization: Bearer <token>`으로 전송해야 합니다.

- `POST /api/auth/kakao/user/signup`: 일반 사용자 카카오 회원가입
- `POST /api/auth/kakao/user/login`: 기존 일반 사용자 카카오 로그인
- `GET /api/auth/user/me`: 현재 일반 사용자 세션 조회
- `DELETE /api/auth/user/me`: 본인 계정과 상호작용 데이터 삭제
- `GET /api/interactions`: 본인의 좋아요·북마크 목록 조회
- `POST /api/interactions`: `{ targetType: "gallery", targetId, type: "like" | "bookmark" }` 생성
- `DELETE /api/interactions/:id`: 본인의 상호작용 삭제

`/api/interactions`는 Customer JWT 전용 인증을 사용하므로 다른 사용자의 데이터는 조회하거나
삭제할 수 없으며, 같은 대상과 유형을 반복 등록해도 중복 레코드를 만들지 않습니다.

일반 사용자 OAuth에는 `NUXT_PUBLIC_KAKAO_USER_REDIRECT_URI`와 `KAKAO_USER_REDIRECT_URI`를,
매장 관리자 OAuth에는 `NUXT_PUBLIC_KAKAO_REDIRECT_URI`와 `KAKAO_REDIRECT_URI`를 사용합니다.
서로 다른 프론트엔드 도메인을 사용해도 callback 주소가 섞이지 않습니다.

브라우저에서 로그인 또는 회원가입 API 호출 시 CORS 오류가 발생하면 `FRONTEND_ORIGIN`과
`FRONTEND_ORIGIN_USER`에 각각 실제 브라우저 주소의 **origin**을 설정하고 백엔드를 재시작하세요.
origin에는 `/login` 같은 경로를 포함하지 않으며, 프로토콜과 포트까지 일치해야 합니다. 허용할
주소가 여러 개면 `https://example.com,https://www.example.com`처럼 쉼표로 구분할 수 있습니다.

manager가 갤러리에서 업로드한 JPG, PNG, WEBP, GIF 파일은 `/brow-shapes/manage`의 이미지와
동일한 Cloudflare R2 버킷에 `gallery/...` 키로 저장됩니다. 파일당 최대 크기는 10MB입니다.
백엔드 `.env`에 `R2_ENDPOINT`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET`,
`R2_PUBLIC_URL`을 설정해야 하며, `R2_PUBLIC_URL`은 브라우저에서 이미지를 읽을 수 있는
R2 공개 도메인 또는 연결한 사용자 지정 도메인이어야 합니다.

`GET /api/gallery`는 인증 없이 사용할 수 있으며, R2의 페이지를 모두 순회하여 `gallery/`
하위 파일의 공개 URL, 키, 크기, 최종 수정 시각, ETag를 최신순으로 반환합니다. DB에 등록된
갤러리 파일에는 게시자 이름(매장명), 게시일, 작품 제목 및 설명도 함께 반환합니다. R2에는
있지만 DB 등록 정보가 없는 파일의 게시 정보는 `null`입니다.

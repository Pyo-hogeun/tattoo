# EYEBROW 사용자용 프론트엔드

Nuxt 4 기반 사용자 웹 프론트엔드입니다. HttpOnly Cookie 인증을 사용하며, 기존 Node.js API와 Cloudflare R2 공개 이미지 도메인을 공유합니다.

## 실행

```bash
cp .env.example .env
npm install
npm run dev
```

검증 명령:

```bash
npm run typecheck
npm run lint
npm run build
```

## 환경 변수

- `NUXT_PUBLIC_API_BASE_URL`: Node.js API 기본 주소 (예: `http://localhost:10000/api/v1`)
- `NUXT_PUBLIC_IMAGE_BASE_URL`: R2 공개 이미지 도메인입니다. Access/Secret Key를 여기에 넣지 마세요.

## 필요한 백엔드 API

| Method | Path | 용도 |
| --- | --- | --- |
| GET | `/auth/me` | Cookie 기반 로그인 상태 및 사용자 반환 |
| POST | `/auth/login` | 로그인 및 HttpOnly Cookie 설정 |
| POST | `/auth/logout` | 세션 종료 |
| POST | `/auth/signup` | 회원가입 (TODO) |
| POST | `/users/me/avatar` | `image: File` 프로필 사진 업로드 |
| POST | `/reviews/images` | `images: File[]` 후기 이미지 업로드 |

이미지 업로드 API는 Multer, Sharp, R2, MongoDB를 서버에서 처리하고, `{ key, url, width, height, size, mimeType }` 형식의 공개 URL을 반환해야 합니다. 프론트엔드는 R2에 직접 업로드하지 않습니다.

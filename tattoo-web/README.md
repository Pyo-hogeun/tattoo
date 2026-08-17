# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Gallery account interactions

The backend interactions endpoints are currently unavailable. The production client therefore does not call `/interactions` or the legacy `/gallery/interactions` route. Interaction behavior lives behind `src/services/galleryInteractions.ts`; it returns a clear unavailable state until a backend adapter is implemented.

For explicit local UI development only, set `VITE_ENABLE_INTERACTIONS_MOCK=true`. The mock is additionally restricted to Vite development mode and stores data under `customer_interactions_mock`; production builds ignore the flag. Mock data is not server data and must not be treated as persistence.

When the backend endpoints are implemented, the adapter can send the customer JWT as a Bearer token. The intended gallery response may include the current customer's state:

```json
{
  "liked": true,
  "scrapped": false,
  "likeCount": 12,
  "scrapCount": 4
}
```

The future interactions API contract must be added to the adapter rather than directly to a Vue component. Do not restore the former `POST /api/gallery/interactions` call: that endpoint is not part of the current backend.

```json
{
  "key": "gallery/example.png",
  "action": "like",
  "active": true
}
```

`action` is either `like` or `scrap`. Once implemented, the backend must identify the Customer from the application JWT, return `401` when it is missing or invalid, and return the updated interaction state using the response shape above. Persistence should use the Customer primary key plus the gallery key as a unique pair so repeated requests cannot create duplicate likes or scraps.

The JWT issued by the customer signup/login endpoints must identify the Customer collection record expected by the interaction guard. In particular, the token `sub` (or the backend's documented customer-id claim), token audience/type, signing key, and lookup collection must match the interaction authentication middleware. Issuing a token that points to a back-office User ID and then looking it up in Customer produces `유효하지 않은 계정입니다.` even though signup succeeded. The web client sends the returned token unchanged as `Authorization: Bearer <token>` and clears the local customer session when the backend reports an invalid account.

## Kakao customer signup and uploads

The public customer flow is separate from the shop-partner back office. Only `POST /api/auth/kakao/user/signup` currently exists. `/signup` starts the `user-signup` OAuth flow and `/auth/kakao/callback` validates its state before calling that endpoint. Existing-customer login is visibly marked as unavailable and the frontend never calls the unimplemented `/api/auth/kakao/user/login`, `/api/auth/user/me`, or `/api/auth/user/me` deletion endpoints. The callback claims and removes its one-time OAuth state before exchanging the authorization code, preventing a refresh or remount from sending the code twice.

The authorize request does not force optional Kakao scopes. Requesting `profile_nickname` before the nickname consent item is enabled for the Kakao app causes Kakao error `KOE205` and prevents authorization. Enable the nickname consent item in Kakao Developers first; Kakao then applies the app's configured consent scopes during authorization. The backend must read an available nickname from the Kakao user-info response, persist it on Customer, and return it as `user.nickname` instead of replacing it with a static `사용자` value. If Kakao does not return a nickname, inspect the app consent configuration and the user-info response/consent state before applying a fallback.

Signup must return `201` with `{ "token", "user": { "id", "nickname", "role": "user" } }`. Customer credentials are stored only under `customer_auth_token` and `customer_auth_user`; the back-office keys `auth_token` and `auth_user` are not read or changed. Local logout only clears this frontend session because the backend account/session endpoints are not implemented. The Kakao client secret, access-token exchange, profile lookup, duplicate-customer validation, and Customer creation remain backend responsibilities.

### Diagnosing contradictory duplicate and not-found responses

If signup returns `409` while login with the same Kakao account returns `404`, deleting only the back-office User is not sufficient evidence that every identity record was removed. Check the backend for a Customer record (including soft-deleted or inactive records), a separate OAuth/provider identity collection, stale unique indexes, and whether signup and login use the same Kakao app/client ID and the same normalized provider user ID. Signup duplicate detection and login lookup must query the same Customer identity scope. A partner identity must not be accepted as a Customer session.

Error responses should include a stable machine-readable `code` and an `X-Request-Id` header. The callback displays those non-secret values with the HTTP status so the matching server log can be located without exposing the Kakao authorization code or JWT.

Required web configuration:

```env
VITE_KAKAO_CLIENT_ID=your_kakao_rest_api_key
VITE_KAKAO_USER_REDIRECT_URI=http://localhost:5173/auth/kakao/callback
VITE_ENABLE_INTERACTIONS_MOCK=false
```

The redirect URI must exactly match the backend `KAKAO_REDIRECT_URI` and Kakao developer-console registration. The backend must also allow the web origin through `FRONTEND_ORIGIN_USER`. Authenticated customer uploads use `POST /api/gallery` with the customer bearer token and multipart fields `image`, `title`, and `description`.

## API proxy and CORS

The browser calls the same-origin `/api` path by default. During `vite` development and preview, `vite.config.ts` proxies that path to `VITE_API_PROXY_TARGET` without rewriting it. For example, a browser request to `/api/gallery` is forwarded to `http://localhost:4000/api/gallery`. This avoids browser CORS preflights during local development, keeps credentialed session requests on the web origin, and preserves the backend's `/api` route prefix.

```env
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:4000
```

Production hosting must provide the equivalent reverse proxy (`/api/*` to the backend) because the Vite development proxy is not part of the production bundle. If production intentionally calls the backend origin directly instead, the backend must return an explicit `Access-Control-Allow-Origin` matching the web origin (not `*` when credentials are used), `Access-Control-Allow-Credentials: true`, and accept the required methods and headers. A successful backend response can still be blocked by the browser when these CORS headers are absent or invalid.

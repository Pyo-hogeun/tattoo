# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Gallery account interactions

The gallery sends the customer JWT as a Bearer token when `customer_auth_token` exists. The gallery response may include the current customer's state:

```json
{
  "liked": true,
  "scrapped": false,
  "likeCount": 12,
  "scrapCount": 4
}
```

Likes and scraps are persisted through `POST /api/gallery/interactions` with this request body:

```json
{
  "key": "gallery/example.png",
  "action": "like",
  "active": true
}
```

`action` is either `like` or `scrap`. The backend must identify the Customer from the application JWT, return `401` when it is missing or invalid, and return the updated interaction state using the response shape above. Persistence should use the Customer primary key plus the gallery key as a unique pair so repeated requests cannot create duplicate likes or scraps.

## Kakao customer signup and uploads

The public customer flow is separate from the shop-partner back office. `/signup` offers both new-customer signup and existing-customer login. Each action creates OAuth `state` with Web Crypto and stores an explicit `user-signup` or `user-login` flow before sending the browser to Kakao. `/auth/kakao/callback` validates both the returned state and flow, then calls `POST /api/auth/kakao/user/signup` for signup or `POST /api/auth/kakao/user/login` for login. It never calls the shop-partner endpoints. The callback claims and removes its one-time OAuth state before exchanging the authorization code, preventing a refresh or remount from sending the code twice.

Signup must return `201`, and login must return `200`. Both responses must contain `{ "token", "user": { "id", "nickname", "role": "user" } }`. Customer credentials are stored only under `customer_auth_token` and `customer_auth_user`; the back-office keys `auth_token` and `auth_user` are not read or changed. The Kakao client secret, access-token exchange, profile lookup, duplicate-customer validation, and Customer creation remain backend responsibilities.

Required web configuration:

```env
VITE_KAKAO_CLIENT_ID=your_kakao_rest_api_key
VITE_KAKAO_REDIRECT_URI=http://localhost:5173/auth/kakao/callback
```

The redirect URI must exactly match the backend `KAKAO_REDIRECT_URI` and Kakao developer-console registration. The backend must also allow the web origin through `FRONTEND_ORIGIN_USER`. Authenticated customer uploads use `POST /api/gallery` with the customer bearer token and multipart fields `image`, `title`, and `description`.

## API proxy and CORS

The browser calls the same-origin `/api` path by default. During `vite` development and preview, `vite.config.ts` proxies that path to `VITE_API_PROXY_TARGET` without rewriting it. For example, a browser request to `/api/gallery` is forwarded to `http://localhost:4000/api/gallery`. This avoids browser CORS preflights during local development, keeps credentialed session requests on the web origin, and preserves the backend's `/api` route prefix.

```env
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:4000
```

Production hosting must provide the equivalent reverse proxy (`/api/*` to the backend) because the Vite development proxy is not part of the production bundle. If production intentionally calls the backend origin directly instead, the backend must return an explicit `Access-Control-Allow-Origin` matching the web origin (not `*` when credentials are used), `Access-Control-Allow-Credentials: true`, and accept the required methods and headers. A successful backend response can still be blocked by the browser when these CORS headers are absent or invalid.

# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Gallery account interactions

The gallery sends the existing account session cookie with both gallery and interaction requests (`credentials: 'include'`). The gallery response may include the current account's state:

```json
{
  "liked": true,
  "scrapped": false,
  "likeCount": 12,
  "scrapCount": 4
}
```

Likes and scraps are persisted through `POST /gallery/interactions` with this request body:

```json
{
  "key": "gallery/example.png",
  "action": "like",
  "active": true
}
```

`action` is either `like` or `scrap`. The backend must identify the account from its existing authenticated session, return `401` when there is no account session, and return the updated interaction state using the response shape above. Persistence should use the existing account primary key plus the gallery key as a unique pair so repeated requests cannot create duplicate likes or scraps. Cross-origin deployments must allow credentialed CORS requests from the web origin.

## Kakao member signup and uploads

Kakao OAuth secrets and the authorization-code exchange must remain on the backend. The web client uses the following session-based contract under `VITE_API_BASE_URL`:

- `GET /auth/kakao/start?returnUrl=...`: create and validate OAuth `state`, then redirect to Kakao authorization. After Kakao callback processing, create or find the local member linked by the stable Kakao user ID, issue the existing secure session cookie, and redirect to `returnUrl`.
- `GET /auth/me`: return `{ "id", "nickname", "profileImageUrl" }` for the current session or `401`.
- `POST /auth/logout`: invalidate the current session.
- `POST /gallery`: authenticated multipart upload with `image`, `title`, and `description`; return `401` when signed out.

The backend account table should uniquely link the Kakao provider user ID to one local account. Do not send a Kakao REST API key, client secret, authorization code, or access token to this SPA. For cross-origin development, allow the configured web origin, credentials, and the required methods/headers; the session cookie must use the deployment-appropriate `Secure` and `SameSite` attributes.

## API proxy and CORS

The browser calls the same-origin `/api` path by default. During `vite` development and preview, `vite.config.ts` proxies that path to `VITE_API_PROXY_TARGET` and removes the `/api` prefix before forwarding it. For example, a browser request to `/api/gallery` is forwarded to `http://localhost:4000/gallery`. This avoids browser CORS preflights during local development and keeps credentialed session requests on the web origin.

```env
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:4000
```

Production hosting must provide the equivalent reverse proxy (`/api/*` to the backend) because the Vite development proxy is not part of the production bundle. If production intentionally calls the backend origin directly instead, the backend must return an explicit `Access-Control-Allow-Origin` matching the web origin (not `*` when credentials are used), `Access-Control-Allow-Credentials: true`, and accept the required methods and headers. A successful backend response can still be blocked by the browser when these CORS headers are absent or invalid.

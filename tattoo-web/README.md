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

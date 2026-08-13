/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_PROXY_TARGET?: string
  readonly VITE_IMAGE_BASE_URL?: string
  readonly VITE_KAKAO_CLIENT_ID?: string
  readonly VITE_KAKAO_USER_REDIRECT_URI?: string
  readonly VITE_ENABLE_INTERACTIONS_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

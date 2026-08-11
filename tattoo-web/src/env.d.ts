/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_PROXY_TARGET?: string
  readonly VITE_IMAGE_BASE_URL?: string
  readonly VITE_KAKAO_CLIENT_ID?: string
  readonly VITE_KAKAO_REDIRECT_URI?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

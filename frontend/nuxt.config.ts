export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000/api',
      kakaoClientId: process.env.NUXT_PUBLIC_KAKAO_CLIENT_ID || '',
      kakaoRedirectUri: process.env.NUXT_PUBLIC_KAKAO_REDIRECT_URI || 'http://localhost:3000/auth/kakao/callback'
    }
  },
  devtools: { enabled: true }
});

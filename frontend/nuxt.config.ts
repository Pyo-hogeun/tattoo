export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:4000/api',
      kakaoClientId: '',
      kakaoRedirectUri: 'http://localhost:3000/auth/kakao/callback',
      enableTestAuth: false
    }
  },
  devtools: { enabled: true }
});

const imageBaseUrl = process.env.NUXT_PUBLIC_IMAGE_BASE_URL ?? 'https://img.example.com'
const imageDomain = new URL(imageBaseUrl).hostname

export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxt/image', '@nuxt/icon', '@nuxt/eslint'],
  css: ['~/assets/scss/main.scss'],
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  typescript: { strict: true, typeCheck: true },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:10000/api/v1',
      imageBaseUrl: process.env.NUXT_PUBLIC_IMAGE_BASE_URL ?? 'https://img.example.com'
    }
  },
  image: {
    domains: [imageDomain],
    format: ['webp', 'avif'],
    screens: { sm: 640, md: 768, lg: 1024, xl: 1280 }
  },
  app: {
    head: { htmlAttrs: { lang: 'ko' }, titleTemplate: '%s | EYEBROW', meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }] }
  },
  routeRules: {
    '/': { swr: 300 },
    '/login': { ssr: false, robots: false },
    '/signup': { ssr: false, robots: false },
    '/mypage/**': { ssr: false, robots: false }
  },
  compatibilityDate: '2025-07-15'
})

import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  // Keep the existing root-level Nuxt directory structure while using Nuxt 4.
  srcDir: '.',
  modules: ['@pinia/nuxt'],
  css: ['~/assets/scss/main.scss'],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      title: 'INK ATELIER | 타투 스튜디오',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '나만의 이야기를 선으로 남기는 프라이빗 타투 스튜디오' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Noto+Sans+KR:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap' },
      ],
    },
  },
  devtools: { enabled: false },
  compatibilityDate: '2024-11-01',
})

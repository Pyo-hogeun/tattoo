export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: ['~/assets/scss/main.scss'],
  app: {
    head: {
      title: 'INK ATELIER | 타투 스튜디오',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '나만의 이야기를 선으로 남기는 프라이빗 타투 스튜디오' },
      ],
    },
  },
  devtools: { enabled: false },
  compatibilityDate: '2024-11-01',
})

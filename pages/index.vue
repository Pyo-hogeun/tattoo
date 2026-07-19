<script setup lang="ts">
const booking = useBookingStore()
const isMenuOpen = ref(false)

const works = [
  { title: 'Quiet bloom', type: 'Fine line · 2024', image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=900&q=85' },
  { title: 'After the rain', type: 'Blackwork · 2024', image: 'https://images.unsplash.com/photo-1565058379802-bbe93b2f703e?auto=format&fit=crop&w=900&q=85' },
  { title: 'Small universe', type: 'Micro tattoo · 2023', image: 'https://images.unsplash.com/photo-1590246814883-57d07b969d4d?auto=format&fit=crop&w=900&q=85' },
]

function navigate(id: string) {
  isMenuOpen.value = false
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <main>
    <header class="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 text-paper md:px-12">
      <a href="#top" class="mono text-sm font-medium tracking-[.24em]">INK<br>ATELIER</a>
      <nav class="hidden gap-8 text-xs md:flex"><button @click="navigate('#work')">WORK</button><button @click="navigate('#about')">ABOUT</button><button @click="navigate('#visit')">VISIT</button></nav>
      <button class="hidden border border-paper/70 px-4 py-2 text-xs md:block" @click="booking.open()">예약 문의</button>
      <button class="text-2xl md:hidden" aria-label="메뉴" @click="isMenuOpen = !isMenuOpen">{{ isMenuOpen ? '×' : '☰' }}</button>
    </header>
    <nav v-if="isMenuOpen" class="fixed inset-0 z-10 grid place-content-center gap-8 bg-ink text-center text-paper"><button @click="navigate('#work')">WORK</button><button @click="navigate('#about')">ABOUT</button><button @click="navigate('#visit')">VISIT</button><button class="border border-paper px-6 py-3" @click="booking.open()">예약 문의</button></nav>

    <section id="top" class="relative min-h-[780px] overflow-hidden bg-ink text-paper">
      <img src="https://images.unsplash.com/photo-1590246814883-57d07b969d4d?auto=format&fit=crop&w=1800&q=90" alt="섬세한 타투 작업" class="absolute inset-0 h-full w-full object-cover opacity-55" />
      <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/35" />
      <div class="relative mx-auto flex min-h-[780px] max-w-7xl flex-col justify-end px-6 pb-14 md:px-12 md:pb-20">
        <p class="mono mb-5 text-[10px] tracking-[.25em] text-paper/75">SEOUL · KOREA / PRIVATE STUDIO</p>
        <h1 class="display-font max-w-4xl text-5xl leading-[.95] md:text-8xl">A story,<br><i>drawn on skin.</i></h1>
        <div class="mt-10 flex items-center justify-between border-t border-paper/35 pt-4 text-xs"><span>당신의 가장 개인적인 이야기를, 가장 오래 남는 선으로.</span><button class="rounded-full border border-paper/70 px-5 py-3" @click="booking.open()">예약하기 ↗</button></div>
      </div>
    </section>

    <section id="work" class="px-6 py-20 md:px-12 md:py-32">
      <div class="mx-auto max-w-7xl"><div class="flex items-end justify-between"><div><p class="mono text-[10px] tracking-[.2em] text-rust">01 / SELECTED WORKS</p><h2 class="display-font mt-3 text-4xl md:text-6xl">Marks that matter.</h2></div><span class="hidden text-sm text-ink/55 md:block">Scroll to explore ↓</span></div>
        <div class="mt-12 grid gap-7 md:grid-cols-3"><article v-for="(work, index) in works" :key="work.title" :class="index === 1 ? 'md:mt-20' : ''"><img :src="work.image" :alt="work.title" class="h-[430px] w-full object-cover grayscale transition duration-500 hover:grayscale-0" /><div class="mt-4 flex justify-between border-b border-ink/20 pb-4"><div><h3 class="display-font text-xl">{{ work.title }}</h3><p class="mono mt-1 text-[10px] text-ink/55">{{ work.type }}</p></div><span class="text-lg">↗</span></div></article></div>
      </div>
    </section>

    <section id="about" class="bg-[#dedbd1] px-6 py-20 md:px-12 md:py-32"><div class="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:gap-28"><div><p class="mono text-[10px] tracking-[.2em] text-rust">02 / THE STUDIO</p><h2 class="display-font mt-4 text-5xl leading-tight md:text-7xl">Made slowly,<br><i>made for you.</i></h2></div><div class="pt-2 text-base leading-8 text-ink/75"><p>INK ATELIER는 한 사람의 취향과 시간을 듣는 것에서 시작합니다. 유행보다 오래 남을 선, 몸의 움직임에 자연스럽게 머무는 디자인을 함께 찾습니다.</p><p class="mt-6">모든 작업은 100% 예약제로 진행되며, 충분한 상담 후 단 한 사람을 위한 도안을 완성합니다.</p><button class="mt-9 border-b border-ink pb-2 text-sm font-semibold" @click="booking.open()">작업 방식 알아보기 ↗</button></div></div></section>

    <section id="visit" class="bg-ink px-6 py-20 text-paper md:px-12 md:py-28"><div class="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.3fr_.7fr]"><div><p class="mono text-[10px] tracking-[.2em] text-rust">03 / COME VISIT</p><h2 class="display-font mt-4 text-5xl md:text-7xl">Let’s make<br><i>something lasting.</i></h2><button class="mt-10 bg-paper px-6 py-4 text-sm font-semibold text-ink transition hover:bg-rust hover:text-paper" @click="booking.open()">예약 문의하기 ↗</button></div><address class="not-italic text-sm leading-7 text-paper/70"><p class="text-paper">INK ATELIER</p><p class="mt-5">서울시 성동구 연무장길 00<br>2F, Seongsu-dong, Seoul</p><p class="mt-5">Tue — Sat / 12:00 — 20:00<br>Sun, Mon / Closed</p><a href="mailto:hello@inkatelier.kr" class="mt-5 inline-block border-b border-paper/50 pb-1 text-paper">hello@inkatelier.kr</a></address></div><footer class="mono mx-auto mt-16 flex max-w-7xl justify-between border-t border-paper/20 pt-5 text-[9px] tracking-wider text-paper/45"><span>© 2025 INK ATELIER</span><span>INSTAGRAM / KAKAO</span></footer></section>
    <BookingModal />
  </main>
</template>

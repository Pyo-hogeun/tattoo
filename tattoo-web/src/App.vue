<script setup lang="ts">
import { ref } from 'vue'

type NavItem = 'gallery' | 'profile' | 'setting'

const activeNav = ref<NavItem>('gallery')

const navItems: { id: NavItem; label: string }[] = [
  { id: 'gallery', label: 'Gallery' },
  { id: 'profile', label: 'Profile' },
  { id: 'setting', label: 'Setting' },
]

function selectNav(item: NavItem) {
  activeNav.value = item
}
</script>

<template>
  <main class="app-shell">
    <header class="gnb">
      <a class="brand" href="#" aria-label="Ink Archive home">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3.5 26.8 16 16 28.5 5.2 16 16 3.5Z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="m11 16 3.2 3.2L21.5 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>INK<br>ARCHIVE</span>
      </a>

      <nav aria-label="Primary navigation">
        <button
          v-for="item in navItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: activeNav === item.id }"
          :aria-label="item.label"
          :aria-current="activeNav === item.id ? 'page' : undefined"
          @click="selectNav(item.id)"
        >
          <svg v-if="item.id === 'gallery'" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="8.2" cy="8.2" r="1.4" fill="currentColor"/><path d="m5 18 4.3-4.4 3.1 2.7 2.2-2.2L19 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <svg v-else-if="item.id === 'profile'" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M5.1 20c.7-3.6 3.3-5.6 6.9-5.6s6.2 2 6.9 5.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M19.1 13.5a7.4 7.4 0 0 0 .1-1.5 7.4 7.4 0 0 0-.1-1.5l2-1.5-2-3.4-2.4 1a7.4 7.4 0 0 0-2.6-1.5L13.8 2h-3.9l-.3 3.1a7.4 7.4 0 0 0-2.6 1.5l-2.4-1-2 3.4 2 1.5A7.4 7.4 0 0 0 4.5 12c0 .5 0 1 .1 1.5l-2 1.5 2 3.4 2.4-1a7.4 7.4 0 0 0 2.6 1.5l.3 3.1h3.9l.3-3.1a7.4 7.4 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.5Z" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/></svg>
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <button class="menu-button" aria-label="Open menu"><span></span><span></span></button>
    </header>

    <section class="container">
      <div class="eyebrow"><span></span>Curated collection / 2024—25</div>
      <div class="title-row">
        <div>
          <p class="kicker">Selected work</p>
          <h1>DRAWN TO<br><em>THE</em> SKIN.</h1>
        </div>
        <p class="intro">A personal record of lines, symbols, and stories. Small works made to live with you.</p>
      </div>

      <div class="gallery-grid">
        <article class="tattoo-card card-one"><span class="card-no">01 / 08</span><div class="mark flower">✣</div><div class="card-footer"><span>Botanical study</span><span>2025</span></div></article>
        <article class="tattoo-card card-two"><span class="card-no">02 / 08</span><div class="mark script">amor<br>fati</div><div class="card-footer"><span>Word / wrist</span><span>2025</span></div></article>
        <article class="tattoo-card card-three"><span class="card-no">03 / 08</span><div class="mark moth">◈</div><div class="card-footer"><span>Night flight</span><span>2024</span></div></article>
      </div>

      <footer class="page-footer"><span>Scroll to explore</span><span class="scroll-line"></span><span>Seoul, KR</span></footer>
    </section>
  </main>
</template>

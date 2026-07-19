<template>
  <div class="min-h-screen bg-stone-50 text-stone-900">
    <header class="border-b border-stone-200 bg-white"><nav class="mx-auto flex max-w-5xl items-center justify-between px-5 py-4" aria-label="주 메뉴">
      <NuxtLink to="/" class="font-serif text-xl font-bold tracking-wide">EYEBROW</NuxtLink>
      <NuxtLink to="/mypage" class="rounded-full px-3 py-2 text-sm hover:bg-stone-100">마이페이지</NuxtLink>
    </nav></header>
    <main class="mx-auto max-w-5xl px-5 py-10"><slot /></main>
  </div>
</template>

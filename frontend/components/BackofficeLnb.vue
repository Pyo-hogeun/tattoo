<template>
  <aside class="w-56 shrink-0 rounded-xl border bg-white p-3 shadow-sm">
    <h2 class="mb-3 text-sm font-semibold text-slate-700">백오피스 메뉴</h2>
    <nav class="space-y-1 text-sm">
      <NuxtLink to="/shops/list" class="block rounded px-3 py-2 hover:bg-slate-100" active-class="bg-slate-900 text-white">
        매장 목록
      </NuxtLink>
      <NuxtLink to="/shops/manage" class="block rounded px-3 py-2 hover:bg-slate-100" active-class="bg-slate-900 text-white">
        신규입력 / 수정
      </NuxtLink>
    </nav>
  </aside>
</template>

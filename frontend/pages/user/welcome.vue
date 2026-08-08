<script setup lang="ts">
import { onMounted, ref } from 'vue';
const nickname = ref('사용자');
onMounted(() => {
  try { nickname.value = JSON.parse(localStorage.getItem('customer_auth_user') || '{}').nickname || '사용자'; } catch { nickname.value = '사용자'; }
});
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-stone-50 px-5"><section class="w-full max-w-md rounded-3xl border bg-white p-8 text-center shadow-xl"><div class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-700">✓</div><h1 class="mt-5 text-2xl font-bold">회원가입이 완료되었습니다</h1><p class="mt-3 text-stone-500">{{ nickname }}님, 환영합니다.</p><NuxtLink to="/" class="mt-7 block rounded-xl bg-stone-900 px-4 py-3 font-semibold text-white">홈으로 이동</NuxtLink></section></main>
</template>

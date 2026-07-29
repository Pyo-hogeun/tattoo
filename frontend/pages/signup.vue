<script setup lang="ts">
import { reactive, ref } from 'vue';
const config = useRuntimeConfig();
const form = reactive({ shopName: '', address: '', phone: '' });
const error = ref('');
const startKakao = () => {
  error.value = '';
  if (!form.shopName.trim() || !form.address.trim() || !form.phone.trim()) { error.value = '모든 항목을 입력해 주세요.'; return; }
  if (!config.public.kakaoClientId) { error.value = '카카오 REST API 키가 설정되지 않았습니다.'; return; }
  sessionStorage.setItem('signup_shop', JSON.stringify(form));
  sessionStorage.setItem('kakao_oauth_flow', 'signup');
  const query = new URLSearchParams({ client_id: String(config.public.kakaoClientId), redirect_uri: String(config.public.kakaoRedirectUri), response_type: 'code', state: crypto.randomUUID() });
  sessionStorage.setItem('kakao_oauth_state', query.get('state')!);
  location.href = `https://kauth.kakao.com/oauth/authorize?${query}`;
};
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-4 py-14">
    <section class="mx-auto max-w-lg rounded-2xl border bg-white p-8 shadow-sm">
      <p class="text-sm font-semibold text-amber-600">TATTOO SHOP PARTNER</p>
      <h1 class="mt-2 text-3xl font-bold text-slate-900">매장 회원가입</h1>
      <p class="mt-2 text-sm text-slate-500">가입 후 manager 권한으로 내 매장의 갤러리를 관리할 수 있습니다.</p>
      <NuxtLink to="/" class="mt-3 inline-block text-sm font-medium text-slate-600 underline">이미 가입했다면 로그인</NuxtLink>
      <form class="mt-8 space-y-5" @submit.prevent="startKakao">
        <label class="block"><span class="mb-1 block text-sm font-medium">매장명</span><input v-model="form.shopName" required class="w-full rounded-lg border p-3" placeholder="타투 매장명을 입력하세요" /></label>
        <label class="block"><span class="mb-1 block text-sm font-medium">주소</span><input v-model="form.address" required class="w-full rounded-lg border p-3" placeholder="매장 주소를 입력하세요" /></label>
        <label class="block"><span class="mb-1 block text-sm font-medium">전화번호</span><input v-model="form.phone" required type="tel" class="w-full rounded-lg border p-3" placeholder="010-1234-5678" /></label>
        <p v-if="error" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>
        <button class="w-full rounded-lg bg-[#FEE500] px-4 py-3 font-semibold text-[#191919]">카카오로 인증하고 가입하기</button>
      </form>
      <div class="mt-7 rounded-lg bg-slate-50 p-4 text-xs leading-6 text-slate-600"><b>권한 안내</b><br />manager: 본인 갤러리 등록·조회·편집<br />admin: 매장 목록 조회·매장정보 편집<br />master: 전체 관리 및 회원 권한 변경</div>
    </section>
  </main>
</template>

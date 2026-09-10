<script setup lang="ts">
import { computed, ref } from 'vue';

const config = useRuntimeConfig();
const errorMessage = ref('');
const agreed = ref(false);
const isConfigured = computed(() => Boolean(config.public.kakaoClientId));

const startKakaoSignup = () => {
  errorMessage.value = '';
  if (!agreed.value) { errorMessage.value = '서비스 이용 및 개인정보 처리 안내에 동의해 주세요.'; return; }
  if (!isConfigured.value) { errorMessage.value = '카카오 회원가입을 사용할 수 없습니다. 관리자에게 문의해 주세요.'; return; }

  const state = crypto.randomUUID();
  sessionStorage.setItem('kakao_oauth_state', state);
  sessionStorage.setItem('kakao_oauth_flow', 'user-signup');
  sessionStorage.removeItem('signup_shop');
  const query = new URLSearchParams({
    client_id: String(config.public.kakaoClientId),
    redirect_uri: String(config.public.kakaoUserRedirectUri),
    response_type: 'code',
    state
  });
  location.href = `https://kauth.kakao.com/oauth/authorize?${query}`;
};
</script>

<template>
  <main class="relative grid min-h-screen place-items-center overflow-hidden bg-stone-50 px-5 py-12">
    <div class="absolute -left-24 top-12 h-72 w-72 rounded-full bg-rose-200/50 blur-3xl" />
    <div class="absolute -right-24 bottom-12 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
    <section class="relative w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/60">
      <p class="text-xs font-bold tracking-[0.24em] text-rose-500">TATTOO GALLERY</p>
      <h1 class="mt-4 text-3xl font-bold tracking-tight text-stone-900">일반 사용자 회원가입</h1>
      <p class="mt-3 text-sm leading-6 text-stone-500">카카오 계정으로 간편하게 가입하고 마음에 드는 타투 작품과 매장을 둘러보세요.</p>

      <div class="mt-7 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
        <p class="font-semibold text-stone-800">일반 사용자 계정</p>
        <p class="mt-1 leading-5">매장 정보를 등록하는 백오피스 파트너 계정과 별도로 생성됩니다.</p>
      </div>

      <label class="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm text-stone-600">
        <input v-model="agreed" type="checkbox" class="mt-0.5 h-4 w-4 rounded" />
        <span><b class="text-stone-900">필수 동의</b><span class="mt-1 block text-xs leading-5">카카오 프로필의 사용자 식별자와 닉네임을 회원가입 및 서비스 제공 목적으로 이용합니다.</span></span>
      </label>
      <p v-if="errorMessage" class="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ errorMessage }}</p>
      <button type="button" class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-4 py-3.5 font-semibold text-[#191919] transition hover:bg-[#f5dc00] disabled:cursor-not-allowed disabled:opacity-50" :disabled="!isConfigured" @click="startKakaoSignup"><span class="text-lg">●</span> 카카오로 회원가입</button>
      <NuxtLink to="/" class="mt-5 block text-center text-sm text-stone-500 underline underline-offset-4">백오피스 로그인으로 돌아가기</NuxtLink>
    </section>
  </main>
</template>

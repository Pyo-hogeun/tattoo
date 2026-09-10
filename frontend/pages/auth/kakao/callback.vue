<script setup lang="ts">
import { onMounted, ref } from 'vue';
const config = useRuntimeConfig();
const status = ref('카카오 계정을 확인하고 있습니다.');
onMounted(async () => {
  try {
    const query = new URLSearchParams(location.search);
    const code = query.get('code');
    const state = query.get('state');
    const flow = sessionStorage.getItem('kakao_oauth_flow');
    const saved = sessionStorage.getItem('signup_shop');
    if (!code || !state || !['login', 'signup', 'user-signup'].includes(flow || '') || state !== sessionStorage.getItem('kakao_oauth_state')) throw new Error('인증 요청이 만료되었거나 올바르지 않습니다.');
    if (flow === 'signup' && !saved) throw new Error('회원가입 정보가 만료되었습니다. 다시 입력해 주세요.');
    const endpoint = flow === 'user-signup' ? '/auth/kakao/user/signup' : `/auth/kakao/${flow}`;
    const data: any = await $fetch(`${config.public.apiBase}${endpoint}`, {
      method: 'POST',
      body: {
        ...(saved ? JSON.parse(saved) : {}),
        code,
        redirectUri: flow === 'user-signup' ? config.public.kakaoUserRedirectUri : config.public.kakaoRedirectUri,
        clientId: config.public.kakaoClientId
      }
    });
    const storagePrefix = flow === 'user-signup' ? 'customer_auth' : 'auth';
    localStorage.setItem(`${storagePrefix}_token`, data.token);
    localStorage.setItem(`${storagePrefix}_user`, JSON.stringify(data.user));
    sessionStorage.removeItem('signup_shop');
    sessionStorage.removeItem('kakao_oauth_state');
    sessionStorage.removeItem('kakao_oauth_flow');
    status.value = flow === 'user-signup' || flow === 'signup' ? '가입이 완료되었습니다.' : '로그인되었습니다.';
    if (flow === 'user-signup') await navigateTo('/user/welcome');
    else await navigateTo(data.user.role === 'manager' ? '/gallery/manage' : '/shops/list');
  } catch (error: any) { status.value = error?.data?.message || error.message || '회원가입에 실패했습니다.'; }
});
</script>
<template><main class="grid min-h-screen place-items-center bg-slate-50"><div class="rounded-xl border bg-white p-8 text-center shadow-sm"><div class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" /><p>{{ status }}</p><NuxtLink class="mt-5 inline-block text-sm underline" to="/">처음으로 돌아가기</NuxtLink></div></main></template>

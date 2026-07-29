<script setup lang="ts">
import { onMounted, ref } from 'vue';
const config = useRuntimeConfig();
const status = ref('카카오 계정을 확인하고 있습니다.');
onMounted(async () => {
  try {
    const query = new URLSearchParams(location.search);
    const code = query.get('code');
    const state = query.get('state');
    const saved = sessionStorage.getItem('signup_shop');
    if (!code || !saved || !state || state !== sessionStorage.getItem('kakao_oauth_state')) throw new Error('가입 정보가 만료되었거나 인증 요청이 올바르지 않습니다.');
    const data: any = await $fetch(`${config.public.apiBase}/auth/kakao/signup`, { method: 'POST', body: { ...JSON.parse(saved), code, redirectUri: config.public.kakaoRedirectUri } });
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    sessionStorage.removeItem('signup_shop');
    sessionStorage.removeItem('kakao_oauth_state');
    status.value = '가입이 완료되었습니다. 갤러리로 이동합니다.';
    await navigateTo('/gallery/manage');
  } catch (error: any) { status.value = error?.data?.message || error.message || '회원가입에 실패했습니다.'; }
});
</script>
<template><main class="grid min-h-screen place-items-center bg-slate-50"><div class="rounded-xl border bg-white p-8 text-center shadow-sm"><div class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" /><p>{{ status }}</p><NuxtLink class="mt-5 inline-block text-sm underline" to="/signup">회원가입으로 돌아가기</NuxtLink></div></main></template>

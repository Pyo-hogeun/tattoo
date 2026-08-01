<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';

const config = useRuntimeConfig();
const error = ref('');
const savedUser = ref<{ nickname?: string; role?: string } | null>(null);
const testLogin = reactive({ loginId: '', password: '' });
const isTestLoggingIn = ref(false);
const isConfigured = computed(() => Boolean(config.public.kakaoClientId));

const destinationByRole = (role?: string) => role === 'manager' ? '/gallery/manage' : '/shops/list';

const startKakaoLogin = () => {
  error.value = '';
  if (!isConfigured.value) {
    error.value = '카카오 로그인을 사용할 수 없습니다. 관리자에게 문의해 주세요.';
    return;
  }

  const state = crypto.randomUUID();
  sessionStorage.setItem('kakao_oauth_state', state);
  sessionStorage.setItem('kakao_oauth_flow', 'login');
  sessionStorage.removeItem('signup_shop');

  const query = new URLSearchParams({
    client_id: String(config.public.kakaoClientId),
    redirect_uri: String(config.public.kakaoRedirectUri),
    response_type: 'code',
    state
  });
  location.href = `https://kauth.kakao.com/oauth/authorize?${query}`;
};

const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  savedUser.value = null;
};

const loginWithId = async () => {
  isTestLoggingIn.value = true;
  error.value = '';
  try {
    const data: any = await $fetch(`${config.public.apiBase}/auth/test/login`, {
      method: 'POST', body: testLogin
    });
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    await navigateTo(destinationByRole(data.user.role));
  } catch (requestError: any) {
    error.value = requestError?.data?.message || 'ID/PW 로그인에 실패했습니다.';
  } finally {
    isTestLoggingIn.value = false;
  }
};

onMounted(() => {
  const raw = localStorage.getItem('auth_user');
  if (!raw || !localStorage.getItem('auth_token')) return;
  try { savedUser.value = JSON.parse(raw); } catch { logout(); }
});
</script>

<template>
  <main class="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 px-5 py-12 text-slate-900">
    <div class="absolute -left-40 top-10 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />
    <div class="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />

    <section class="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl">
      <header class="bg-slate-900 px-8 pb-8 pt-10 text-white">
        <p class="text-xs font-bold tracking-[0.24em] text-amber-400">TATTOO SHOP PARTNER</p>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">매장을 더 빛나게.</h1>
        <p class="mt-3 text-sm leading-6 text-slate-300">카카오 계정 하나로 매장 정보와 작품 갤러리를 간편하게 관리하세요.</p>
      </header>

      <div class="p-8">
        <template v-if="savedUser">
          <p class="text-sm text-slate-500">다시 오신 것을 환영합니다.</p>
          <h2 class="mt-1 text-xl font-bold">{{ savedUser.nickname || '파트너' }}님</h2>
          <NuxtLink :to="destinationByRole(savedUser.role)" class="mt-6 block rounded-xl bg-slate-900 px-4 py-3 text-center font-semibold text-white">관리 화면으로 이동</NuxtLink>
          <button class="mt-3 w-full rounded-xl border px-4 py-3 text-sm font-medium text-slate-600" @click="logout">다른 계정으로 로그인</button>
        </template>

        <template v-else>
          <h2 class="text-lg font-bold">파트너 로그인</h2>
          <p class="mt-1 text-sm text-slate-500">가입할 때 사용한 카카오 계정으로 로그인해 주세요.</p>
          <button class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-4 py-3 font-semibold text-[#191919] transition hover:bg-[#f5dc00]" @click="startKakaoLogin">
            <span class="text-lg">●</span> 카카오로 로그인
          </button>

          <form v-if="config.public.enableTestAuth" class="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4" @submit.prevent="loginWithId">
            <p class="mb-3 text-xs font-bold text-slate-500">테스트 전용 ID/PW 로그인</p>
            <input v-model="testLogin.loginId" required autocomplete="username" class="w-full rounded-lg border bg-white p-2.5 text-sm" placeholder="테스트 ID" />
            <input v-model="testLogin.password" required minlength="8" type="password" autocomplete="current-password" class="mt-2 w-full rounded-lg border bg-white p-2.5 text-sm" placeholder="비밀번호 (8자 이상)" />
            <button :disabled="isTestLoggingIn" class="mt-3 w-full rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{{ isTestLoggingIn ? '로그인 중…' : 'ID/PW로 로그인' }}</button>
          </form>
          <p v-if="error" class="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>

          <div class="my-7 flex items-center gap-3 text-xs text-slate-400"><span class="h-px flex-1 bg-slate-200" />아직 파트너가 아니신가요?<span class="h-px flex-1 bg-slate-200" /></div>
          <NuxtLink to="/signup" class="block w-full rounded-xl border-2 border-slate-900 px-4 py-3 text-center font-semibold text-slate-900 transition hover:bg-slate-50">매장 회원가입</NuxtLink>
          <p class="mt-4 text-center text-xs leading-5 text-slate-400">회원가입 시 매장명, 주소, 전화번호가 필요합니다.</p>
        </template>
      </div>
    </section>
  </main>
</template>

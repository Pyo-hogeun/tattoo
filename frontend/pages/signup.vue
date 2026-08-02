<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
const config = useRuntimeConfig();
const form = reactive({ shopName: '', address: '', phone: '' });
const testForm = reactive({ loginId: '', password: '', nickname: '', role: 'manager' });
const error = ref('');
const isTestSigningUp = ref(false);
const testAccountNeedsShop = computed(() => testForm.role === 'manager');
const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.startsWith('02')) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};
const onPhoneInput = (event: Event) => {
  form.phone = formatPhone((event.target as HTMLInputElement).value);
};
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

const signUpWithId = async () => {
  error.value = '';
  if (testAccountNeedsShop.value && (!form.shopName.trim() || !form.address.trim() || !form.phone.trim())) { error.value = 'manager 계정은 매장 정보를 모두 입력해 주세요.'; return; }
  isTestSigningUp.value = true;
  try {
    const data: any = await $fetch(`${config.public.apiBase}/auth/test/signup`, {
      method: 'POST', body: { ...form, ...testForm }
    });
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    await navigateTo(data.user.role === 'manager' ? '/gallery/manage' : '/shops/list');
  } catch (requestError: any) {
    error.value = requestError?.data?.message || 'ID/PW 테스트 회원가입에 실패했습니다.';
  } finally {
    isTestSigningUp.value = false;
  }
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
        <label class="block"><span class="mb-1 block text-sm font-medium">전화번호</span><input :value="form.phone" required type="tel" inputmode="numeric" autocomplete="tel" maxlength="13" class="w-full rounded-lg border p-3" placeholder="010-1234-5678" @input="onPhoneInput" /><span class="mt-1 block text-xs text-slate-400">숫자만 입력하면 하이픈이 자동으로 추가됩니다.</span></label>
        <p v-if="error" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>
        <button class="w-full rounded-lg bg-[#FEE500] px-4 py-3 font-semibold text-[#191919]">카카오로 인증하고 가입하기</button>
      </form>
      <form v-if="config.public.enableTestAuth" class="mt-6 space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4" @submit.prevent="signUpWithId">
        <div><strong class="text-sm">테스트 전용 ID/PW 가입</strong><p class="mt-1 text-xs text-red-600">운영 환경에서는 반드시 비활성화하세요.</p></div>
        <input v-model="testForm.loginId" required minlength="4" maxlength="40" pattern="[a-z0-9._-]+" autocomplete="username" class="w-full rounded-lg border bg-white p-2.5 text-sm" placeholder="ID (영문 소문자/숫자, 4자 이상)" />
        <input v-model="testForm.password" required minlength="8" type="password" autocomplete="new-password" class="w-full rounded-lg border bg-white p-2.5 text-sm" placeholder="비밀번호 (8자 이상)" />
        <input v-model="testForm.nickname" class="w-full rounded-lg border bg-white p-2.5 text-sm" placeholder="닉네임 (선택)" />
        <select v-model="testForm.role" class="w-full rounded-lg border bg-white p-2.5 text-sm"><option value="manager">manager</option><option value="admin">admin</option><option value="master">master</option></select>
        <p class="text-xs" :class="testAccountNeedsShop ? 'text-slate-600' : 'text-emerald-700'">{{ testAccountNeedsShop ? 'manager 계정은 위 매장명·주소·전화번호가 필요합니다.' : 'admin/master 계정은 매장 정보를 입력하지 않아도 가입할 수 있습니다.' }}</p>
        <button :disabled="isTestSigningUp" class="w-full rounded-lg bg-slate-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{{ isTestSigningUp ? '가입 중…' : 'ID/PW 테스트 계정 만들기' }}</button>
      </form>
      <div class="mt-7 rounded-lg bg-slate-50 p-4 text-xs leading-6 text-slate-600"><b>권한 안내</b><br />manager: 본인 갤러리 등록·조회·편집<br />admin: 매장 목록 조회·매장정보 편집<br />master: 전체 관리 및 회원 권한 변경</div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

type SessionUser = {
  id?: string;
  nickname?: string;
  role?: string;
  shop?: { name?: string; phone?: string };
};

const config = useRuntimeConfig();
const router = useRouter();
const user = ref<SessionUser | null>(null);
const sessionActive = ref(false);
const profileOpen = ref(false);
const profileArea = ref<HTMLElement | null>(null);
const initials = computed(() => (user.value?.nickname || user.value?.shop?.name || 'U').trim().slice(0, 1).toUpperCase());
const roleLabel = computed(() => ({ master: '최고 관리자', admin: '관리자', manager: '매장 관리자' }[user.value?.role || ''] || '사용자'));

const readStoredUser = () => {
  try { user.value = JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch { user.value = null; }
};
const verifySession = async () => {
  const token = localStorage.getItem('auth_token');
  if (!token) return;
  try {
    const data = await $fetch<{ user: SessionUser }>(`${config.public.apiBase}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    user.value = data.user;
    sessionActive.value = true;
    localStorage.setItem('auth_user', JSON.stringify(data.user));
  } catch { sessionActive.value = false; }
};
const logout = async () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  profileOpen.value = false;
  await router.push('/');
};
const closeOnOutsideClick = (event: MouseEvent) => {
  if (!profileArea.value?.contains(event.target as Node)) profileOpen.value = false;
};
const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') profileOpen.value = false; };

onMounted(() => {
  readStoredUser();
  verifySession();
  document.addEventListener('click', closeOnOutsideClick);
  document.addEventListener('keydown', closeOnEscape);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick);
  document.removeEventListener('keydown', closeOnEscape);
});
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur" aria-label="백오피스 상단 메뉴">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
      <NuxtLink :to="user?.role === 'manager' ? '/gallery/manage' : '/shops/list'" class="flex items-center gap-3 font-bold text-slate-900">
        <span class="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-sm text-white">TS</span>
        <span><span class="block leading-none">Tattoo Shop</span><span class="mt-1 block text-[10px] font-medium tracking-[0.18em] text-slate-400">BACKOFFICE</span></span>
      </NuxtLink>

      <div ref="profileArea" class="relative flex items-center gap-3">
        <div class="hidden items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs sm:flex">
          <span class="h-2 w-2 rounded-full" :class="sessionActive ? 'bg-emerald-500' : 'bg-red-500'" />
          <span :class="sessionActive ? 'text-emerald-700' : 'text-red-700'">{{ sessionActive ? '로그인 중' : '세션 확인 필요' }}</span>
        </div>
        <button type="button" class="flex items-center gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-slate-100" :aria-expanded="profileOpen" aria-haspopup="menu" @click.stop="profileOpen = !profileOpen">
          <span class="grid h-9 w-9 place-items-center rounded-full bg-amber-100 font-bold text-amber-800">{{ initials }}</span>
          <span class="hidden sm:block"><span class="block max-w-36 truncate text-sm font-semibold text-slate-900">{{ user?.nickname || '로그인 사용자' }}</span><span class="block text-xs text-slate-500">{{ roleLabel }}</span></span>
          <span class="text-xs text-slate-400" aria-hidden="true">▾</span>
        </button>

        <div v-if="profileOpen" class="absolute right-0 top-12 w-72 overflow-hidden rounded-xl border bg-white shadow-xl" role="menu">
          <div class="border-b bg-slate-50 p-4"><p class="font-semibold text-slate-900">{{ user?.nickname || '로그인 사용자' }}</p><p class="mt-1 text-xs text-slate-500">{{ roleLabel }} · {{ user?.role || '-' }}</p></div>
          <dl class="space-y-3 p-4 text-sm"><div><dt class="text-xs text-slate-400">로그인 상태</dt><dd class="mt-1 font-medium" :class="sessionActive ? 'text-emerald-700' : 'text-red-700'">{{ sessionActive ? '정상' : '인증 확인 필요' }}</dd></div><div><dt class="text-xs text-slate-400">소속 매장</dt><dd class="mt-1 text-slate-700">{{ user?.shop?.name || '소속 매장 없음' }}</dd></div></dl>
          <div class="border-t p-2"><button type="button" class="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50" role="menuitem" @click="logout">로그아웃</button></div>
        </div>
      </div>
    </div>
  </header>
</template>

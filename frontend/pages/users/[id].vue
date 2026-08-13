<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import BackofficeLnb from '~/components/BackofficeLnb.vue';
import BackofficeGnb from '~/components/BackofficeGnb.vue';
import type { ManagedUser } from '~/types/user';

const route = useRoute();
const config = useRuntimeConfig();
const user = ref<ManagedUser | null>(null);
const nickname = ref('');
const role = ref<ManagedUser['role']>('manager');
const isActive = ref(true);
const viewerRole = ref('');
const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const canChooseMaster = computed(() => viewerRole.value === 'master');
const isCustomer = computed(() => route.query.type === 'customer');
const resourcePath = computed(() => isCustomer.value ? '/auth/customers' : '/auth/users');

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}` });
const formatDateTime = (value?: string) => value ? new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value)) : '-';
const applyUser = (value: ManagedUser) => { user.value = value; nickname.value = value.nickname || ''; role.value = value.role; isActive.value = value.isActive; };

const fetchUser = async () => {
  loading.value = true; errorMessage.value = '';
  try {
    const data = await $fetch<{ user: ManagedUser }>(`${config.public.apiBase}${resourcePath.value}/${route.params.id}`, { headers: headers() });
    applyUser(data.user);
  } catch (error: any) { errorMessage.value = error?.data?.message || '사용자 정보를 불러오지 못했습니다.'; }
  finally { loading.value = false; }
};
const save = async () => {
  saving.value = true; errorMessage.value = ''; successMessage.value = '';
  try {
    const body = isCustomer.value ? { nickname: nickname.value, isActive: isActive.value } : { nickname: nickname.value, role: role.value, isActive: isActive.value };
    const data = await $fetch<{ user: ManagedUser }>(`${config.public.apiBase}${resourcePath.value}/${route.params.id}`, { method: 'PATCH', headers: headers(), body });
    applyUser(data.user); successMessage.value = '사용자 정보가 저장되었습니다.';
  } catch (error: any) { errorMessage.value = error?.data?.message || '사용자 정보를 저장하지 못했습니다.'; }
  finally { saving.value = false; }
};
const deleteAccount = async () => {
  if (!user.value || !confirm(`${user.value.nickname || '이 사용자'} 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
  deleting.value = true; errorMessage.value = '';
  try {
    await $fetch(`${config.public.apiBase}${resourcePath.value}/${route.params.id}`, { method: 'DELETE', headers: headers() });
    await navigateTo('/users');
  } catch (error: any) { errorMessage.value = error?.data?.message || '사용자 계정을 삭제하지 못했습니다.'; }
  finally { deleting.value = false; }
};

onMounted(() => {
  try { viewerRole.value = JSON.parse(localStorage.getItem('auth_user') || '{}').role || ''; } catch { viewerRole.value = ''; }
  fetchUser();
});
</script>

<template>
  <div class="mx-auto flex max-w-7xl gap-6 p-6 pt-24"><BackofficeGnb /><BackofficeLnb />
    <main class="min-w-0 flex-1 rounded-xl border bg-white p-6 shadow-sm">
      <div class="mb-6 flex items-center justify-between"><div><NuxtLink to="/users" class="text-sm text-slate-500 hover:text-slate-900">← 사용자 목록</NuxtLink><h1 class="mt-2 text-xl font-bold">{{ isCustomer ? '일반 사용자 상세' : '백오피스 사용자 상세' }}</h1></div></div>
      <p v-if="loading" class="py-12 text-center text-slate-500">사용자 정보를 불러오는 중입니다.</p>
      <p v-else-if="errorMessage && !user" class="rounded-lg bg-red-50 p-4 text-red-700">{{ errorMessage }}</p>
      <form v-else-if="user" class="max-w-2xl space-y-6" @submit.prevent="save">
        <div class="grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2"><div><p class="text-xs text-slate-500">로그인 방식</p><p class="mt-1 font-medium">{{ user.loginId ? 'ID / PW' : '카카오' }}</p></div><div><p class="text-xs text-slate-500">로그인 식별자</p><p class="mt-1 font-medium">{{ user.loginId || user.kakaoId || '-' }}</p></div><div><p class="text-xs text-slate-500">가입일</p><p class="mt-1 text-sm">{{ formatDateTime(user.createdAt) }}</p></div><div><p class="text-xs text-slate-500">최근 수정일</p><p class="mt-1 text-sm">{{ formatDateTime(user.updatedAt) }}</p></div></div>
        <div><label for="nickname" class="mb-1 block text-sm font-medium">닉네임</label><input id="nickname" v-model="nickname" required maxlength="50" class="w-full rounded-lg border px-3 py-2" /></div>
        <div v-if="!isCustomer"><label for="role" class="mb-1 block text-sm font-medium">권한</label><select id="role" v-model="role" class="w-full rounded-lg border px-3 py-2"><option v-if="canChooseMaster || user.role === 'master'" value="master">master</option><option value="admin">admin</option><option value="manager">manager</option></select><p v-if="!canChooseMaster" class="mt-1 text-xs text-slate-500">admin은 master 권한을 부여하거나 master 계정을 수정할 수 없습니다.</p></div>
        <div v-else class="rounded-lg border bg-slate-50 p-4"><p class="text-xs text-slate-500">계정 유형</p><p class="mt-1 font-medium">일반 사용자 · user</p></div>
        <label class="flex items-center justify-between rounded-lg border p-4"><span><span class="block text-sm font-medium">계정 활성화</span><span class="text-xs text-slate-500">비활성 계정은 로그인할 수 없습니다.</span></span><input v-model="isActive" type="checkbox" class="h-5 w-5" /></label>
        <div v-if="!isCustomer" class="rounded-lg border p-4"><h2 class="font-medium">연결 매장</h2><dl class="mt-3 grid gap-3 text-sm sm:grid-cols-2"><div><dt class="text-slate-500">매장명</dt><dd>{{ user.shop?.name || '-' }}</dd></div><div><dt class="text-slate-500">전화번호</dt><dd>{{ user.shop?.phone || '-' }}</dd></div><div class="sm:col-span-2"><dt class="text-slate-500">주소</dt><dd>{{ user.shop?.address || '-' }}</dd></div></dl></div>
        <p v-if="errorMessage" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ errorMessage }}</p><p v-if="successMessage" class="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{{ successMessage }}</p>
        <div class="flex flex-wrap justify-between gap-2"><button type="button" :disabled="deleting" class="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50" @click="deleteAccount">{{ deleting ? '삭제 중...' : '사용자 계정 삭제' }}</button><div class="flex gap-2"><NuxtLink to="/users" class="rounded-lg border px-4 py-2 text-sm">취소</NuxtLink><button type="submit" :disabled="saving || deleting" class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{{ saving ? '저장 중...' : '변경사항 저장' }}</button></div></div>
      </form>
    </main>
  </div>
</template>

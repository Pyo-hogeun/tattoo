<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import BackofficeLnb from '~/components/BackofficeLnb.vue';
import type { ManagedUser } from '~/types/user';

const config = useRuntimeConfig();
const users = ref<ManagedUser[]>([]);
const search = ref('');
const role = ref('');
const page = ref(1);
const totalPages = ref(1);
const total = ref(0);
const loading = ref(false);
const errorMessage = ref('');
let searchTimer: ReturnType<typeof setTimeout> | undefined;

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}` });
const formatDate = (value: string) => new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(value));

const fetchUsers = async (targetPage = 1) => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const data = await $fetch<{ items: ManagedUser[]; total: number; totalPages: number }>(`${config.public.apiBase}/auth/users`, {
      headers: authHeaders(),
      query: { page: targetPage, limit: 20, search: search.value, role: role.value }
    });
    users.value = data.items;
    total.value = data.total;
    totalPages.value = Math.max(data.totalPages, 1);
    page.value = targetPage;
  } catch (error: any) {
    errorMessage.value = error?.data?.message || '사용자 목록을 불러오지 못했습니다.';
  } finally { loading.value = false; }
};

watch(role, () => fetchUsers());
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => fetchUsers(), 300);
});
onMounted(() => fetchUsers());
</script>

<template>
  <div class="mx-auto flex max-w-7xl gap-6 p-6">
    <BackofficeLnb />
    <main class="min-w-0 flex-1 rounded-xl border bg-white p-6 shadow-sm">
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h1 class="text-xl font-bold text-slate-900">사용자 관리</h1><p class="mt-1 text-sm text-slate-500">전체 {{ total }}명의 계정과 권한을 관리합니다.</p></div>
        <div class="flex gap-2">
          <input v-model="search" class="w-56 rounded-lg border px-3 py-2 text-sm" placeholder="닉네임 또는 로그인 ID 검색" aria-label="사용자 검색" />
          <select v-model="role" class="rounded-lg border px-3 py-2 text-sm" aria-label="권한 필터"><option value="">전체 권한</option><option value="master">master</option><option value="admin">admin</option><option value="manager">manager</option></select>
        </div>
      </div>
      <p v-if="errorMessage" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ errorMessage }}</p>
      <div class="overflow-x-auto rounded-lg border">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="px-4 py-3">사용자</th><th class="px-4 py-3">매장</th><th class="px-4 py-3">권한</th><th class="px-4 py-3">상태</th><th class="px-4 py-3">가입일</th><th class="px-4 py-3"><span class="sr-only">관리</span></th></tr></thead>
          <tbody class="divide-y">
            <tr v-if="loading"><td colspan="6" class="px-4 py-10 text-center text-slate-500">사용자 목록을 불러오는 중입니다.</td></tr>
            <tr v-else-if="!users.length"><td colspan="6" class="px-4 py-10 text-center text-slate-500">조건에 맞는 사용자가 없습니다.</td></tr>
            <template v-else><tr v-for="user in users" :key="user.id" class="hover:bg-slate-50">
                <td class="px-4 py-3"><p class="font-medium text-slate-900">{{ user.nickname || '-' }}</p><p class="text-xs text-slate-500">{{ user.loginId || '카카오 계정' }}</p></td>
                <td class="px-4 py-3">{{ user.shop?.name || '-' }}</td><td class="px-4 py-3"><span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium">{{ user.role }}</span></td>
                <td class="px-4 py-3"><span :class="user.isActive ? 'text-emerald-700' : 'text-red-600'">{{ user.isActive ? '활성' : '비활성' }}</span></td><td class="px-4 py-3 text-slate-600">{{ formatDate(user.createdAt) }}</td>
                <td class="px-4 py-3 text-right"><NuxtLink :to="`/users/${user.id}`" class="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-slate-100">상세 / 수정</NuxtLink></td>
              </tr></template>
          </tbody>
        </table>
      </div>
      <div class="mt-5 flex items-center justify-center gap-3"><button class="rounded border px-3 py-1.5 text-sm disabled:opacity-40" :disabled="page <= 1 || loading" @click="fetchUsers(page - 1)">이전</button><span class="text-sm text-slate-600">{{ page }} / {{ totalPages }}</span><button class="rounded border px-3 py-1.5 text-sm disabled:opacity-40" :disabled="page >= totalPages || loading" @click="fetchUsers(page + 1)">다음</button></div>
    </main>
  </div>
</template>

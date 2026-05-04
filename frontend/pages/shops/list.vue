<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import BackofficeLnb from '~/components/BackofficeLnb.vue';
import { useBackofficeStore } from '~/stores/backoffice';
import { seoulDistricts } from '~/data/seoulDistricts';

const router = useRouter();
const store = useBackofficeStore();
const search = ref('');
const searchDistrict = ref('');
const showInvalidOnly = ref(false);
const hideInvalidCases = ref(false);
const districtOptions = computed(() => seoulDistricts.map((item) => item.district));
const loadMoreTrigger = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);

const fetchFirstPage = async () => store.fetchShops(search.value, searchDistrict.value, showInvalidOnly.value, hideInvalidCases.value, false);
const fetchMoreShops = async () => { if (!store.loading && store.hasMore) await store.fetchShops(search.value, searchDistrict.value, showInvalidOnly.value, hideInvalidCases.value, true); };
const formatPhone = (value?: string) => value || '';
const deleteShop = async (id: string) => store.deleteShop(id, search.value, searchDistrict.value, showInvalidOnly.value, hideInvalidCases.value);
const startEditShop = (shop: any) => { sessionStorage.setItem('editingShop', JSON.stringify(shop)); router.push('/shops/manage'); };

onMounted(async () => {
  await fetchFirstPage();
  observer.value = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting) fetchMoreShops(); }, { rootMargin: '120px' });
  if (loadMoreTrigger.value) observer.value.observe(loadMoreTrigger.value);
});
onBeforeUnmount(() => observer.value?.disconnect());
watch([search, searchDistrict, showInvalidOnly, hideInvalidCases], fetchFirstPage);
watch(showInvalidOnly, (v) => { if (v) hideInvalidCases.value = false; });
watch(hideInvalidCases, (v) => { if (v) showInvalidOnly.value = false; });
</script>

<template>
  <div class="mx-auto flex max-w-7xl gap-6 p-6">
    <BackofficeLnb />
    <section class="flex-1 rounded-xl border bg-white p-4 shadow-sm h-[75vh] flex flex-col">
      <div class="sticky top-0 z-10 bg-white">
        <div class="mb-3 flex items-center gap-2">
          <h2 class="text-lg font-semibold">매장 목록</h2>
          <input v-model="search" class="rounded border p-1 text-sm" placeholder="검색어" />
          <select v-model="searchDistrict" class="rounded border p-1 text-sm"><option value="">전체 지역구</option><option v-for="district in districtOptions" :key="district" :value="district">{{ district }}</option></select>
          <label class="flex items-center gap-1 text-xs"><input v-model="showInvalidOnly" type="checkbox" />실패 케이스만</label>
          <label class="flex items-center gap-1 text-xs"><input v-model="hideInvalidCases" type="checkbox" />실패 케이스 제외</label>
        </div>
      </div>
      <div class="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
        <table class="min-w-full text-sm store-list table-fixed"><thead><tr><th class="w-40 p-2">이름</th><th class="w-28 p-2">검색 region</th><th class="p-2">실제 DB 주소</th><th class="w-24 p-2">연락처</th><th class="w-24 p-2">채널</th><th class="w-20 p-2">상태</th><th class="w-28 p-2">관리</th></tr></thead>
          <tbody><tr v-for="shop in store.shops" :key="shop._id" class="border-t"><td class="p-2 truncate">{{ shop.name }}</td><td class="p-2 truncate">{{ `${shop.district || '-'} ${shop.town || ''}` }}</td><td class="p-2 truncate">{{ shop.address }}</td><td class="p-2">{{ formatPhone(shop.phone) }}</td><td class="p-2">{{ shop.instagram ? 'insta' : (shop.kakaoChannel || '-') }}</td><td class="p-2">{{ shop.isActive ? '활성' : '비활성' }}</td><td class="p-2"><button class="rounded border px-2 py-1 text-xs" @click="startEditShop(shop)">수정</button><button class="ml-1 rounded border px-2 py-1 text-xs" @click="deleteShop(shop._id)">삭제</button></td></tr></tbody>
        </table>
        <div class="mt-3 flex justify-center"><button v-if="store.hasMore" class="rounded border px-4 py-2 text-sm" @click="fetchMoreShops">목록 더보기</button></div>
        <div ref="loadMoreTrigger" class="h-2" />
      </div>
    </section>
  </div>
</template>

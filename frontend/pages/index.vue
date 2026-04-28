<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { useBackofficeStore } from '~/stores/backoffice';

const store = useBackofficeStore();
const search = ref('');
const editingShopId = ref<string | null>(null);

const shopFormDefault = {
  name: '',
  address: '',
  city: '',
  phone: '',
  homepage: '',
  instagram: '',
  kakaoChannel: '',
  businessHours: '',
  bookingNotes: '',
  description: '',
  manualMemo: '',
  isActive: true
};

const shopForm = reactive({ ...shopFormDefault });

const sourceForm = reactive({
  name: '',
  type: 'custom' as 'custom' | 'naver-map' | 'naver-blog',
  query: '',
  url: '',
  item: '.shop-item',
  nameSelector: '.name',
  addressSelector: '.address',
  phoneSelector: '.phone',
  citySelector: '.city',
  descriptionSelector: '.description'
});

const isCustom = computed(() => sourceForm.type === 'custom');
const isEditing = computed(() => Boolean(editingShopId.value));

const resetShopForm = () => {
  Object.assign(shopForm, shopFormDefault);
  editingShopId.value = null;
};

const submitShop = async () => {
  const payload = {
    ...shopForm,
    dataSourceType: 'manual' as const,
    sourceName: 'manual'
  };

  if (editingShopId.value) {
    await store.updateShop(editingShopId.value, payload);
  } else {
    await store.createShop(payload);
  }

  resetShopForm();
};

const startEditShop = (shop: any) => {
  editingShopId.value = shop._id;
  Object.assign(shopForm, {
    name: shop.name || '',
    address: shop.address || '',
    city: shop.city || '',
    phone: shop.phone || '',
    homepage: shop.homepage || '',
    instagram: shop.instagram || '',
    kakaoChannel: shop.kakaoChannel || '',
    businessHours: shop.businessHours || '',
    bookingNotes: shop.bookingNotes || '',
    description: shop.description || '',
    manualMemo: shop.manualMemo || '',
    isActive: shop.isActive ?? true
  });
};

const createSource = async () => {
  await store.addSource({
    name: sourceForm.name,
    type: sourceForm.type,
    query: sourceForm.query || undefined,
    url: sourceForm.url || undefined,
    selectors:
      sourceForm.type === 'custom'
        ? {
            item: sourceForm.item,
            name: sourceForm.nameSelector,
            address: sourceForm.addressSelector,
            phone: sourceForm.phoneSelector,
            city: sourceForm.citySelector,
            description: sourceForm.descriptionSelector
          }
        : undefined,
    enabled: true
  });

  Object.assign(sourceForm, {
    name: '',
    type: 'custom',
    query: '',
    url: '',
    item: '.shop-item',
    nameSelector: '.name',
    addressSelector: '.address',
    phoneSelector: '.phone',
    citySelector: '.city',
    descriptionSelector: '.description'
  });
};

const deleteSource = async (sourceId: string) => {
  if (!confirm('이 소스를 삭제하시겠습니까?')) return;
  await store.deleteSource(sourceId);
};

const deleteShop = async (shopId: string) => {
  if (!confirm('이 매장을 삭제하시겠습니까?')) return;
  await store.deleteShop(shopId, search.value);
};

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('ko-KR');
};

onMounted(async () => {
  await Promise.all([store.fetchShops(), store.fetchSources(), store.fetchRuns()]);
});
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6 p-6">
    <h1 class="text-2xl font-bold">눈썹문신 백오피스</h1>

    <section class="rounded-xl border bg-white p-4 shadow-sm">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-semibold">수동 매장 등록/수정</h2>
        <button v-if="isEditing" class="rounded border px-3 py-1 text-sm" @click="resetShopForm">수정 취소</button>
      </div>
      <p class="mb-3 text-sm text-slate-600">크롤링 대신 운영자가 직접 매장 정보를 입력하여 DB를 관리합니다.</p>
      <form class="grid gap-2 md:grid-cols-2" @submit.prevent="submitShop">
        <input v-model="shopForm.name" class="rounded border p-2" placeholder="매장명" required />
        <input v-model="shopForm.phone" class="rounded border p-2" placeholder="연락처" />
        <input v-model="shopForm.address" class="rounded border p-2 md:col-span-2" placeholder="주소" />
        <input v-model="shopForm.city" class="rounded border p-2" placeholder="도시/지역" />
        <input v-model="shopForm.homepage" class="rounded border p-2" placeholder="홈페이지 URL" />
        <input v-model="shopForm.instagram" class="rounded border p-2" placeholder="인스타그램" />
        <input v-model="shopForm.kakaoChannel" class="rounded border p-2" placeholder="카카오 채널" />
        <input v-model="shopForm.businessHours" class="rounded border p-2 md:col-span-2" placeholder="영업시간" />
        <input v-model="shopForm.bookingNotes" class="rounded border p-2 md:col-span-2" placeholder="예약/상담 메모" />
        <textarea v-model="shopForm.description" class="rounded border p-2 md:col-span-2" placeholder="설명" rows="2" />
        <textarea v-model="shopForm.manualMemo" class="rounded border p-2 md:col-span-2" placeholder="운영 메모" rows="2" />
        <label class="flex items-center gap-2 text-sm">
          <input v-model="shopForm.isActive" type="checkbox" />
          노출 상태(활성)
        </label>
        <div class="md:col-span-2">
          <button class="rounded bg-slate-900 px-4 py-2 text-white">
            {{ isEditing ? '매장 수정 저장' : '매장 등록' }}
          </button>
        </div>
      </form>
    </section>

    <section class="rounded-xl border bg-white p-4 shadow-sm h-[55vh] overflow-y-auto">
      <div class="mb-3 flex items-center gap-2">
        <h2 class="text-lg font-semibold">매장 목록</h2>
        <input v-model="search" class="rounded border p-1 text-sm" placeholder="검색어" />
        <button class="rounded border px-3 py-1 text-sm" @click="store.fetchShops(search)">검색</button>
      </div>
      <p class="mb-2 text-xs text-slate-500">등록된 DB 총 {{ store.total }}건</p>

      <div class="overflow-x-auto">
        <table class="min-w-full text-sm store-list">
          <thead class="bg-slate-100 text-left">
            <tr>
              <th class="p-2">이름</th>
              <th class="p-2">주소</th>
              <th class="p-2">연락처</th>
              <th class="p-2">채널</th>
              <th class="p-2">상태</th>
              <th class="p-2">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="shop in store.shops" :key="shop._id" class="border-t hover:bg-slate-100">
              <td class="p-2">{{ shop.name }}</td>
              <td class="p-2">{{ shop.address }}</td>
              <td class="p-2">{{ shop.phone }}</td>
              <td class="p-2">{{ shop.instagram || shop.kakaoChannel || '-' }}</td>
              <td class="p-2">{{ shop.isActive ? '활성' : '비활성' }}</td>
              <td class="p-2">
                <div class="flex gap-1">
                  <button class="rounded border px-2 py-1 text-xs" @click="startEditShop(shop)">수정</button>
                  <button class="rounded border border-red-200 px-2 py-1 text-xs text-red-600" @click="deleteShop(shop._id)">
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="rounded-xl border bg-white p-4 shadow-sm">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-semibold">(선택) 스크래핑 제어</h2>
        <button class="rounded bg-indigo-600 px-4 py-2 text-white" @click="store.runScraping()">전체 수집 실행</button>
      </div>
      <p class="text-sm text-slate-600">수동 입력이 기본이며, 필요 시에만 스크래핑 소스를 보조적으로 사용하세요.</p>
      <ul class="mt-3 list-disc pl-6 text-sm">
        <li v-for="run in store.lastRunResults" :key="`${run.source}-${run.success}`">
          <span class="font-medium">{{ run.source }}</span>
          <span v-if="run.success"> - 성공 ({{ run.stats?.totalParsed }}건 파싱)</span>
          <span v-else class="text-red-600"> - 실패 ({{ run.error }})</span>
        </li>
      </ul>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-xl border bg-white p-4 shadow-sm">
        <h2 class="mb-3 text-lg font-semibold">스크래핑 소스 등록</h2>
        <form class="grid gap-2" @submit.prevent="createSource">
          <input v-model="sourceForm.name" class="rounded border p-2" placeholder="소스 이름" required />
          <select v-model="sourceForm.type" class="rounded border p-2">
            <option value="custom">커스텀 HTML</option>
            <option value="naver-map">네이버 지도 검색</option>
            <option value="naver-blog">네이버 블로그</option>
          </select>
          <input
            v-if="!isCustom"
            v-model="sourceForm.query"
            class="rounded border p-2"
            placeholder="검색어 (예: 강남 눈썹문신)"
            required
          />
          <input
            v-model="sourceForm.url"
            class="rounded border p-2"
            :placeholder="isCustom ? 'https://example.com/list' : '선택: 직접 URL 입력'"
            :required="isCustom"
          />

          <template v-if="isCustom">
            <input v-model="sourceForm.item" class="rounded border p-2" placeholder="item selector" required />
            <input v-model="sourceForm.nameSelector" class="rounded border p-2" placeholder="name selector" required />
            <input v-model="sourceForm.addressSelector" class="rounded border p-2" placeholder="address selector" />
            <input v-model="sourceForm.phoneSelector" class="rounded border p-2" placeholder="phone selector" />
            <input v-model="sourceForm.citySelector" class="rounded border p-2" placeholder="city selector" />
            <input v-model="sourceForm.descriptionSelector" class="rounded border p-2" placeholder="description selector" />
          </template>
          <button class="rounded bg-slate-900 px-4 py-2 text-white">소스 저장</button>
        </form>
      </div>

      <div class="rounded-xl border bg-white p-4 shadow-sm">
        <h2 class="mb-3 text-lg font-semibold">등록된 소스</h2>
        <div class="space-y-2">
          <div v-for="source in store.sources" :key="source._id" class="flex items-center justify-between rounded border p-2">
            <div>
              <p class="font-medium">{{ source.name }} ({{ source.type }})</p>
              <p class="text-xs text-slate-500">{{ source.url || source.query }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="rounded border px-3 py-1 text-sm" @click="store.runScraping(source._id)">실행</button>
              <button class="rounded border border-red-200 px-3 py-1 text-sm text-red-600" @click="deleteSource(source._id)">
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-xl border bg-white p-4 shadow-sm">
      <h2 class="mb-2 text-lg font-semibold">최근 스크래핑 이력</h2>
      <div class="h-[30vh] overflow-y-auto">
        <ul class="space-y-1 text-sm">
          <li v-for="run in store.runs" :key="run._id" class="rounded border p-2">
            <span class="font-medium">{{ run.sourceName }}</span>
            - {{ run.status }} / parsed: {{ run.totalParsed }} / inserted: {{ run.inserted }} / updated: {{ run.updated }}
            <span class="ml-2 text-xs text-slate-500">생성일: {{ formatDateTime(run.createdAt) }}</span>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

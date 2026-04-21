<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useBackofficeStore } from '~/stores/backoffice';

const store = useBackofficeStore();
const search = ref('');

const sourceForm = reactive({
  name: '',
  url: '',
  item: '.shop-item',
  nameSelector: '.name',
  addressSelector: '.address',
  phoneSelector: '.phone',
  citySelector: '.city',
  descriptionSelector: '.description'
});

const createSource = async () => {
  await store.addSource({
    name: sourceForm.name,
    url: sourceForm.url,
    selectors: {
      item: sourceForm.item,
      name: sourceForm.nameSelector,
      address: sourceForm.addressSelector,
      phone: sourceForm.phoneSelector,
      city: sourceForm.citySelector,
      description: sourceForm.descriptionSelector
    },
    enabled: true
  });

  Object.assign(sourceForm, {
    name: '',
    url: '',
    item: '.shop-item',
    nameSelector: '.name',
    addressSelector: '.address',
    phoneSelector: '.phone',
    citySelector: '.city',
    descriptionSelector: '.description'
  });
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
        <h2 class="text-lg font-semibold">스크래핑 제어</h2>
        <button class="rounded bg-indigo-600 px-4 py-2 text-white" @click="store.runScraping()">전체 수집 실행</button>
      </div>
      <p class="text-sm text-slate-600">소스별 실행은 하단 소스 목록에서 가능합니다.</p>
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
          <input v-model="sourceForm.url" class="rounded border p-2" placeholder="https://example.com/list" required />
          <input v-model="sourceForm.item" class="rounded border p-2" placeholder="item selector" required />
          <input v-model="sourceForm.nameSelector" class="rounded border p-2" placeholder="name selector" required />
          <input v-model="sourceForm.addressSelector" class="rounded border p-2" placeholder="address selector" />
          <input v-model="sourceForm.phoneSelector" class="rounded border p-2" placeholder="phone selector" />
          <input v-model="sourceForm.citySelector" class="rounded border p-2" placeholder="city selector" />
          <input v-model="sourceForm.descriptionSelector" class="rounded border p-2" placeholder="description selector" />
          <button class="rounded bg-slate-900 px-4 py-2 text-white">소스 저장</button>
        </form>
      </div>

      <div class="rounded-xl border bg-white p-4 shadow-sm">
        <h2 class="mb-3 text-lg font-semibold">등록된 소스</h2>
        <div class="space-y-2">
          <div v-for="source in store.sources" :key="source._id" class="flex items-center justify-between rounded border p-2">
            <div>
              <p class="font-medium">{{ source.name }}</p>
              <p class="text-xs text-slate-500">{{ source.url }}</p>
            </div>
            <button class="rounded border px-3 py-1 text-sm" @click="store.runScraping(source._id)">실행</button>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-xl border bg-white p-4 shadow-sm">
      <div class="mb-3 flex items-center gap-2">
        <h2 class="text-lg font-semibold">매장 목록</h2>
        <input v-model="search" class="rounded border p-1 text-sm" placeholder="검색어" />
        <button class="rounded border px-3 py-1 text-sm" @click="store.fetchShops(search)">검색</button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-100 text-left">
            <tr>
              <th class="p-2">이름</th>
              <th class="p-2">주소</th>
              <th class="p-2">연락처</th>
              <th class="p-2">도시</th>
              <th class="p-2">수집출처</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="shop in store.shops" :key="shop._id" class="border-t">
              <td class="p-2">{{ shop.name }}</td>
              <td class="p-2">{{ shop.address }}</td>
              <td class="p-2">{{ shop.phone }}</td>
              <td class="p-2">{{ shop.city }}</td>
              <td class="p-2">{{ shop.sourceName }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="rounded-xl border bg-white p-4 shadow-sm">
      <h2 class="mb-2 text-lg font-semibold">최근 스크래핑 이력</h2>
      <ul class="space-y-1 text-sm">
        <li v-for="run in store.runs" :key="run._id" class="rounded border p-2">
          <span class="font-medium">{{ run.sourceName }}</span>
          - {{ run.status }} / parsed: {{ run.totalParsed }} / inserted: {{ run.inserted }} / updated: {{ run.updated }}
        </li>
      </ul>
    </section>
  </div>
</template>

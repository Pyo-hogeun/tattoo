import { defineComponent, ref, reactive, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
import { defineStore } from 'pinia';
import { b as useRuntimeConfig } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import 'perfect-debounce';
import '@vue/shared';

const useBackofficeStore = defineStore("backoffice", {
  state: () => ({
    shops: [],
    total: 0,
    page: 1,
    limit: 20,
    sources: [],
    runs: [],
    loading: false,
    lastRunResults: []
  }),
  actions: {
    api(path, options) {
      const config = useRuntimeConfig();
      return $fetch(`${config.public.apiBase}${path}`, options);
    },
    async fetchShops(search = "") {
      this.loading = true;
      try {
        const data = await this.api(`/shops?page=${this.page}&limit=${this.limit}&search=${encodeURIComponent(search)}`);
        this.shops = data.items;
        this.total = data.total;
      } finally {
        this.loading = false;
      }
    },
    async fetchSources() {
      this.sources = await this.api("/sources");
    },
    async addSource(payload) {
      await this.api("/sources", { method: "POST", body: payload });
      await this.fetchSources();
    },
    async runScraping(sourceId) {
      const response = await this.api("/scrape/run", {
        method: "POST",
        body: sourceId ? { sourceId } : {}
      });
      this.lastRunResults = response.results;
      await Promise.all([this.fetchShops(), this.fetchRuns(), this.fetchSources()]);
    },
    async fetchRuns() {
      this.runs = await this.api("/scrape/runs");
    }
  }
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const store = useBackofficeStore();
    const search = ref("");
    const sourceForm = reactive({
      name: "",
      url: "",
      item: ".shop-item",
      nameSelector: ".name",
      addressSelector: ".address",
      phoneSelector: ".phone",
      citySelector: ".city",
      descriptionSelector: ".description"
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-7xl space-y-6 p-6" }, _attrs))}><h1 class="text-2xl font-bold">눈썹문신 백오피스</h1><section class="rounded-xl border bg-white p-4 shadow-sm"><div class="mb-3 flex items-center justify-between"><h2 class="text-lg font-semibold">스크래핑 제어</h2><button class="rounded bg-indigo-600 px-4 py-2 text-white">전체 수집 실행</button></div><p class="text-sm text-slate-600">소스별 실행은 하단 소스 목록에서 가능합니다.</p><ul class="mt-3 list-disc pl-6 text-sm"><!--[-->`);
      ssrRenderList(unref(store).lastRunResults, (run) => {
        _push(`<li><span class="font-medium">${ssrInterpolate(run.source)}</span>`);
        if (run.success) {
          _push(`<span> - 성공 (${ssrInterpolate(run.stats?.totalParsed)}건 파싱)</span>`);
        } else {
          _push(`<span class="text-red-600"> - 실패 (${ssrInterpolate(run.error)})</span>`);
        }
        _push(`</li>`);
      });
      _push(`<!--]--></ul></section><section class="grid gap-6 lg:grid-cols-2"><div class="rounded-xl border bg-white p-4 shadow-sm"><h2 class="mb-3 text-lg font-semibold">스크래핑 소스 등록</h2><form class="grid gap-2"><input${ssrRenderAttr("value", sourceForm.name)} class="rounded border p-2" placeholder="소스 이름" required><input${ssrRenderAttr("value", sourceForm.url)} class="rounded border p-2" placeholder="https://example.com/list" required><input${ssrRenderAttr("value", sourceForm.item)} class="rounded border p-2" placeholder="item selector" required><input${ssrRenderAttr("value", sourceForm.nameSelector)} class="rounded border p-2" placeholder="name selector" required><input${ssrRenderAttr("value", sourceForm.addressSelector)} class="rounded border p-2" placeholder="address selector"><input${ssrRenderAttr("value", sourceForm.phoneSelector)} class="rounded border p-2" placeholder="phone selector"><input${ssrRenderAttr("value", sourceForm.citySelector)} class="rounded border p-2" placeholder="city selector"><input${ssrRenderAttr("value", sourceForm.descriptionSelector)} class="rounded border p-2" placeholder="description selector"><button class="rounded bg-slate-900 px-4 py-2 text-white">소스 저장</button></form></div><div class="rounded-xl border bg-white p-4 shadow-sm"><h2 class="mb-3 text-lg font-semibold">등록된 소스</h2><div class="space-y-2"><!--[-->`);
      ssrRenderList(unref(store).sources, (source) => {
        _push(`<div class="flex items-center justify-between rounded border p-2"><div><p class="font-medium">${ssrInterpolate(source.name)}</p><p class="text-xs text-slate-500">${ssrInterpolate(source.url)}</p></div><button class="rounded border px-3 py-1 text-sm">실행</button></div>`);
      });
      _push(`<!--]--></div></div></section><section class="rounded-xl border bg-white p-4 shadow-sm"><div class="mb-3 flex items-center gap-2"><h2 class="text-lg font-semibold">매장 목록</h2><input${ssrRenderAttr("value", search.value)} class="rounded border p-1 text-sm" placeholder="검색어"><button class="rounded border px-3 py-1 text-sm">검색</button></div><div class="overflow-x-auto"><table class="min-w-full text-sm"><thead class="bg-slate-100 text-left"><tr><th class="p-2">이름</th><th class="p-2">주소</th><th class="p-2">연락처</th><th class="p-2">도시</th><th class="p-2">수집출처</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(store).shops, (shop) => {
        _push(`<tr class="border-t"><td class="p-2">${ssrInterpolate(shop.name)}</td><td class="p-2">${ssrInterpolate(shop.address)}</td><td class="p-2">${ssrInterpolate(shop.phone)}</td><td class="p-2">${ssrInterpolate(shop.city)}</td><td class="p-2">${ssrInterpolate(shop.sourceName)}</td></tr>`);
      });
      _push(`<!--]--></tbody></table></div></section><section class="rounded-xl border bg-white p-4 shadow-sm"><h2 class="mb-2 text-lg font-semibold">최근 스크래핑 이력</h2><ul class="space-y-1 text-sm"><!--[-->`);
      ssrRenderList(unref(store).runs, (run) => {
        _push(`<li class="rounded border p-2"><span class="font-medium">${ssrInterpolate(run.sourceName)}</span> - ${ssrInterpolate(run.status)} / parsed: ${ssrInterpolate(run.totalParsed)} / inserted: ${ssrInterpolate(run.inserted)} / updated: ${ssrInterpolate(run.updated)}</li>`);
      });
      _push(`<!--]--></ul></section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Q7KPgOtP.mjs.map

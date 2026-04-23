import { defineStore } from 'pinia';
import type { ScrapeSource, Shop } from '~/types/shop';

interface RunResult {
  source: string;
  success: boolean;
  stats?: { inserted: number; updated: number; totalParsed: number };
  error?: string;
}

export const useBackofficeStore = defineStore('backoffice', {
  state: () => ({
    shops: [] as Shop[],
    total: 0,
    page: 1,
    limit: 20,
    sources: [] as ScrapeSource[],
    runs: [] as any[],
    loading: false,
    lastRunResults: [] as RunResult[]
  }),
  actions: {
    api(path: string, options?: any) {
      const config = useRuntimeConfig();
      return $fetch(`${config.public.apiBase}${path}`, options);
    },
    async fetchShops(search = '') {
      this.loading = true;
      try {
        const data: any = await this.api(`/shops?page=${this.page}&limit=${this.limit}&search=${encodeURIComponent(search)}`);
        this.shops = data.items;
        this.total = data.total;
      } finally {
        this.loading = false;
      }
    },
    async fetchSources() {
      this.sources = (await this.api('/sources')) as ScrapeSource[];
    },
    async addSource(payload: Partial<ScrapeSource>) {
      await this.api('/sources', { method: 'POST', body: payload });
      await this.fetchSources();
    },
    async deleteSource(sourceId: string) {
      await this.api(`/sources/${sourceId}`, { method: 'DELETE' });
      await this.fetchSources();
    },
    async runScraping(sourceId?: string) {
      const response: any = await this.api('/scrape/run', {
        method: 'POST',
        body: sourceId ? { sourceId } : {}
      });
      this.lastRunResults = response.results;
      await Promise.all([this.fetchShops(), this.fetchRuns(), this.fetchSources()]);
    },
    async fetchRuns() {
      this.runs = (await this.api('/scrape/runs')) as any[];
    }
  }
});

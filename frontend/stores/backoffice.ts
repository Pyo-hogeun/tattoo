import { defineStore } from 'pinia';
import type { Shop } from '~/types/shop';

export const useBackofficeStore = defineStore('backoffice', {
  state: () => ({
    shops: [] as Shop[],
    total: 0,
    page: 1,
    limit: 20,
    loading: false,
    hasMore: true
  }),
  actions: {
    api(path: string, options?: any) {
      const config = useRuntimeConfig();
      return $fetch(`${config.public.apiBase}${path}`, options);
    },
    async fetchShops(search = '', district = '', town = '', invalidOnly = false, append = false) {
      const nextPage = append ? this.page + 1 : 1;
      this.loading = true;
      try {
        const data: any = await this.api(
          `/shops?page=${nextPage}&limit=${this.limit}&search=${encodeURIComponent(search)}&district=${encodeURIComponent(district)}&town=${encodeURIComponent(town)}&invalidOnly=${invalidOnly}`
        );
        this.page = nextPage;
        this.shops = append ? [...this.shops, ...data.items] : data.items;
        this.total = data.total;
        this.hasMore = this.shops.length < data.total;
      } finally {
        this.loading = false;
      }
    },
    async createShop(payload: Partial<Shop>) {
      await this.api('/shops', { method: 'POST', body: payload });
      await this.fetchShops();
    },
    async updateShop(shopId: string, payload: Partial<Shop>) {
      await this.api(`/shops/${shopId}`, { method: 'PUT', body: payload });
      await this.fetchShops();
    },
    async deleteShop(shopId: string, search = '', district = '', town = '', invalidOnly = false) {
      await this.api(`/shops/${shopId}`, { method: 'DELETE' });
      await this.fetchShops(search, district, town, invalidOnly);
    }
  }
});

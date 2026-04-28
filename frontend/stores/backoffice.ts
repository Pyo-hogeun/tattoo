import { defineStore } from 'pinia';
import type { Shop } from '~/types/shop';

export const useBackofficeStore = defineStore('backoffice', {
  state: () => ({
    shops: [] as Shop[],
    total: 0,
    page: 1,
    limit: 20,
    loading: false
  }),
  actions: {
    api(path: string, options?: any) {
      const config = useRuntimeConfig();
      return $fetch(`${config.public.apiBase}${path}`, options);
    },
    async fetchShops(search = '', district = '', town = '') {
      this.loading = true;
      try {
        const data: any = await this.api(
          `/shops?page=${this.page}&limit=${this.limit}&search=${encodeURIComponent(search)}&district=${encodeURIComponent(district)}&town=${encodeURIComponent(town)}`
        );
        this.shops = data.items;
        this.total = data.total;
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
    async deleteShop(shopId: string, search = '', district = '', town = '') {
      await this.api(`/shops/${shopId}`, { method: 'DELETE' });
      await this.fetchShops(search, district, town);
    }
  }
});

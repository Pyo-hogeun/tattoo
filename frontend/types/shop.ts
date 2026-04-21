export interface Shop {
  _id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  description?: string;
  sourceName?: string;
  updatedAt: string;
}

export interface ScrapeSource {
  _id: string;
  name: string;
  url: string;
  enabled: boolean;
  selectors: {
    item: string;
    name: string;
    address?: string;
    phone?: string;
    city?: string;
    description?: string;
    link?: string;
    externalId?: string;
  };
}

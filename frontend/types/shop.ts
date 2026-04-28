export type DataSourceType = 'manual' | 'crawl';

export interface Shop {
  _id: string;
  name: string;
  address?: string;
  cityProvince?: string;
  district?: string;
  town?: string;
  addressDetail?: string;
  city?: string;
  phone?: string;
  description?: string;
  sourceName?: string;
  homepage?: string;
  instagram?: string;
  kakaoChannel?: string;
  businessHours?: string;
  bookingNotes?: string;
  manualMemo?: string;
  dataSourceType?: DataSourceType;
  isActive?: boolean;
  updatedAt: string;
}

export type ScrapeSourceType = 'custom' | 'naver-map' | 'naver-blog';

export interface ScrapeSource {
  _id: string;
  name: string;
  type: ScrapeSourceType;
  query?: string;
  url?: string;
  enabled: boolean;
  selectors?: {
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

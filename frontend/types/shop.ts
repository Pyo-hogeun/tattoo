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
  businessHoursDetail?: {
    perDay: boolean;
    defaultOpen?: string;
    defaultClose?: string;
    byDay?: Record<string, { open: string; close: string; enabled: boolean }>;
  };
  bookingNotes?: string;
  manualMemo?: string;
  dataSourceType?: DataSourceType;
  isActive?: boolean;
  updatedAt: string;
}

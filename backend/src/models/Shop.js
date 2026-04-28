import mongoose from 'mongoose';

const ShopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true, trim: true },
    address: { type: String, index: true, trim: true },
    cityProvince: { type: String, trim: true, default: '서울특별시', index: true },
    district: { type: String, trim: true, index: true },
    town: { type: String, trim: true, index: true },
    addressDetail: { type: String, trim: true },
    city: { type: String, index: true, trim: true },
    phone: { type: String, index: true, trim: true },
    description: { type: String, trim: true },
    sourceName: { type: String, index: true, trim: true, default: 'manual' },
    sourceUrl: { type: String, trim: true },
    externalId: { type: String, index: true, trim: true },
    homepage: { type: String, trim: true },
    instagram: { type: String, trim: true },
    kakaoChannel: { type: String, trim: true },
    tags: [String],
    businessHours: { type: String, trim: true },
    businessHoursDetail: mongoose.Schema.Types.Mixed,
    bookingNotes: { type: String, trim: true },
    manualMemo: { type: String, trim: true },
    raw: mongoose.Schema.Types.Mixed,
    dataSourceType: {
      type: String,
      enum: ['manual', 'crawl'],
      default: 'manual',
      index: true
    },
    isActive: { type: Boolean, default: true, index: true },
    lastScrapedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

ShopSchema.index({ name: 1, address: 1 }, { unique: true });
ShopSchema.index({ externalId: 1 }, { unique: true, sparse: true });
ShopSchema.index({ phone: 1 }, { unique: true, sparse: true });
ShopSchema.index({ name: 1, phone: 1 });

export const Shop = mongoose.model('Shop', ShopSchema);

import mongoose from 'mongoose';

const ShopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    address: { type: String, index: true },
    city: { type: String, index: true },
    phone: { type: String, index: true },
    description: String,
    sourceName: { type: String, index: true },
    sourceUrl: String,
    externalId: { type: String, index: true },
    homepage: String,
    tags: [String],
    raw: mongoose.Schema.Types.Mixed,
    lastScrapedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

ShopSchema.index({ name: 1, address: 1 }, { unique: true });
ShopSchema.index({ externalId: 1 }, { unique: true, sparse: true });
ShopSchema.index({ name: 1, phone: 1 });

export const Shop = mongoose.model('Shop', ShopSchema);

import mongoose from 'mongoose';

const ShopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    address: { type: String, index: true },
    city: { type: String, index: true },
    phone: String,
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

export const Shop = mongoose.model('Shop', ShopSchema);

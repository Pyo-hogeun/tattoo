import mongoose from 'mongoose';

const selectorSchema = new mongoose.Schema(
  {
    item: { type: String, required: true },
    name: { type: String, required: true },
    address: String,
    phone: String,
    city: String,
    description: String,
    link: String,
    externalId: String
  },
  { _id: false }
);

const ScrapeSourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    selectors: { type: selectorSchema, required: true },
    defaultTags: [String],
    notes: String,
    lastRunAt: Date
  },
  { timestamps: true }
);

export const ScrapeSource = mongoose.model('ScrapeSource', ScrapeSourceSchema);

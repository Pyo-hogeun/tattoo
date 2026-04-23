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
    type: {
      type: String,
      enum: ['custom', 'naver-map', 'naver-blog'],
      default: 'custom',
      index: true
    },
    query: String,
    url: { type: String },
    enabled: { type: Boolean, default: true },
    selectors: { type: selectorSchema },
    defaultTags: [String],
    notes: String,
    lastRunAt: Date
  },
  { timestamps: true }
);

ScrapeSourceSchema.pre('validate', function validateSource(next) {
  if (this.type === 'custom') {
    if (!this.url) {
      this.invalidate('url', 'custom source에는 url이 필요합니다.');
    }

    if (!this.selectors?.item || !this.selectors?.name) {
      this.invalidate('selectors', 'custom source에는 item/name selector가 필요합니다.');
    }
  }

  if ((this.type === 'naver-map' || this.type === 'naver-blog') && !this.url && !this.query) {
    this.invalidate('query', 'naver source에는 url 또는 query가 필요합니다.');
  }

  next();
});

export const ScrapeSource = mongoose.model('ScrapeSource', ScrapeSourceSchema);

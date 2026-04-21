import mongoose from 'mongoose';

const ScrapeRunSchema = new mongoose.Schema(
  {
    sourceName: String,
    sourceUrl: String,
    status: { type: String, enum: ['success', 'failed'], required: true },
    inserted: { type: Number, default: 0 },
    updated: { type: Number, default: 0 },
    totalParsed: { type: Number, default: 0 },
    errorMessage: String,
    durationMs: Number,
    mode: { type: String, enum: ['manual', 'scheduled'], default: 'manual' }
  },
  { timestamps: true }
);

export const ScrapeRun = mongoose.model('ScrapeRun', ScrapeRunSchema);

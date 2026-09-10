import mongoose from 'mongoose';

const InteractionSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  targetType: { type: String, enum: ['gallery'], required: true, default: 'gallery' },
  targetId: { type: String, required: true, trim: true },
  type: { type: String, enum: ['like', 'bookmark'], required: true }
}, { timestamps: true });

InteractionSchema.index({ customer: 1, targetType: 1, targetId: 1, type: 1 }, { unique: true });

export const Interaction = mongoose.model('Interaction', InteractionSchema);

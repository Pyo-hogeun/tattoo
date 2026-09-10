import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  kakaoId: { type: String, required: true, unique: true, index: true },
  nickname: { type: String, trim: true, default: '사용자' },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });

export const Customer = mongoose.model('Customer', CustomerSchema);

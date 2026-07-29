import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  kakaoId: { type: String, required: true, unique: true, index: true },
  nickname: { type: String, trim: true },
  role: { type: String, enum: ['master', 'admin', 'manager'], default: 'manager', index: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);

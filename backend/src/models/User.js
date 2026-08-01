import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  kakaoId: { type: String, unique: true, sparse: true, index: true },
  loginId: { type: String, unique: true, sparse: true, index: true, trim: true, lowercase: true },
  passwordHash: { type: String, select: false },
  nickname: { type: String, trim: true },
  role: { type: String, enum: ['master', 'admin', 'manager'], default: 'manager', index: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

UserSchema.pre('validate', function validateLoginMethod(next) {
  if (this.isNew && !this.kakaoId && !(this.loginId && this.passwordHash)) {
    return next(new Error('카카오 계정 또는 ID/PW 로그인 정보가 필요합니다.'));
  }
  next();
});

export const User = mongoose.model('User', UserSchema);

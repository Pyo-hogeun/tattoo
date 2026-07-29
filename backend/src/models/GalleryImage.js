import mongoose from 'mongoose';

const GalleryImageSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
  imageUrl: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const GalleryImage = mongoose.model('GalleryImage', GalleryImageSchema);

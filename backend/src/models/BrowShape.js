import mongoose from 'mongoose';

const BrowShapeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, index: true },
    imageUrl: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

export const BrowShape = mongoose.model('BrowShape', BrowShapeSchema);

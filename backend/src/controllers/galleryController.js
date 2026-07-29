import { GalleryImage } from '../models/GalleryImage.js';

const payload = (body) => ({ title: body.title, imageUrl: body.imageUrl, description: body.description, isActive: body.isActive });

export const listMyGallery = async (req, res, next) => {
  try { const items = await GalleryImage.find({ owner: req.user._id }).sort({ updatedAt: -1 }); res.json({ items, total: items.length }); } catch (e) { next(e); }
};
export const createGalleryImage = async (req, res, next) => {
  try { const item = await GalleryImage.create({ ...payload(req.body), owner: req.user._id, shop: req.user.shop._id }); res.status(201).json(item); } catch (e) { next(e); }
};
export const updateGalleryImage = async (req, res, next) => {
  try {
    const item = await GalleryImage.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, payload(req.body), { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: '본인이 등록한 사진을 찾을 수 없습니다.' });
    res.json(item);
  } catch (e) { next(e); }
};
export const deleteGalleryImage = async (req, res, next) => {
  try { const item = await GalleryImage.findOneAndDelete({ _id: req.params.id, owner: req.user._id }); if (!item) return res.status(404).json({ message: '본인이 등록한 사진을 찾을 수 없습니다.' }); res.status(204).send(); } catch (e) { next(e); }
};

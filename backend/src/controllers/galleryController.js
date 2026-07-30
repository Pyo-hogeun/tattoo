import crypto from 'crypto';
import path from 'path';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { GalleryImage } from '../models/GalleryImage.js';

const controllerDirectory = path.dirname(fileURLToPath(import.meta.url));
const galleryUploadDirectory = path.resolve(controllerDirectory, '../../uploads/gallery');
const allowedImageTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif']
]);

const httpError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

const normalizePayload = (body = {}) => {
  const payload = {};
  if (typeof body.title === 'string') payload.title = body.title.trim();
  if (typeof body.description === 'string') payload.description = body.description.trim();
  if (body.isActive !== undefined) payload.isActive = body.isActive !== 'false';
  return payload;
};

const saveGalleryFile = async (file) => {
  if (!file) return null;
  const extension = allowedImageTypes.get(file.mimetype);
  if (!extension) throw httpError(400, 'JPG, PNG, WEBP, GIF 이미지만 등록할 수 있습니다.');
  if (!file.size) throw httpError(400, '비어 있는 파일은 등록할 수 없습니다.');

  await mkdir(galleryUploadDirectory, { recursive: true });
  const imageKey = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  await writeFile(path.join(galleryUploadDirectory, imageKey), file.buffer, { flag: 'wx' });
  return { imageKey, imageUrl: `/api/uploads/gallery/${imageKey}` };
};

const removeGalleryFile = async (imageKey) => {
  if (!imageKey || path.basename(imageKey) !== imageKey) return;
  await unlink(path.join(galleryUploadDirectory, imageKey)).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
};

export const listMyGallery = async (req, res, next) => {
  try {
    const items = await GalleryImage.find({ owner: req.user._id }).sort({ updatedAt: -1 });
    res.json({ items, total: items.length });
  } catch (error) { next(error); }
};

export const createGalleryImage = async (req, res, next) => {
  let storedFile;
  try {
    const body = normalizePayload(req.body);
    if (!body.title) throw httpError(400, '작품 제목을 입력해 주세요.');
    if (!req.file) throw httpError(400, '등록할 이미지 파일을 선택해 주세요.');
    storedFile = await saveGalleryFile(req.file);
    const item = await GalleryImage.create({ ...body, ...storedFile, owner: req.user._id, shop: req.user.shop._id });
    res.status(201).json(item);
  } catch (error) {
    if (storedFile) await removeGalleryFile(storedFile.imageKey).catch(() => {});
    next(error);
  }
};

export const updateGalleryImage = async (req, res, next) => {
  let storedFile;
  try {
    const existing = await GalleryImage.findOne({ _id: req.params.id, owner: req.user._id });
    if (!existing) throw httpError(404, '본인이 등록한 사진을 찾을 수 없습니다.');
    const body = normalizePayload(req.body);
    if (body.title === '') throw httpError(400, '작품 제목을 입력해 주세요.');
    const previousImageKey = existing.imageKey;
    storedFile = await saveGalleryFile(req.file);
    Object.assign(existing, body, storedFile || {});
    await existing.save();
    if (storedFile) await removeGalleryFile(previousImageKey).catch((error) => console.error('이전 갤러리 파일 삭제 실패:', error));
    res.json(existing);
  } catch (error) {
    if (storedFile) await removeGalleryFile(storedFile.imageKey).catch(() => {});
    next(error);
  }
};

export const deleteGalleryImage = async (req, res, next) => {
  try {
    const item = await GalleryImage.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!item) throw httpError(404, '본인이 등록한 사진을 찾을 수 없습니다.');
    await removeGalleryFile(item.imageKey).catch((error) => console.error('갤러리 파일 삭제 실패:', error));
    res.status(204).send();
  } catch (error) { next(error); }
};

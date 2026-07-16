import crypto from 'crypto';
import { BrowShape } from '../models/BrowShape.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2 } from '../config/r2.js';

const mimeExtMap = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

const normalizePayload = (payload = {}) => ({
  name: payload.name,
  imageUrl: payload.imageUrl,
  description: payload.description,
  isActive: payload.isActive === 'false' ? false : Boolean(payload.isActive ?? true)
});

const saveMultipartImageIfNeeded = async (req) => {
  const payload = normalizePayload(req.body);
  const file = req.file;

  if (!file) return payload;

  if (!mimeExtMap[file.mimetype]) {
    throw new Error('지원되지 않는 이미지 형식입니다.');
  }

  const extension = mimeExtMap[file.mimetype];
  const filename = `brow-shapes/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype
    })
  );

  return {
    ...payload,
    imageUrl: `${process.env.R2_PUBLIC_URL}/${filename}`
  };
};

export const listBrowShapes = async (_req, res, next) => {
  try {
    const items = await BrowShape.find({}).sort({ updatedAt: -1 });
    res.json({ items, total: items.length });
  } catch (error) {
    next(error);
  }
};

export const createBrowShape = async (req, res, next) => {
  try {
    const payload = await saveMultipartImageIfNeeded(req);
    const created = await BrowShape.create(payload);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateBrowShape = async (req, res, next) => {
  try {
    const payload = await saveMultipartImageIfNeeded(req);
    const updated = await BrowShape.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Brow shape not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteBrowShape = async (req, res, next) => {
  try {
    const deleted = await BrowShape.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Brow shape not found' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

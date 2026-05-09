import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { BrowShape } from '../models/BrowShape.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../../uploads/brow-shapes');

const parseDataUrl = (dataUrl = '') => {
  const matched = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!matched) return null;
  return { mime: matched[1], base64: matched[2] };
};

const mimeExtMap = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

const saveBase64ImageIfNeeded = async (payload = {}) => {
  if (!payload.imageBase64) return payload;
  const parsed = parseDataUrl(payload.imageBase64);
  if (!parsed || !mimeExtMap[parsed.mime]) {
    throw new Error('지원되지 않는 이미지 형식입니다. (jpg, png, webp, gif)');
  }

  await fs.mkdir(uploadDir, { recursive: true });
  const filename = `${Date.now()}-${crypto.randomUUID()}.${mimeExtMap[parsed.mime]}`;
  const absolutePath = path.join(uploadDir, filename);
  await fs.writeFile(absolutePath, Buffer.from(parsed.base64, 'base64'));

  const next = { ...payload, imageUrl: `/uploads/brow-shapes/${filename}` };
  delete next.imageBase64;
  return next;
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
    const payload = await saveBase64ImageIfNeeded(req.body);
    const created = await BrowShape.create(payload);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateBrowShape = async (req, res, next) => {
  try {
    const payload = await saveBase64ImageIfNeeded(req.body);
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

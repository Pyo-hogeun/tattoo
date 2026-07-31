import crypto from 'crypto';
import path from 'path';
import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import { GalleryImage } from '../models/GalleryImage.js';
import { r2 } from '../config/r2.js';
import { env } from '../config/env.js';

const allowedImageTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif']
]);

const httpError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

const assertR2ListConfig = () => {
  if (![env.r2Endpoint, env.r2AccessKey, env.r2SecretKey, env.r2Bucket, env.r2PublicUrl].every(Boolean)) {
    throw httpError(503, '갤러리 조회에 필요한 Cloudflare R2 환경 변수가 설정되지 않았습니다.');
  }
};

const publicUrlForKey = (key) => {
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  return `${env.r2PublicUrl}/${encodedKey}`;
};

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

  if (![env.r2Endpoint, env.r2AccessKey, env.r2SecretKey, env.r2Bucket, env.r2PublicUrl].every(Boolean)) {
    throw httpError(503, '갤러리 업로드에 필요한 Cloudflare R2 환경 변수가 설정되지 않았습니다.');
  }
  const imageKey = `gallery/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  await r2.send(new PutObjectCommand({
    Bucket: env.r2Bucket,
    Key: imageKey,
    Body: file.buffer,
    ContentType: file.mimetype
  }));
  return { imageKey, imageUrl: `${env.r2PublicUrl}/${imageKey}` };
};

const removeGalleryFile = async (imageKey) => {
  if (!imageKey || path.posix.normalize(imageKey) !== imageKey || !imageKey.startsWith('gallery/')) return;
  await r2.send(new DeleteObjectCommand({ Bucket: env.r2Bucket, Key: imageKey }));
};

export const listMyGallery = async (req, res, next) => {
  try {
    const items = await GalleryImage.find({ owner: req.user._id }).sort({ updatedAt: -1 });
    res.json({ items, total: items.length });
  } catch (error) { next(error); }
};

export const listR2Gallery = async (_req, res, next) => {
  try {
    assertR2ListConfig();

    const objects = [];
    let continuationToken;

    do {
      const page = await r2.send(new ListObjectsV2Command({
        Bucket: env.r2Bucket,
        Prefix: 'gallery/',
        ContinuationToken: continuationToken
      }));

      objects.push(...(page.Contents || []));
      continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
      if (page.IsTruncated && !continuationToken) {
        throw new Error('Cloudflare R2 갤러리 목록의 다음 페이지 토큰이 없습니다.');
      }
    } while (continuationToken);

    const items = objects
      .filter(({ Key }) => Key && Key !== 'gallery/' && !Key.endsWith('/'))
      .map(({ Key, Size, LastModified, ETag }) => ({
        key: Key,
        url: publicUrlForKey(Key),
        size: Size ?? 0,
        lastModified: LastModified,
        etag: ETag?.replaceAll('"', '')
      }))
      .sort((a, b) => new Date(b.lastModified || 0) - new Date(a.lastModified || 0));

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

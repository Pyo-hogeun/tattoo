import { Interaction } from '../models/Interaction.js';

const publicInteraction = (item) => ({
  id: item.id,
  customerId: String(item.customer),
  targetType: item.targetType,
  targetId: item.targetId,
  type: item.type,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt
});

const countLikes = (targetId) => Interaction.countDocuments({ targetType: 'gallery', targetId, type: 'like' });

export const listInteractions = async (req, res, next) => {
  try {
    const filter = { customer: req.customer._id };
    if (['like', 'bookmark'].includes(req.query.type)) filter.type = req.query.type;
    if (req.query.targetType === 'gallery') filter.targetType = req.query.targetType;
    if (typeof req.query.targetId === 'string' && req.query.targetId.trim()) filter.targetId = req.query.targetId.trim();
    const items = await Interaction.find(filter).sort({ createdAt: -1 });
    res.json({ items: items.map(publicInteraction), total: items.length });
  } catch (error) { next(error); }
};

export const createInteraction = async (req, res, next) => {
  try {
    const targetType = req.body?.targetType || 'gallery';
    const targetId = typeof req.body?.targetId === 'string' ? req.body.targetId.trim() : '';
    const type = req.body?.type;
    if (targetType !== 'gallery' || !targetId || !['like', 'bookmark'].includes(type)) {
      return res.status(400).json({ message: 'targetType, targetId, type 값을 확인해 주세요.' });
    }
    const item = await Interaction.findOneAndUpdate(
      { customer: req.customer._id, targetType, targetId, type },
      { $setOnInsert: { customer: req.customer._id, targetType, targetId, type } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    const likesCount = type === 'like' ? await countLikes(targetId) : undefined;
    res.status(201).json({ interaction: publicInteraction(item), ...(likesCount !== undefined ? { likesCount } : {}) });
  } catch (error) { next(error); }
};

export const deleteInteractionByTarget = async (req, res, next) => {
  try {
    const targetType = req.query.targetType || 'gallery';
    const targetId = typeof req.query.targetId === 'string' ? req.query.targetId.trim() : '';
    const type = req.query.type;
    if (targetType !== 'gallery' || !targetId || !['like', 'bookmark'].includes(type)) {
      return res.status(400).json({ message: 'targetType, targetId, type 값을 확인해 주세요.' });
    }
    await Interaction.findOneAndDelete({ customer: req.customer._id, targetType, targetId, type });
    const likesCount = type === 'like' ? await countLikes(targetId) : undefined;
    res.json({ active: false, ...(likesCount !== undefined ? { likesCount } : {}) });
  } catch (error) { next(error); }
};

export const deleteInteraction = async (req, res, next) => {
  try {
    const item = await Interaction.findOneAndDelete({ _id: req.params.id, customer: req.customer._id });
    if (!item) return res.status(404).json({ message: '상호작용 정보를 찾을 수 없습니다.' });
    res.status(204).send();
  } catch (error) { next(error); }
};

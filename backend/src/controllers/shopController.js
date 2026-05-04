import { Shop } from '../models/Shop.js';
import { validateSeoulShopPayload } from '../utils/seoulValidation.js';

const normalizeShopPayload = (payload = {}, isUpdate = false) => {
  const next = { ...payload };

  if (!isUpdate) {
    next.dataSourceType = payload.dataSourceType || 'manual';
    next.sourceName = payload.sourceName || 'manual';
  }

  if (payload.dataSourceType === 'manual' && !payload.sourceName) {
    next.sourceName = 'manual';
  }

  if (next.dataSourceType === 'manual') {
    next.lastScrapedAt = undefined;
  }

  return next;
};

export const listShops = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const search = req.query.search?.trim();
    const city = req.query.city?.trim();
    const district = req.query.district?.trim();
    const town = req.query.town?.trim();

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { manualMemo: { $regex: search, $options: 'i' } }
      ];
    }
    if (city) {
      filter.city = { $regex: `^${city}$`, $options: 'i' };
    }
    if (district) {
      filter.district = { $regex: `^${district}$`, $options: 'i' };
    }
    if (town) {
      filter.town = { $regex: `^${town}$`, $options: 'i' };
    }

    const [items, total] = await Promise.all([
      Shop.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Shop.countDocuments(filter)
    ]);

    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const createShop = async (req, res, next) => {
  try {
    const normalizedPayload = normalizeShopPayload(req.body);
    const validation = validateSeoulShopPayload(normalizedPayload);
    if (!validation.isValid) {
      return res.status(400).json({ message: '서울특별시 매장 데이터 검증 실패', errors: validation.errors });
    }

    const created = await Shop.create(normalizedPayload);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateShop = async (req, res, next) => {
  try {
    const normalizedPayload = normalizeShopPayload(req.body, true);
    const validation = validateSeoulShopPayload(normalizedPayload);
    if (!validation.isValid) {
      return res.status(400).json({ message: '서울특별시 매장 데이터 검증 실패', errors: validation.errors });
    }

    const updated = await Shop.findByIdAndUpdate(req.params.id, normalizedPayload, {
      new: true,
      runValidators: true
    });

    if (!updated) return res.status(404).json({ message: 'Shop not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteShop = async (req, res, next) => {
  try {
    const deleted = await Shop.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Shop not found' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

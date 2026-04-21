import { Shop } from '../models/Shop.js';

export const listShops = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const search = req.query.search?.trim();
    const city = req.query.city?.trim();

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (city) {
      filter.city = { $regex: `^${city}$`, $options: 'i' };
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
    const created = await Shop.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateShop = async (req, res, next) => {
  try {
    const updated = await Shop.findByIdAndUpdate(req.params.id, req.body, {
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

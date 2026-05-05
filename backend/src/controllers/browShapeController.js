import { BrowShape } from '../models/BrowShape.js';

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
    const created = await BrowShape.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateBrowShape = async (req, res, next) => {
  try {
    const updated = await BrowShape.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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

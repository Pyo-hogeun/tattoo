import { ScrapeSource } from '../models/ScrapeSource.js';

export const listSources = async (_req, res, next) => {
  try {
    const items = await ScrapeSource.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const createSource = async (req, res, next) => {
  try {
    const created = await ScrapeSource.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateSource = async (req, res, next) => {
  try {
    const updated = await ScrapeSource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: 'Source not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteSource = async (req, res, next) => {
  try {
    const deleted = await ScrapeSource.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Source not found' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

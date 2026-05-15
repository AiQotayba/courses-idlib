import { Router } from 'express';
import { CategoryModel } from '../../models/category.model.js';

export const categoriesRouter = Router();

categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const items = await CategoryModel.find().sort({ name: 1 }).lean();
    res.json(
      items.map((c) => ({
        _id: String(c._id),
        name: c.name,
        image: c.image,
        slug: c.slug,
        createdAt: c.createdAt.toISOString(),
      })),
    );
  } catch (e) {
    next(e);
  }
});

categoriesRouter.get('/:id', async (req, res, next) => {
  try {
    const c = await CategoryModel.findById(req.params.id).lean();
    if (!c) {
      res.status(404).json({ error: true, message: 'Category not found' });
      return;
    }
    res.json({
      _id: String(c._id),
      name: c.name,
      image: c.image,
      slug: c.slug,
      createdAt: c.createdAt.toISOString(),
    });
  } catch (e) {
    next(e);
  }
});

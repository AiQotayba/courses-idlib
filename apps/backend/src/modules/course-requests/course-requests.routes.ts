import { Router } from 'express';
import mongoose from 'mongoose';
import { courseRequestCreateSchema } from '@repo/validation';
import { validateBody } from '../../middlewares/validate.middleware.js';
import { CourseRequestModel } from '../../models/course-request.model.js';

export const courseRequestsRouter = Router();

courseRequestsRouter.post('/', validateBody(courseRequestCreateSchema), async (req, res, next) => {
  try {
    const body = req.body as { email: string; categoryId?: string; note?: string };
    const categoryId =
      body.categoryId && mongoose.Types.ObjectId.isValid(body.categoryId)
        ? body.categoryId
        : undefined;
    await CourseRequestModel.create({
      email: body.email.toLowerCase().trim(),
      categoryId,
      note: body.note?.trim() || undefined,
      matchedCourseIds: [],
    });
    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
});

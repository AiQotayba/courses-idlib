import { Router } from 'express';
import mongoose from 'mongoose';
import { updateProfileSchema } from '@repo/validation';
import { UserModel } from '../../models/user.model.js';
import { NotificationModel } from '../../models/notification.model.js';
import type { AuthedRequest } from '../../middlewares/auth.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validateBody } from '../../middlewares/validate.middleware.js';

export const usersRouter = Router();

usersRouter.get('/profile', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const user = await UserModel.findById(req.user?.id).lean();
    if (!user) {
      res.status(404).json({ error: true, message: 'User not found' });
      return;
    }
    res.json({
      _id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (e) {
    next(e);
  }
});

usersRouter.get('/notifications', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.user!.id);
    const items = await NotificationModel.find({ userId: uid })
      .sort({ read: 1, createdAt: -1 })
      .limit(50)
      .lean();
    res.json(
      items.map((n) => ({
        _id: String(n._id),
        kind: n.kind,
        title: n.title,
        body: n.body,
        courseId: String(n.courseId),
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      })),
    );
  } catch (e) {
    next(e);
  }
});

usersRouter.patch('/notifications/:id/read', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.user!.id);
    const n = await NotificationModel.findOneAndUpdate(
      { _id: req.params.id, userId: uid },
      { read: true },
      { new: true },
    ).lean();
    if (!n) {
      res.status(404).json({ error: true, message: 'Not found' });
      return;
    }
    res.json({
      _id: String(n._id),
      kind: n.kind,
      title: n.title,
      body: n.body,
      courseId: String(n.courseId),
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    });
  } catch (e) {
    next(e);
  }
});

usersRouter.put(
  '/profile',
  requireAuth,
  validateBody(updateProfileSchema),
  async (req: AuthedRequest, res, next) => {
    try {
      const body = req.body as { fullName?: string; avatar?: string };
      const user = await UserModel.findByIdAndUpdate(
        req.user?.id,
        {
          ...(body.fullName !== undefined ? { fullName: body.fullName } : {}),
          ...(body.avatar !== undefined
            ? { avatar: body.avatar === '' ? undefined : body.avatar }
            : {}),
        },
        { new: true },
      ).lean();
      if (!user) {
        res.status(404).json({ error: true, message: 'User not found' });
        return;
      }
      res.json({
        _id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt.toISOString(),
      });
    } catch (e) {
      next(e);
    }
  },
);

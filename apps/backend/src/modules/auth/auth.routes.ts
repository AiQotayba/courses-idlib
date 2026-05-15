import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  loginSchema,
  registerSchema,
} from '@repo/validation';
import { UserModel } from '../../models/user.model.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { signAccessToken } from '../../utils/jwt.js';
import type { AuthedRequest } from '../../middlewares/auth.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validateBody } from '../../middlewares/validate.middleware.js';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRouter = Router();

authRouter.use(limiter);

authRouter.post('/register', authLimiter, validateBody(registerSchema), async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body as {
      fullName: string;
      email: string;
      password: string;
    };
    const exists = await UserModel.exists({ email });
    if (exists) {
      res.status(409).json({ error: true, message: 'Email already registered' });
      return;
    }
    const hashed = await hashPassword(password);
    const user = await UserModel.create({ fullName, email, password: hashed, role: 'user' });
    const accessToken = signAccessToken(String(user._id), user.role);
    res.status(201).json({
      user: {
        _id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt.toISOString(),
      },
      accessToken,
    });
  } catch (e) {
    next(e);
  }
});

authRouter.post('/login', authLimiter, validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(401).json({ error: true, message: 'Invalid credentials' });
      return;
    }
    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      res.status(401).json({ error: true, message: 'Invalid credentials' });
      return;
    }
    const accessToken = signAccessToken(String(user._id), user.role);
    res.json({
      user: {
        _id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt.toISOString(),
      },
      accessToken,
    });
  } catch (e) {
    next(e);
  }
});

authRouter.get('/me', requireAuth, async (req: AuthedRequest, res, next) => {
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

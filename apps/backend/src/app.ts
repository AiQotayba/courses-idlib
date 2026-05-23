import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { coursesRouter } from './modules/courses/courses.routes.js';
import { categoriesRouter } from './modules/categories/categories.routes.js';
import { courseRequestsRouter } from './modules/course-requests/course-requests.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

export function createApp(): express.Application {
  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/courses', coursesRouter);
  app.use('/categories', categoriesRouter);
  app.use('/apply', courseRequestsRouter);
  app.use('/admin', adminRouter);

  app.use(errorHandler);
  return app;
}

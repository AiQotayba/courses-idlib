import 'dotenv/config';

process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/courses';
process.env.JWT_SECRET ??= 'dev-only-secret-change-me';

import { connectDb } from '../config/db.js';
import { UserModel } from '../models/user.model.js';
import { CategoryModel } from '../models/category.model.js';
import { CourseModel } from '../models/course.model.js';
import { hashPassword } from '../utils/password.js';

async function seed(): Promise<void> {
  await connectDb();
  await CourseModel.deleteMany({});
  await CategoryModel.deleteMany({ slug: { $in: ['marketing', 'creative', 'analytics'] } });
  await UserModel.deleteMany({ email: { $in: ['admin@example.com', 'learner@example.com'] } });
  const adminHash = await hashPassword('Admin12345!');
  const userHash = await hashPassword('Learner12345!');
  const [admin, learner] = await Promise.all([
    UserModel.create({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: adminHash,
      role: 'admin',
    }),
    UserModel.create({
      fullName: 'Learner',
      email: 'learner@example.com',
      password: userHash,
      role: 'user',
    }),
  ]);
  const [mkt, creative, analytics] = await Promise.all([
    CategoryModel.create({
      name: 'Marketing',
      slug: 'marketing',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
    }),
    CategoryModel.create({
      name: 'Creative',
      slug: 'creative',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    }),
    CategoryModel.create({
      name: 'Analytics',
      slug: 'analytics',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    }),
  ]);
  await CourseModel.create([
    {
      title: 'Performance Ads Fundamentals',
      description:
        'A calm, practical introduction to structuring campaigns, writing clear offers, and measuring outcomes without drowning in jargon.',
      thumbnail:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
      price: 49,
      categoryId: mkt._id,
      isPublished: true,
    },
    {
      title: 'Creative Testing for Paid Social',
      description:
        'Learn how to iterate hooks, thumbnails, and landing pages with a lightweight testing cadence your team can sustain.',
      thumbnail:
        'https://images.unsplash.com/photo-1611162617474-5b21e879641f?w=1200&q=80',
      price: 79,
      categoryId: creative._id,
      isPublished: true,
    },
    {
      title: 'Attribution Without the Drama',
      description:
        'Build a sane measurement stack: events, experiments, and reporting that stakeholders actually trust.',
      thumbnail:
        'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&q=80',
      price: 59,
      categoryId: analytics._id,
      isPublished: true,
    },
  ]);
  console.log('Seed complete.');
  console.log('Admin:', admin.email, '/ Admin12345!');
  console.log('User:', learner.email, '/ Learner12345!');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

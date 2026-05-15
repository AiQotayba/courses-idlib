import type { Types } from 'mongoose';
import { CourseRequestModel } from '../models/course-request.model.js';
import { NotificationModel } from '../models/notification.model.js';
import { UserModel } from '../models/user.model.js';

export async function notifyRequestsMatchingCourse(course: {
  _id: Types.ObjectId | unknown;
  title: string;
  description: string;
  categoryId: Types.ObjectId | unknown;
  isPublished: boolean;
}): Promise<void> {
  if (!course.isPublished) return;
  const courseId = String(course._id);
  const catId = String(course.categoryId);
  const blob = `${course.title}\n${course.description}`.toLowerCase();

  const requests = await CourseRequestModel.find({}).lean();
  for (const r of requests) {
    let match = false;
    if (r.categoryId && String(r.categoryId) === catId) match = true;
    if (!match && r.note && r.note.trim().length > 0) {
      const words = r.note
        .toLowerCase()
        .split(/\s+/)
        .map((w) => w.replace(/[^\p{L}\p{N}]+/gu, ''))
        .filter((w) => w.length > 2);
      if (words.some((w) => blob.includes(w))) match = true;
    }
    if (!match) continue;

    const already = (r.matchedCourseIds ?? []).some((id) => String(id) === courseId);
    if (!already) {
      await CourseRequestModel.updateOne({ _id: r._id }, { $addToSet: { matchedCourseIds: course._id } });
    }

    const email = r.email.toLowerCase().trim();
    const user = await UserModel.findOne({ email }).lean();
    if (!user) continue;

    const exists = await NotificationModel.exists({
      userId: user._id,
      courseId: course._id,
      kind: 'course_request_match',
    });
    if (exists) continue;

    await NotificationModel.create({
      userId: user._id,
      kind: 'course_request_match',
      title: 'دورة جديدة قد تناسب طلبك',
      body: course.title,
      courseId: course._id,
      read: false,
    });
  }
}

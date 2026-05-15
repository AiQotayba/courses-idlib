import mongoose, { Schema, Types } from 'mongoose';

export interface CourseRequestDoc {
  email: string;
  categoryId?: Types.ObjectId;
  note?: string;
  matchedCourseIds: Types.ObjectId[];
  createdAt: Date;
}

const courseRequestSchema = new Schema<CourseRequestDoc>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    note: { type: String, maxlength: 2000 },
    matchedCourseIds: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const CourseRequestModel = mongoose.model<CourseRequestDoc>(
  'CourseRequest',
  courseRequestSchema,
);

import mongoose, { Schema, Types } from 'mongoose';

export interface CourseDoc {
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  categoryId: Types.ObjectId;
  isPublished: boolean;
  featured: boolean;
  createdAt: Date;
}

const courseSchema = new Schema<CourseDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    thumbnail: { type: String },
    price: { type: Number, required: true, min: 0 },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    isPublished: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

courseSchema.index({ title: 'text', description: 'text' });

export const CourseModel = mongoose.model<CourseDoc>('Course', courseSchema);

import mongoose, { Schema } from 'mongoose';

export interface CategoryDoc {
  name: string;
  image?: string;
  slug: string;
  createdAt: Date;
}

const categorySchema = new Schema<CategoryDoc>(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const CategoryModel = mongoose.model<CategoryDoc>('Category', categorySchema);

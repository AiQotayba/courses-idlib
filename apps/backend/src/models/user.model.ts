import type { UserRole } from '../types.js';
import mongoose, { Schema } from 'mongoose';

export interface UserDoc {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const UserModel = mongoose.model<UserDoc>('User', userSchema);

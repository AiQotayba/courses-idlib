import mongoose, { Schema, Types } from 'mongoose';

export type NotificationKindDoc = 'course_request_match';

export interface NotificationDoc {
  userId: Types.ObjectId;
  kind: NotificationKindDoc;
  title: string;
  body: string;
  courseId: Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<NotificationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kind: { type: String, required: true, enum: ['course_request_match'] },
    title: { type: String, required: true },
    body: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

notificationSchema.index({ userId: 1, courseId: 1, kind: 1 }, { unique: true });

export const NotificationModel = mongoose.model<NotificationDoc>('Notification', notificationSchema);

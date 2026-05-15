export type UserRole = 'user' | 'admin';

export interface UserPublic {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  image?: string;
  slug: string;
  createdAt: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  categoryId: string;
  category?: Pick<Category, '_id' | 'name' | 'slug'>;
  isPublished: boolean;
  /** يدوي من الإدارة لعرض الشارة «مميز» والقسم الإعلاني */
  featured?: boolean;
  createdAt: string;
}

export interface CourseRequest {
  _id: string;
  email: string;
  categoryId?: string;
  category?: Pick<Category, '_id' | 'name' | 'slug'>;
  note?: string;
  matchedCount: number;
  matchedCourseIds: string[];
  createdAt: string;
}

export type NotificationKind = 'course_request_match';

export interface Notification {
  _id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  courseId: string;
  read: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface ApiErrorBody {
  error: true;
  message: string;
}

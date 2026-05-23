import { apiGet } from '@/lib/server-api';
import { RequestCourseForm } from '@/components/request-course-form';

type Category = { _id: string; name: string };

export default async function RequestCoursePage() {
  const categories = await apiGet<Category[]>('/categories');
  return <RequestCourseForm categories={categories} />;
}

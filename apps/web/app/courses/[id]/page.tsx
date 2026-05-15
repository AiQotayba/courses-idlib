import Image from 'next/image';
import Link from 'next/link';
import type { Course } from '@repo/types';
import { apiGet } from '@/lib/server-api';
import { notFound } from 'next/navigation';
import { RecordCourseView } from '@/components/home/record-course-view';

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let course: Course;
  try {
    course = await apiGet<Course>(`/courses/${id}`);
  } catch {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <RecordCourseView
        _id={course._id}
        title={course.title}
        thumbnail={course.thumbnail}
        categoryId={course.categoryId}
      />
      <Link href="/courses" className="text-sm font-medium text-slate-600 hover:text-slate-900">
        العودة إلى الدورات
      </Link>
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="relative aspect-[21/9] bg-slate-100">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : null}
        </div>
        <div className="space-y-4 p-8 sm:p-10">
          <p className="text-xs font-medium text-slate-500">
            {course.category?.name ?? 'دورة'}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {course.title}
          </h1>
          <p className="text-2xl font-semibold text-slate-900" dir="ltr">
            ${course.price}
          </p>
          <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-600">
            {course.description}
          </p>
        </div>
      </div>
    </article>
  );
}

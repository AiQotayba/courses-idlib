import Image from 'next/image';
import Link from 'next/link';
import type { Course } from '@repo/types';

export function isNewCourse(course: Course): boolean {
  const t = new Date(course.createdAt).getTime();
  return Date.now() - t < 14 * 24 * 60 * 60 * 1000;
}

function CourseBadges({ course }: { course: Course }) {
  return (
    <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
      {course.featured ? (
        <span className="rounded-full bg-home-orange-soft px-2 py-0.5 text-[10px] font-bold text-home-orange">
          مميز
        </span>
      ) : null}
      {isNewCourse(course) ? (
        <span className="rounded-full bg-home-blue/15 px-2 py-0.5 text-[10px] font-bold text-home-blue-dark">
          جديد
        </span>
      ) : null}
    </div>
  );
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-home-canvas transition duration-300 hover:shadow-home-card"
    >
      <div className="relative aspect-[16/10] bg-home-surface">
        <CourseBadges course={course} />
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt=""
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col space-y-1.5 p-4 sm:p-5">
        <p className="text-xs font-semibold text-home-muted">{course.category?.name ?? 'دورة'}</p>
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-home-ink">
          {course.title}
        </p>
        <p className="text-sm font-bold text-home-ink" dir="ltr">
          ${course.price}
        </p>
        <span className="mt-auto inline-flex pt-2 text-xs font-bold text-home-blue underline-offset-2 group-hover:underline">
          عرض التفاصيل
        </span>
      </div>
    </Link>
  );
}

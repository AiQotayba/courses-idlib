import Image from 'next/image';
import Link from 'next/link';
import type { Course } from '@repo/types';
import { CourseCard } from '@/components/home/course-card';

function SpotlightFeature({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course._id}`}
      className="group relative isolate block overflow-hidden rounded-2xl bg-slate-900 shadow-[0_24px_60px_-12px_rgba(37,99,235,0.35)] transition hover:shadow-[0_28px_70px_-10px_rgba(37,99,235,0.45)]"
    >
      <div className="relative aspect-[16/9] min-h-[200px] w-full sm:aspect-[21/9] sm:min-h-[240px]">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt=""
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, min(1152px, 100vw)"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-home-blue via-indigo-700 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-br from-home-blue/25 to-transparent opacity-80 mix-blend-screen" />
        <div className="absolute bottom-0 start-0 w-full p-6 sm:p-8 lg:max-w-[65%]">
          <p className="inline-flex items-center gap-2 text-xs font-bold text-home-orange">
            <span className="h-1.5 w-1.5 rounded-full bg-home-orange" aria-hidden />
            اختيار اليوم
          </p>
          <h3 className="mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl">{course.title}</h3>
          {course.category?.name ? (
            <p className="mt-2 text-sm font-medium text-white/80">{course.category.name}</p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <span className="text-lg font-bold text-white" dir="ltr">
              ${course.price}
            </span>
            <span className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-home-ink transition group-hover:bg-home-orange-soft group-hover:text-home-orange">
              اكتشف الدورة
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function LatestCoursesSection({
  spotlight,
  latest,
}: {
  spotlight: Course[];
  latest: Course[];
}) {
  const spotIds = new Set(spotlight.map((c) => c._id));
  const latestDeduped = latest.filter((c) => !spotIds.has(c._id));
  const gridCourses = (latestDeduped.length > 0 ? latestDeduped : latest).slice(0, 6);
  const [heroPick, ...spotRest] = spotlight;

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-xl font-bold text-home-ink">وصل حديثاً وعروض مختارة</h2>
        <p className="mt-2 text-sm leading-relaxed text-home-muted">الجديد على المنصة وما نرشّحه بقوة.</p>
      </div>

      {heroPick ? (
        <div className="space-y-5">
          <SpotlightFeature course={heroPick} />
          {spotRest.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-1 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {spotRest.map((course) => (
                <div key={course._id} className="w-[min(260px,82vw)] shrink-0">
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-5">
        <p className="text-xs font-bold uppercase tracking-wider text-home-muted">آخر الإضافات</p>
        {gridCourses.length === 0 && spotlight.length === 0 ? (
          <p className="rounded-2xl bg-home-canvas/90 py-12 text-center text-sm text-home-muted">
            لا توجد دورات منشورة بعد.
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gridCourses.map((course) => (
              <li key={course._id}>
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

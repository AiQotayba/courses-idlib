import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import type { Course } from '@repo/types';
import { apiGet } from '@/lib/server-api';
import { RecordSearchFromUrl } from '@/components/home/record-search-from-url';

type ListResponse = {
  items: Course[];
  page: number;
  limit: number;
  total: number;
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.category) params.set('categoryId', sp.category);
  if (sp.q) params.set('q', sp.q);
  const qs = params.toString();
  const data = await apiGet<ListResponse>(`/courses${qs ? `?${qs}` : ''}`);

  const categories = await apiGet<
    { _id: string; name: string; slug: string }[]
  >('/categories');

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <RecordSearchFromUrl />
      </Suspense>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">الدورات</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          دروس منشورة يمكنك البدء بها اليوم. صفِّ حسب التصنيف لتضييق القائمة.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <FilterChip href="/courses" active={!sp.category} label="الكل" />
        {categories.map((c) => (
          <FilterChip
            key={c._id}
            href={`/courses?category=${c._id}`}
            active={sp.category === c._id}
            label={c.name}
          />
        ))}
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((course) => (
          <li key={course._id}>
            <Link
              href={`/courses/${course._id}`}
              className="group block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] bg-slate-100">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                ) : null}
              </div>
              <div className="space-y-2 p-5">
                <p className="text-xs font-medium text-slate-500">
                  {course.category?.name ?? 'دورة'}
                </p>
                <h2 className="text-lg font-semibold leading-snug text-slate-900 group-hover:text-slate-700">
                  {course.title}
                </h2>
                <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
                  {course.description}
                </p>
                <p className="pt-1 text-sm font-semibold text-slate-900" dir="ltr">
                  ${course.price}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-slate-600">
          لا توجد دورات تطابق هذا التصفية بعد.
        </p>
      ) : null}
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        active
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
      }`}
    >
      {label}
    </Link>
  );
}

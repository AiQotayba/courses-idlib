'use client';

import Link from 'next/link';
import { setPreferCategoryId } from '@/lib/viewing-history';

type Cat = { _id: string; name: string; slug: string };

export function CategoriesSection({ categories }: { categories: Cat[] }) {
  const items = categories.slice(0, 8);
  if (items.length === 0) return null;

  return (
    <div className="space-y-8" id="categories">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-home-ink">تصفّح حسب التصنيف</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-home-muted">
            اختر مجالك وانتقل مباشرة إلى الدورات المصفّاة.
          </p>
        </div>
        <Link
          href="/courses"
          className="rounded-full bg-home-surface px-4 py-2 text-sm font-bold text-home-blue transition hover:bg-home-blue/10"
        >
          كل الدورات
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((c, i) => (
          <li key={c._id}>
            <Link
              href={`/courses?category=${c._id}`}
              onClick={() => setPreferCategoryId(c._id)}
              className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-home-surface to-white px-5 py-6 transition duration-300 hover:shadow-home-card"
            >
              <span
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-lg font-black text-home-blue"
                aria-hidden
              >
                {(i % 4) + 1}
              </span>
              <span className="text-base font-bold text-home-ink">{c.name}</span>
              <span className="mt-auto pt-5 text-xs font-bold text-home-blue">استكشف ←</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

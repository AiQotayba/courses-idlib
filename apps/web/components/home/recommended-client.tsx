'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Course } from '@repo/types';
import { getPreferCategoryId, getViewedCourses } from '@/lib/viewing-history';
import { getLastSearch } from '@/lib/search-history';
import { CourseCard } from '@/components/home/course-card';

export function RecommendedForYou({ courses }: { courses: Course[] }) {
  const [ready, setReady] = useState(false);
  const [prefer, setPrefer] = useState<string | null>(null);
  const [lastCat, setLastCat] = useState<string | null>(null);
  const [lastSearch, setLastSearchState] = useState<string | null>(null);

  useEffect(() => {
    setPrefer(getPreferCategoryId());
    const v = getViewedCourses()[0];
    setLastCat(v?.categoryId ?? null);
    setLastSearchState(getLastSearch());
    setReady(true);
  }, []);

  const picked = useMemo(() => {
    if (!ready) return courses.slice(0, 6);
    const searchWords = (lastSearch ?? '')
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/[^\p{L}\p{N}]+/gu, ''))
      .filter((w) => w.length > 2);

    const score = (c: Course): number => {
      let s = 0;
      const cat = prefer ?? lastCat;
      if (cat && c.categoryId === cat) s += 4;
      const title = c.title.toLowerCase();
      const desc = c.description.toLowerCase();
      for (const w of searchWords) {
        if (title.includes(w) || desc.includes(w)) s += 2;
      }
      const t = new Date(c.createdAt).getTime();
      s += t / 1e15;
      return s;
    };

    const sorted = [...courses].sort((a, b) => score(b) - score(a));
    const seen = new Set<string>();
    const out: Course[] = [];
    for (const c of sorted) {
      if (seen.has(c._id)) continue;
      seen.add(c._id);
      out.push(c);
      if (out.length >= 6) break;
    }
    return out;
  }, [courses, prefer, lastCat, lastSearch, ready]);

  const subtitle = useMemo(() => {
    if (lastSearch && lastSearch.trim())
      return 'بناءً على آخر بحث، تصنيفك المفضّل، أو آخر دورة شاهدتها';
    if (prefer || lastCat) return 'بناءً على التصنيف أو آخر دورة شاهدتها، مع إبراز الجديد';
    return 'بناءً على الجديد والتصنيفات الشائعة على المنصة';
  }, [lastSearch, prefer, lastCat]);

  if (courses.length === 0) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-home-ink">دورات قد تهمك</h2>
        <p className="mt-2 text-sm leading-relaxed text-home-muted">{subtitle}</p>
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {picked.map((course) => (
          <li key={course._id}>
            <CourseCard course={course} />
          </li>
        ))}
      </ul>
    </div>
  );
}

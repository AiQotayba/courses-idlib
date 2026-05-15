'use client';

import { HomeSearch } from '@/components/home/home-search';

export function HomeSearchStrip() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-home-surface px-4 py-4 sm:px-5 sm:py-5">
      <p className="mb-3 text-center text-sm font-semibold text-home-ink">ابحث في الدورات</p>
      <HomeSearch variant="strip" />
    </div>
  );
}

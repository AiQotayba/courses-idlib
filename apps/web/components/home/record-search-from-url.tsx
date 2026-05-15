'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { setLastSearch } from '@/lib/search-history';

export function RecordSearchFromUrl() {
  const sp = useSearchParams();
  useEffect(() => {
    const q = sp.get('q')?.trim();
    if (q) setLastSearch(q);
  }, [sp]);
  return null;
}

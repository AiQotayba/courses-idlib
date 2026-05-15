'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { IconSearch } from '@/components/admin-icons';

export function AdminHeaderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(() => searchParams.get('q') ?? '');

  useEffect(() => {
    setQ(searchParams.get('q') ?? '');
  }, [searchParams]);

  const submit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = q.trim();
      const params = new URLSearchParams();
      if (trimmed) params.set('q', trimmed);
      const qs = params.toString();
      router.push(`/dashboard/users${qs ? `?${qs}` : ''}`);
    },
    [q, router],
  );

  return (
    <form onSubmit={submit} className="relative mx-auto w-full max-w-md flex-1">
      <label htmlFor="admin-global-search" className="sr-only">
        بحث في المستخدمين
      </label>
      <IconSearch className="pointer-events-none absolute end-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input
        id="admin-global-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ابحث عن مستخدم…"
        className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pe-10 ps-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-admin-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
        dir="rtl"
      />
    </form>
  );
}

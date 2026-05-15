'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { setLastSearch } from '@/lib/search-history';

const stripInput =
  'w-full rounded-xl bg-white py-3.5 pe-[5.5rem] ps-4 text-sm text-home-ink shadow-none outline-none ring-0 placeholder:text-home-muted/75 focus-visible:ring-2 focus-visible:ring-home-blue/35';

const defaultInput =
  'w-full rounded-xl bg-home-canvas py-3.5 pe-[5.5rem] ps-4 text-sm text-home-ink shadow-none outline-none ring-0 placeholder:text-home-muted/75 focus-visible:ring-2 focus-visible:ring-home-blue/30';

export function HomeSearch({ variant = 'default' }: { variant?: 'default' | 'strip' }) {
  const router = useRouter();
  const [q, setQ] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) {
      router.push('/courses');
      return;
    }
    setLastSearch(trimmed);
    router.push(`/courses?q=${encodeURIComponent(trimmed)}`);
  };

  const inputClass = variant === 'strip' ? stripInput : defaultInput;

  return (
    <form onSubmit={submit} className="relative">
      <label htmlFor="home-search" className="sr-only">
        بحث عن دورة
      </label>
      <input
        id="home-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="اكتب موضوعاً أو اسم دورة…"
        className={inputClass}
        dir="rtl"
        autoComplete="off"
      />
      <button
        type="submit"
        className="absolute end-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-home-blue px-4 py-2 text-xs font-bold text-white transition hover:bg-home-blue-dark"
      >
        بحث
      </button>
    </form>
  );
}

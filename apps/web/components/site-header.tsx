'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@repo/utils';
import { useEffect, useState } from 'react';
import { NotificationsMenu } from '@/components/notifications-menu';

const mainNav = [{ href: '/courses', label: 'الدورات' }] as const;

const requestNav = {
  href: '/request-course',
  label: 'لم تجد ما تبحث عنه؟',
} as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-home-canvas/90 shadow-[0_1px_0_rgba(15,23,42,0.06)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:gap-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-sm font-black tracking-tight text-home-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-home-blue to-home-blue-dark text-xs font-black text-white">
            د
          </span>
          الدورات
        </Link>
        <nav className="flex min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          {mainNav.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-semibold text-home-muted transition hover:bg-home-surface hover:text-home-ink',
                  active && 'bg-home-blue text-white hover:bg-home-blue-dark hover:text-white',
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href={requestNav.href}
            className={cn(
              'max-w-[10.5rem] text-balance rounded-full bg-home-orange/12 px-2.5 py-1.5 text-center text-[10px] font-bold leading-snug text-home-orange transition hover:bg-home-orange/20 sm:max-w-none sm:px-3.5 sm:text-sm sm:leading-normal',
              pathname === requestNav.href && 'bg-home-orange text-white hover:bg-home-orange hover:text-white',
            )}
          >
            {requestNav.label}
          </Link>
          {token ? (
            <>
              <Link
                href="/profile"
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-semibold text-home-muted transition hover:bg-home-surface hover:text-home-ink',
                  pathname === '/profile' &&
                    'bg-home-blue text-white hover:bg-home-blue-dark hover:text-white',
                )}
              >
                الملف الشخصي
              </Link>
              <NotificationsMenu />
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('accessToken');
                  setToken(null);
                  window.location.href = '/';
                }}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-home-muted hover:bg-home-surface hover:text-home-ink"
              >
                تسجيل الخروج
              </button>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

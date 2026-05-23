'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import { cn } from '@repo/utils';
import { getAdminApi } from '@/lib/client-api';
import type { UserPublic } from '@repo/types';
import { WEB_APP_URL } from '@/lib/web-app-url';
import { AdminHeaderSearch } from '@/components/admin-header-search';
import {
  IconBag,
  IconBell,
  IconBook,
  IconChart,
  IconDashboard,
  IconFolder,
  IconInbox,
  IconLogout,
  IconSettings,
  IconUsers,
} from '@/components/admin-icons';

const nav = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: IconDashboard, kind: 'dashboard' as const },
  { href: '/dashboard/users', label: 'المستخدمون', icon: IconUsers, kind: 'prefix' as const },
  { href: '/dashboard/courses', label: 'الدورات', icon: IconBook, kind: 'prefix' as const },
  { href: '/dashboard/categories', label: 'التصنيفات', icon: IconFolder, kind: 'prefix' as const },
  { href: '/dashboard/apply', label: 'طلبات الدورات', icon: IconInbox, kind: 'prefix' as const },
  { href: '/dashboard#stats', label: 'الإحصاءات', icon: IconChart, kind: 'stats' as const },
] as const;

function navActive(
  pathname: string,
  hash: string,
  href: string,
  kind: 'dashboard' | 'prefix' | 'stats',
): boolean {
  const [path] = href.split('#');
  if (kind === 'stats') return pathname === '/dashboard' && hash === '#stats';
  if (kind === 'dashboard')
    return (pathname === path || pathname === `${path}/`) && hash !== '#stats';
  return pathname === path || pathname.startsWith(`${path}/`);
}

function pageTitle(pathname: string): string {
  if (pathname.startsWith('/dashboard/apply')) return 'طلبات الدورات';
  if (pathname.startsWith('/dashboard/users')) return 'المستخدمون';
  if (pathname.startsWith('/dashboard/courses')) return 'الدورات';
  if (pathname.startsWith('/dashboard/categories')) return 'التصنيفات';
  if (pathname === '/dashboard' || pathname === '/dashboard/') return 'لوحة التحكم';
  return 'لوحة الإدارة';
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '؟';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function roleLabelAr(role: string): string {
  if (role === 'admin') return 'مسؤول';
  return 'مستخدم';
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<UserPublic | null>(null);
  const [hash, setHash] = useState('');

  useEffect(() => {
    setHash(typeof window !== 'undefined' ? window.location.hash : '');
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.replace('/login');
        return;
      }
      try {
        const api = getAdminApi();
        const user = await api.get<UserPublic>('/auth/me');
        if (user.role !== 'admin') {
          router.replace('/login');
          return;
        }
        if (!cancelled) {
          setMe(user);
          setReady(true);
        }
      } catch {
        router.replace('/login');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const title = useMemo(() => pageTitle(pathname), [pathname]);

  if (!ready || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-surface text-sm text-slate-600">
        جاري التحقق من الصلاحيات…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-admin-surface font-sans text-slate-900">
      <aside className="sticky top-0 flex h-screen w-[min(17rem,88vw)] shrink-0 flex-col border-s border-slate-200/90 bg-admin-sidebar px-3 py-6 shadow-admin-card sm:w-64">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2.5 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-admin-primary text-white shadow-admin-card">
            <IconBag className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">منصة الدورات</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = navActive(pathname, hash, item.href, item.kind);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  active
                    ? 'bg-admin-primary/10 text-admin-primary'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-admin-primary' : 'text-slate-400')} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 rounded-2xl bg-gradient-to-br from-admin-primary to-admin-primary-dark p-4 text-white shadow-admin">
          <p className="text-sm font-medium">تحتاج مساعدة؟</p>
          <p className="mt-1 text-xs text-white/85">تصفح الموقع العام أو تواصل مع الفريق.</p>
          <a
            href={WEB_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-admin-accent px-3 py-2 text-center text-sm font-semibold text-slate-900 shadow-sm transition hover:brightness-95"
          >
            مركز المساعدة
          </a>
        </div>

        <button
          type="button"
          className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
          onClick={() => {
            localStorage.removeItem('accessToken');
            router.replace('/login');
          }}
        >
          <IconLogout className="h-5 w-5 shrink-0" />
          تسجيل الخروج
        </button>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-admin-surface/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <h1 className="shrink-0 text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h1>

            <Suspense
              fallback={
                <div className="mx-auto h-10 w-full max-w-md flex-1 animate-pulse rounded-full bg-slate-200/70 lg:mx-0" />
              }
            >
              <AdminHeaderSearch />
            </Suspense>

            <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end sm:gap-3 lg:justify-end">
              <Link
                href="/dashboard#stats"
                className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-admin-primary"
                aria-label="الإعدادات"
              >
                <IconSettings className="h-5 w-5" />
              </Link>
              <button
                type="button"
                className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-admin-primary"
                aria-label="التنبيهات"
              >
                <IconBell className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-1.5 shadow-admin-card">
                <div className="hidden text-start sm:block">
                  <p className="text-sm font-semibold text-slate-900">{me.fullName}</p>
                  <p className="text-xs text-slate-500">{roleLabelAr(me.role)}</p>
                </div>
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-admin-primary/15 text-xs font-semibold text-admin-primary"
                  aria-hidden
                >
                  {initialsFromName(me.fullName)}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200/80 bg-white p-5 shadow-admin-card sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

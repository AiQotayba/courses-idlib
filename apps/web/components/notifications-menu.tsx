'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Notification } from '@repo/types';
import { getWebApi } from '@/lib/client-api';

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setErr(null);
    try {
      const api = getWebApi();
      const list = await api.get<Notification[]>('/users/notifications');
      setItems(list);
    } catch {
      setErr('تعذّر التحميل');
      setItems([]);
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && items === null) void load();
  };

  const markRead = async (id: string) => {
    try {
      const api = getWebApi();
      await api.patch(`/users/notifications/${id}/read`, undefined);
      setItems((prev) =>
        prev ? prev.map((n) => (n._id === id ? { ...n, read: true } : n)) : prev,
      );
    } catch {
      /* ignore */
    }
  };

  const unread = items?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        className="relative rounded-xl bg-home-surface px-3 py-1.5 text-sm font-semibold text-home-ink transition hover:bg-home-blue/10"
      >
        الإشعارات
        {unread > 0 ? (
          <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-0.5 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute end-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl bg-home-canvas p-2 shadow-[0_16px_48px_-8px_rgba(15,23,42,0.18)]">
          {err ? <p className="p-2 text-sm text-rose-600">{err}</p> : null}
          {!items?.length ? (
            <p className="p-3 text-sm text-home-muted">لا توجد إشعارات بعد.</p>
          ) : (
            <ul className="max-h-72 space-y-1 overflow-y-auto">
              {items.map((n) => (
                <li key={n._id}>
                  <div
                    className={`rounded-lg px-3 py-2 text-start text-sm ${
                      n.read ? 'text-home-muted' : 'bg-home-surface font-semibold text-home-ink'
                    }`}
                  >
                    <p>{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-home-muted">{n.body}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link
                        href={`/courses/${n.courseId}`}
                        className="text-xs font-bold text-home-blue underline"
                        onClick={() => {
                          if (!n.read) void markRead(n._id);
                          setOpen(false);
                        }}
                      >
                        فتح الدورة
                      </Link>
                      {!n.read ? (
                        <button
                          type="button"
                          className="text-xs text-home-muted hover:text-home-ink"
                          onClick={() => void markRead(n._id)}
                        >
                          تعيين كمقروء
                        </button>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

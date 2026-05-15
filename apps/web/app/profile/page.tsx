'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@repo/ui';
import { getWebApi } from '@/lib/client-api';
import type { UserPublic } from '@repo/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function roleLabel(role: string): string {
  if (role === 'admin') return 'مسؤول';
  if (role === 'user') return 'مستخدم';
  return role;
}

export default function ProfilePage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem('accessToken'));
  }, []);

  const q = useQuery({
    queryKey: ['me', token],
    enabled: !!token,
    queryFn: async () => {
      const api = getWebApi();
      return api.get<UserPublic>('/auth/me');
    },
  });

  if (token === null) {
    return <p className="text-slate-600">جاري التحميل…</p>;
  }

  if (!token) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="text-slate-600">أنت غير مسجّل الدخول.</p>
        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-slate-900 underline">
          تسجيل الدخول
        </Link>
      </Card>
    );
  }

  if (q.isLoading) {
    return <p className="text-slate-600">جاري تحميل الملف الشخصي…</p>;
  }

  if (q.isError || !q.data) {
    return (
      <Card className="mx-auto max-w-md">
        <p className="text-rose-600">تعذّر تحميل الملف الشخصي. حاول تسجيل الدخول مرة أخرى.</p>
      </Card>
    );
  }

  const u = q.data;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">الملف الشخصي</h1>
        <p className="mt-2 text-slate-600">بيانات حسابك من الخادم.</p>
      </div>
      <Card className="space-y-3">
        <Row label="الاسم" value={u.fullName} />
        <Row label="البريد" value={u.email} />
        <Row label="الدور" value={roleLabel(u.role)} />
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-sm text-slate-900" dir={label === 'البريد' ? 'ltr' : undefined}>
        {value}
      </span>
    </div>
  );
}

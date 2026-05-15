'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@repo/validation';
import type { z } from 'zod';
import { Button, Card, Input, Label } from '@repo/ui';
import { getAdminApi } from '@/lib/client-api';
import { useState } from 'react';

type Form = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<Form>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setErr(null);
    try {
      const api = getAdminApi();
      const res = await api.post<{ accessToken: string; user: { role: string } }>(
        '/auth/login',
        values,
      );
      if (res.user.role !== 'admin') {
        setErr('هذا الحساب ليس حساب مسؤول.');
        return;
      }
      localStorage.setItem('accessToken', res.accessToken);
      router.replace('/dashboard');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'تعذّر تسجيل الدخول');
    }
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-admin-surface px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-admin-primary/15 via-transparent to-transparent"
        aria-hidden
      />
      <Card className="relative w-full max-w-md border border-slate-200/90 shadow-admin-card">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-admin-primary text-sm font-bold text-white shadow-admin-card">
            AD
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">دخول الإدارة</h1>
            <p className="text-xs text-slate-500">منصة الدورات</p>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          استخدم حساب المسؤول من البذور، مثلاً{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs" dir="ltr">
            admin@example.com
          </code>
          .
        </p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              dir="ltr"
              className="text-start"
              {...register('email')}
            />
            {formState.errors.email ? (
              <p className="mt-1 text-sm text-rose-600">{formState.errors.email.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              dir="ltr"
              className="text-start"
              {...register('password')}
            />
            {formState.errors.password ? (
              <p className="mt-1 text-sm text-rose-600">{formState.errors.password.message}</p>
            ) : null}
          </div>
          {err ? <p className="text-sm text-rose-600">{err}</p> : null}
          <Button
            type="submit"
            className="w-full bg-admin-primary font-semibold text-white hover:bg-admin-primary-dark"
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting ? 'جاري الدخول…' : 'متابعة'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

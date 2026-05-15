'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@repo/validation';
import type { z } from 'zod';
import { Button, Card, Input, Label } from '@repo/ui';
import Link from 'next/link';
import { getWebApi } from '@/lib/client-api';
import { useState } from 'react';

type Form = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<Form>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setErr(null);
    try {
      const api = getWebApi();
      const res = await api.post<{ accessToken: string }>('/auth/login', values);
      localStorage.setItem('accessToken', res.accessToken);
      router.push('/profile');
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'تعذّر تسجيل الدخول');
    }
  });

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">تسجيل الدخول</h1>
        <p className="mt-2 text-sm text-slate-600">
          مرحبًا بعودتك. يمكنك استخدام حساب المتعلّم التجريبي بعد تشغيل سكربت البذور في الـ API.
        </p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
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
          <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'جاري الدخول…' : 'تسجيل الدخول'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          ليس لديك حساب؟{' '}
          <Link
            href="/register"
            className="font-medium text-slate-900 underline-offset-4 hover:underline"
          >
            أنشئ حسابًا
          </Link>
        </p>
      </Card>
    </div>
  );
}

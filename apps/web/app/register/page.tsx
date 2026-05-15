'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@repo/validation';
import type { z } from 'zod';
import { Button, Card, Input, Label } from '@repo/ui';
import Link from 'next/link';
import { getWebApi } from '@/lib/client-api';
import { useState } from 'react';

type Form = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const {
    register: field,
    handleSubmit,
    formState,
  } = useForm<Form>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setErr(null);
    try {
      const api = getWebApi();
      const res = await api.post<{ accessToken: string }>('/auth/register', values);
      localStorage.setItem('accessToken', res.accessToken);
      router.push('/profile');
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'تعذّر إنشاء الحساب');
    }
  });

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">إنشاء حساب</h1>
        <p className="mt-2 text-sm text-slate-600">ابدأ التعلّم خلال ثوانٍ.</p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <Input id="fullName" autoComplete="name" {...field('fullName')} />
            {formState.errors.fullName ? (
              <p className="mt-1 text-sm text-rose-600">{formState.errors.fullName.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              dir="ltr"
              className="text-start"
              {...field('email')}
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
              autoComplete="new-password"
              dir="ltr"
              className="text-start"
              {...field('password')}
            />
            {formState.errors.password ? (
              <p className="mt-1 text-sm text-rose-600">{formState.errors.password.message}</p>
            ) : null}
          </div>
          {err ? <p className="text-sm text-rose-600">{err}</p> : null}
          <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'جاري الإنشاء…' : 'إنشاء الحساب'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          لديك حساب بالفعل؟{' '}
          <Link
            href="/login"
            className="font-medium text-slate-900 underline-offset-4 hover:underline"
          >
            سجّل الدخول
          </Link>
        </p>
      </Card>
    </div>
  );
}

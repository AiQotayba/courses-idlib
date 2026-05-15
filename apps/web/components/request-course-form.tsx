'use client';

import { useState } from 'react';
import Link from 'next/link';

type Cat = { _id: string; name: string };

const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function RequestCourseForm({ categories }: { categories: Cat[] }) {
  const [email, setEmail] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage(null);
    try {
      const res = await fetch(`${base}/course-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          categoryId: categoryId || undefined,
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(b?.message ?? 'فشل الإرسال');
      }
      setStatus('ok');
      setMessage('تم استلام طلبك. سنبلّغك عند وجود دورة مطابقة لنفس البريد إن كان لديك حساب.');
      setNote('');
    } catch (err) {
      setStatus('err');
      setMessage(err instanceof Error ? err.message : 'تعذّر الإرسال');
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
          ← الرئيسية
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">اطلب دورة</h1>
        <p className="mt-2 text-sm text-slate-600">
          اذكر المجال أو الكلمات المفتاحية. عند نشر دورة منشورة تطابق طلبك، نرسل إشعاراً لحسابك إن تطابق
          البريد.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="rq-email" className="block text-sm font-medium text-slate-700">
            البريد الإلكتروني
          </label>
          <input
            id="rq-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900"
            dir="ltr"
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="rq-cat" className="block text-sm font-medium text-slate-700">
            التصنيف (اختياري)
          </label>
          <select
            id="rq-cat"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rq-note" className="block text-sm font-medium text-slate-700">
            ماذا تبحث عنه؟
          </label>
          <textarea
            id="rq-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="مثال: تحليلات أداء حملات ميتا، أو أساسيات التصميم للإعلانات…"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900"
          />
        </div>
        {message ? (
          <p className={`text-sm ${status === 'ok' ? 'text-emerald-700' : 'text-rose-600'}`}>{message}</p>
        ) : null}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-2xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {status === 'loading' ? 'جاري الإرسال…' : 'سجّل الطلب'}
        </button>
      </form>
    </div>
  );
}

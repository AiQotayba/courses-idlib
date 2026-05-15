import Link from 'next/link';

const shortcuts = [
  {
    href: '/dashboard/users',
    title: 'المستخدمون',
    body: 'إنشاء الحسابات وتعديلها وحذفها.',
    hint: 'بحث سريع من شريط العنوان.',
  },
  {
    href: '/dashboard/courses',
    title: 'الدورات',
    body: 'نشر الدروس وتحديد الأسعار.',
    hint: '',
  },
  {
    href: '/dashboard/categories',
    title: 'التصنيفات',
    body: 'تنظيم الكتالوج بتسميات واضحة.',
    hint: '',
  },
] as const;

export default function DashboardHome() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-admin-primary to-admin-primary-dark p-6 text-white shadow-admin sm:p-8 lg:p-10">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">ارتقِ بإدارة المحتوى</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
            لوحة تحكم موحّدة للمستخدمين والدورات والتصنيفات. ركّز على الجودة واترك الإجراءات المتكررة
            لهذه الأدوات.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/courses"
              className="inline-flex items-center justify-center rounded-xl bg-admin-accent px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:brightness-95"
            >
              إدارة الدورات
            </Link>
            <Link
              href="/dashboard/users"
              className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
            >
              المستخدمون
            </Link>
          </div>
        </div>
        <div
          className="pointer-events-none absolute -bottom-8 -start-16 h-48 w-48 rounded-full bg-white/10 blur-2xl sm:h-64 sm:w-64"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-12 end-0 h-40 w-40 rounded-full bg-admin-accent/20 blur-3xl"
          aria-hidden
        />
      </section>

      <section id="stats" className="scroll-mt-24">
        <h3 className="mb-4 text-base font-semibold text-slate-900">نظرة سريعة</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'إجمالي الطلبات', value: '—', sub: 'ربط لاحق بالتحليلات' },
            { label: 'المستخدمون النشطون', value: '—', sub: 'من واجهة الـ API' },
            { label: 'الدورات المنشورة', value: '—', sub: 'حسب الحالة' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-admin-card"
            >
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
              <p className="mt-2 text-2xl font-semibold text-admin-primary">{s.value}</p>
              <p className="mt-1 text-xs text-slate-500">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-base font-semibold text-slate-900">اختصارات</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {shortcuts.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-admin-card transition hover:-translate-y-0.5 hover:border-admin-primary/25 hover:shadow-md"
            >
              <h2 className="text-base font-semibold text-slate-900">{c.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.body}</p>
              {c.hint ? <p className="mt-2 text-xs text-admin-primary">{c.hint}</p> : null}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

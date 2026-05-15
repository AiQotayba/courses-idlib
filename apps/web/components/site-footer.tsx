import Link from 'next/link';

const footerLinks = [
  { href: '/', label: 'الرئيسية' },
  { href: '/courses', label: 'الدورات' },
  { href: '/request-course', label: 'لم تجد ما تبحث عنه؟' },
] as const;

const accountLinks = [
  { href: '/login', label: 'تسجيل الدخول' },
  { href: '/register', label: 'إنشاء حساب' },
  { href: '/profile', label: 'الملف الشخصي' },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-home-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-[minmax(0,1.2fr)_auto_auto] sm:gap-8">
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-home-ink">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-home-blue to-home-blue-dark text-xs font-black text-white">
                د
              </span>
              الدورات
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-home-muted">
              دورات عملية لتطوير مهاراتك. تصفّح التصنيفات، ابحث عن موضوعك، أو اطلب دورة عندما لا تجد دورتك المناسبة
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-home-ink">استكشف</p>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-home-muted transition hover:text-home-blue"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 text-center text-xs text-home-muted">
          <p>© {year} منصة الدورات. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}

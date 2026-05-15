import Link from 'next/link';

export function RequestCourseCta() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7f1d1d] via-[#991b1b] to-[#1e3a5f] px-6 py-11 text-white sm:px-10 sm:py-12">
      <div
        className="pointer-events-none absolute -start-24 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-16 bottom-0 h-56 w-56 rounded-full bg-home-blue/30 blur-3xl"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />

      <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">نحو محتوى يناسبك</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">لم تجد ما تبحث عنه؟</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/85">
            اطلب دورة بالمجال أو الكلمات التي تهمك. عند نشر دورة منشورة تطابق طلبك نبلّغ حسابك إن وُجد
            بنفس البريد.
          </p>
        </div>
        <Link
          href="/request-course"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-home-ink transition hover:bg-home-orange-soft hover:text-home-orange"
        >
          اطلب دورة
        </Link>
      </div>
    </section>
  );
}

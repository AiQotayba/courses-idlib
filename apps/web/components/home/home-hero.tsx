import Image from 'next/image';
import Link from 'next/link';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=88';

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="h-2 w-2 shrink-0 rounded-full bg-home-orange" aria-hidden />
      <div>
        <p className="text-xl font-black tabular-nums text-home-ink">{value}</p>
        <p className="text-sm text-home-muted">{label}</p>
      </div>
    </div>
  );
}

export function HomeHero({
  courseCount,
  categoryCount,
}: {
  courseCount: number;
  categoryCount: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-white via-slate-50/90 to-blue-50/50 px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
      <div
        className="pointer-events-none absolute -start-32 -top-24 h-72 w-72 rounded-full bg-home-blue/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-24 bottom-0 h-64 w-64 rounded-full bg-home-orange/12 blur-3xl"
        aria-hidden
      />

      <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)] lg:gap-12">
        <div className="space-y-6 lg:space-y-7">
          <div>
            <p className="text-sm font-bold text-home-blue">مسار واضح نحو المهارة</p>
            <h1 className="mt-3 text-[1.65rem] font-black leading-[1.2] tracking-tight text-home-ink sm:text-4xl lg:text-[2.35rem] lg:leading-[1.15]">
              تعلّم بثقة من دورات يختارها فريقنا لأنّها تُحدث فرقاً في عملك
            </h1>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-home-muted sm:text-[1.05rem]">
            بدون تعقيد: محتوى عملي، تصنيفات واضحة، وطلب دورة عندما لا يكفي الكتالوج. نبني تجربة هادئة
            تركّز على التعلّم لا على الزحام البصري.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-xl bg-home-blue px-6 py-3 text-sm font-bold text-white transition hover:bg-home-blue-dark"
            >
              استكشف الدورات
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-home-ink px-6 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
            >
              ابدأ الآن
            </Link>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-4 pt-1">
            <StatItem value={courseCount} label="دورة منشورة" />
            <StatItem value={categoryCount} label="تصنيف" />
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none lg:justify-self-stretch">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-[0_28px_60px_-18px_rgba(30,64,175,0.35)] lg:aspect-[5/4]">
            <Image
              src={HERO_IMAGE}
              alt=""
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width:1024px) 100vw, 44vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-home-blue/15 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

import type { ReactNode } from 'react';

/** شريط خلفية فاتحة بدون حدود — فصل بصري باللون فقط */
export function HomeSurfaceBand({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-[1.25rem] bg-home-surface px-5 py-12 sm:px-8 sm:py-14">{children}</section>
  );
}

/** قسم على لون الصفحة مع تباعد فقط (بدون إطار) */
export function HomePlainSection({ children }: { children: ReactNode }) {
  return <section className="px-1 py-12 sm:py-14">{children}</section>;
}

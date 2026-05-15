import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@repo/utils';

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

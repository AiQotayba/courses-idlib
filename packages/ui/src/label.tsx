import type { LabelHTMLAttributes, ReactNode } from 'react';
import { cn } from '@repo/utils';

export function Label({
  className,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { children?: ReactNode }) {
  return (
    <label
      className={cn('mb-1.5 block text-sm font-medium text-slate-700', className)}
      {...props}
    >
      {children}
    </label>
  );
}

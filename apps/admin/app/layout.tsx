import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'الإدارة — الدورات',
  description: 'إدارة المستخدمين والدورات والتصنيفات.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="min-h-screen bg-admin-surface font-sans text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

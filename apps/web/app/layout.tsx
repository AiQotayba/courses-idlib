import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'الدورات — منصة تعلم الإعلانات',
  description: 'تصفّح دورات عملية لفِرق الإعلان الحديثة.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="flex min-h-screen flex-col bg-home-canvas font-sans text-home-ink antialiased">
        <Providers>
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-10 sm:px-6">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}

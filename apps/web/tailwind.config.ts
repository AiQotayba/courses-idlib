import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-tajawal)', 'Tahoma', 'Segoe UI', 'sans-serif'],
      },
      /* Tajawal لا يوفّر وزن 600؛ next/font يتحقق من الأوزان المستخدمة مع الخط */
      fontWeight: {
        semibold: '700',
      },
      colors: {
        home: {
          canvas: '#ffffff',
          surface: '#f8f9fa',
          ink: '#111827',
          muted: '#6b7280',
          line: '#e5e7eb',
          blue: '#2563eb',
          'blue-dark': '#1d4ed8',
          orange: '#ea580c',
          'orange-soft': '#fff7ed',
        },
      },
      boxShadow: {
        'home-card': '0 2px 12px rgba(15, 23, 42, 0.06)',
        'home-soft': '0 1px 3px rgba(15, 23, 42, 0.04)',
      },
      borderRadius: {
        home: '14px',
      },
    },
  },
  plugins: [],
} satisfies Config;

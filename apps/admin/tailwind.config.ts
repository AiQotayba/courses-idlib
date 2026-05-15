import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-tajawal)', 'Tahoma', 'Segoe UI', 'sans-serif'],
      },
      fontWeight: {
        semibold: '700',
      },
      colors: {
        admin: {
          primary: '#2D5BFF',
          'primary-dark': '#2547d6',
          accent: '#FFD700',
          surface: '#F0F4FA',
          sidebar: '#FFFFFF',
        },
      },
      boxShadow: {
        admin: '0 4px 24px rgba(45, 91, 255, 0.08)',
        'admin-card': '0 2px 12px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config;

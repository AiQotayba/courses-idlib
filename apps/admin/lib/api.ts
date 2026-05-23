'use client';

import { toast } from 'sonner';
import { createApi } from '@/lib/api-client';

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const api = createApi({
  baseUrl,
  getLang: () => 'ar',
  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  },
  showToast: (message, type) => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else if (type === 'warning') toast.warning(message);
    else toast.info(message);
  },
  onUnauthorized: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  },
  defaultTimeout: 20000,
  credentials: 'omit',
});

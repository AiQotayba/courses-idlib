'use client';

import { createApiClient } from '@repo/api-client';

const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function getAdminApi() {
  return createApiClient({
    baseUrl: base,
    getToken: () => (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null),
  });
}

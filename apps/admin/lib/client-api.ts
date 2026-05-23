'use client';

import type { ApiResponse } from '@/lib/api-client';
import { api } from '@/lib/api';

/** يستخرج جسم الاستجابة ويرمي عند الخطأ (متوافق مع شكل الـ API الحالي: items, page, …) */
function unwrap<T>(res: ApiResponse<T> & Record<string, unknown>): T {
  if (res.isError) {
    throw new Error(res.message ?? 'Request failed');
  }
  const { isError: _e, message: _m, status: _s, meta: _meta, data: _d, ...body } = res;
  return body as T;
}

/** عميل مبسّط للصفحات التي تتوقع JSON مباشرة بدون غلاف ApiResponse */
export function getAdminApi() {
  return {
    get: <T>(path: string) => api.get(path).then((res) => unwrap<T>(res as ApiResponse<T> & Record<string, unknown>)),
    post: <T>(path: string, json?: unknown) =>
      api.post(path, json).then((res) => unwrap<T>(res as ApiResponse<T> & Record<string, unknown>)),
    put: <T>(path: string, json?: unknown) =>
      api.put(path, json).then((res) => unwrap<T>(res as ApiResponse<T> & Record<string, unknown>)),
    patch: <T>(path: string, json?: unknown) =>
      api.patch(path, json).then((res) => unwrap<T>(res as ApiResponse<T> & Record<string, unknown>)),
    delete: <T>(path: string) =>
      api.delete(path).then((res) => unwrap<T>(res as ApiResponse<T> & Record<string, unknown>)),
  };
}

export { api };

import type { ApiErrorBody } from '@repo/types';

export class ApiClientError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.body = body;
  }
}

export type ApiClientOptions = {
  baseUrl: string;
  getToken?: () => string | null | undefined;
};

function normalizeError(status: number, body: unknown): never {
  if (body && typeof body === 'object' && 'error' in body && (body as ApiErrorBody).error) {
    const msg = (body as ApiErrorBody).message ?? 'Request failed';
    throw new ApiClientError(msg, status, body);
  }
  throw new ApiClientError('Request failed', status, body);
}

export function createApiClient(opts: ApiClientOptions) {
  const { baseUrl, getToken } = opts;

  async function request<T>(
    path: string,
    init: RequestInit & { json?: unknown } = {},
  ): Promise<T> {
    const url = `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
    const headers = new Headers(init.headers);
    if (init.json !== undefined) {
      headers.set('Content-Type', 'application/json');
    }
    const token = getToken?.();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const res = await fetch(url, {
      ...init,
      headers,
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    });
    const text = await res.text();
    const data = text.length > 0 ? (JSON.parse(text) as unknown) : undefined;
    if (!res.ok) {
      normalizeError(res.status, data ?? { error: true, message: res.statusText });
    }
    return data as T;
  }

  return {
    get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'GET' }),
    post: <T>(path: string, json?: unknown, init?: RequestInit) =>
      request<T>(path, { ...init, method: 'POST', json }),
    put: <T>(path: string, json?: unknown, init?: RequestInit) =>
      request<T>(path, { ...init, method: 'PUT', json }),
    patch: <T>(path: string, json?: unknown, init?: RequestInit) =>
      request<T>(path, { ...init, method: 'PATCH', json }),
    delete: <T>(path: string, init?: RequestInit) =>
      request<T>(path, { ...init, method: 'DELETE' }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

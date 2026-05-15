const base = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${base}${path}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, json: unknown, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, { method: 'POST', headers, body: JSON.stringify(json) });
  const text = await res.text();
  const data = text.length > 0 ? (JSON.parse(text) as unknown) : undefined;
  if (!res.ok) {
    const msg =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message?: string }).message)
        : 'Request failed';
    throw new Error(msg);
  }
  return data as T;
}

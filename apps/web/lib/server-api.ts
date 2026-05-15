const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${base}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

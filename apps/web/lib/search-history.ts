const KEY = 'courses:lastSearch';

export function setLastSearch(q: string): void {
  if (typeof window === 'undefined') return;
  const t = q.trim();
  if (t.length < 2) return;
  localStorage.setItem(KEY, t);
}

export function getLastSearch(): string | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(KEY);
  return v && v.trim().length > 0 ? v.trim() : null;
}

export function clearLastSearch(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

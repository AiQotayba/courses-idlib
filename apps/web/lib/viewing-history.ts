export type ViewedCourse = {
  id: string;
  title: string;
  thumbnail?: string;
  categoryId?: string;
  viewedAt: string;
};

const VIEWED_KEY = 'courses:viewed';
const PREFER_CATEGORY_KEY = 'courses:preferCategory';
const MAX_VIEWED = 10;

function safeParse(raw: string | null): ViewedCourse[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (x): x is ViewedCourse =>
          typeof x === 'object' &&
          x !== null &&
          'id' in x &&
          typeof (x as ViewedCourse).id === 'string' &&
          'title' in x &&
          typeof (x as ViewedCourse).title === 'string',
      )
      .map((x) => ({
        id: x.id,
        title: x.title,
        thumbnail: typeof x.thumbnail === 'string' ? x.thumbnail : undefined,
        categoryId: typeof x.categoryId === 'string' ? x.categoryId : undefined,
        viewedAt: typeof x.viewedAt === 'string' ? x.viewedAt : new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

export function getViewedCourses(): ViewedCourse[] {
  if (typeof window === 'undefined') return [];
  return safeParse(localStorage.getItem(VIEWED_KEY));
}

export function recordCourseView(entry: {
  id: string;
  title: string;
  thumbnail?: string;
  categoryId?: string;
}): void {
  if (typeof window === 'undefined') return;
  const now = new Date().toISOString();
  const prev = safeParse(localStorage.getItem(VIEWED_KEY));
  const next = [
    { ...entry, viewedAt: now },
    ...prev.filter((c) => c.id !== entry.id),
  ].slice(0, MAX_VIEWED);
  localStorage.setItem(VIEWED_KEY, JSON.stringify(next));
}

export function getPreferCategoryId(): string | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(PREFER_CATEGORY_KEY);
  return v && v.length > 0 ? v : null;
}

export function setPreferCategoryId(categoryId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFER_CATEGORY_KEY, categoryId);
}

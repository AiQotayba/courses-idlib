'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { CourseRequest } from '@repo/types';
import { Button, Modal } from '@repo/ui';
import { getAdminApi } from '@/lib/client-api';

type List = { items: CourseRequest[]; page: number; limit: number; total: number };

export default function AdminCourseRequestsPage() {
  const qc = useQueryClient();
  const [deleting, setDeleting] = useState<CourseRequest | null>(null);

  const list = useQuery({
    queryKey: ['admin', 'course-requests'],
    queryFn: async () => {
      const api = getAdminApi();
      return api.get<List>('/admin/course-requests?page=1&limit=200');
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const api = getAdminApi();
      await api.delete(`/admin/course-requests/${id}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'course-requests'] });
      setDeleting(null);
    },
  });

  if (list.isLoading) return <p className="text-sm text-slate-600">جاري تحميل الطلبات…</p>;
  if (list.isError) return <p className="text-sm text-rose-600">تعذّر تحميل طلبات الدورات.</p>;

  const items = list.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">طلبات الدورات</h2>
        <p className="text-sm text-slate-600">
          طلبات الزوار لدورات غير موجودة بعد. يظهر عدد الدورات التي طابقت الطلب آلياً بعد النشر.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl bg-slate-50/80">
        <table className="min-w-full divide-y divide-slate-200/80 text-sm">
          <thead className="bg-slate-100/80 text-start text-xs font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-3">البريد</th>
              <th className="px-4 py-3">التصنيف</th>
              <th className="px-4 py-3">الملاحظة</th>
              <th className="px-4 py-3">مطابقات</th>
              <th className="px-4 py-3">التاريخ</th>
              <th className="px-4 py-3 text-end">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  لا توجد طلبات بعد.
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900" dir="ltr">
                    {r.email}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.category?.name ?? '—'}</td>
                  <td className="max-w-xs px-4 py-3 text-slate-600">
                    <span className="line-clamp-2">{r.note ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.matchedCount > 0 ? (
                      <span className="font-semibold text-admin-primary">{r.matchedCount}</span>
                    ) : (
                      '0'
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500" dir="ltr">
                    {new Date(r.createdAt).toLocaleString('ar')}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-2 py-1 text-xs text-rose-600"
                      onClick={() => setDeleting(r)}
                    >
                      حذف
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!deleting}
        title="حذف الطلب"
        onClose={() => setDeleting(null)}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setDeleting(null)}>
              إلغاء
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deleteMut.isPending}
              onClick={() => deleting && deleteMut.mutate(deleting._id)}
            >
              {deleteMut.isPending ? 'جاري الحذف…' : 'حذف'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          حذف طلب <span className="font-semibold text-slate-900" dir="ltr">{deleting?.email}</span>؟ لا يمكن
          التراجع.
        </p>
      </Modal>
    </div>
  );
}

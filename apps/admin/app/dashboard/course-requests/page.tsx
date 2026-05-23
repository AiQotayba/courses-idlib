'use client';

import type { CourseRequest } from '@repo/types';
import { DataTable, type TableColumn } from '@/components/table/data-table';
import { api } from '@/lib/api';

function roleLabelDate(iso: string) {
  return new Date(iso).toLocaleString('ar');
}

const columns: TableColumn<CourseRequest>[] = [
  {
    key: 'email',
    label: 'البريد',
    render: (v) => (
      <span className="font-medium text-slate-900" dir="ltr">
        {String(v)}
      </span>
    ),
  },
  {
    key: 'category',
    label: 'التصنيف',
    render: (_, row) => row.category?.name ?? '—',
  },
  {
    key: 'note',
    label: 'ملاحظة',
    render: (v) => (
      <span className="line-clamp-2 max-w-xs text-slate-600">{v ? String(v) : '—'}</span>
    ),
  },
  {
    key: 'matchedCount',
    label: 'مطابقات',
    render: (v) =>
      Number(v) > 0 ? (
        <span className="font-semibold text-admin-primary">{String(v)}</span>
      ) : (
        '0'
      ),
  },
  {
    key: 'createdAt',
    label: 'التاريخ',
    render: (v) => (
      <span className="whitespace-nowrap text-slate-500" dir="ltr">
        {roleLabelDate(String(v))}
      </span>
    ),
  },
];

export default function AdminCourseRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">طلبات الدورات</h2>
        <p className="text-sm text-slate-600">
          طلبات الزوار لدورات غير موجودة. عند نشر دورة مطابقة يُحدَّث العداد ويُرسل إشعار إن وُجد حساب
          بنفس البريد.
        </p>
      </div>

      <DataTable<CourseRequest>
        apiEndpoint="/admin/course-requests"
        columns={columns}
        searchPlaceholder="بحث بالبريد أو الملاحظة…"
        emptyMessage="لا توجد طلبات بعد."
        enableEdit={false}
        enableView={false}
        deleteDescription={(row) => (
          <>
            حذف طلب <span className="font-semibold" dir="ltr">{row.email}</span>؟
          </>
        )}
        onDeleteConfirm={async (row) => {
          const res = await api.delete(`/admin/course-requests/${row._id}`);
          if (res.isError) throw new Error(res.message);
        }}
      />
    </div>
  );
}

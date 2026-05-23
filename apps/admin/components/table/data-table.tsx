'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Eye, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Modal } from '@repo/ui';
import { cn } from '@repo/utils';
import { api } from '@/lib/api';

const DEFAULT_LIMIT = 10;
const LIMIT_OPTIONS = [10, 25, 50, 100] as const;

export interface TableColumn<T = object> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T extends object> {
  columns: TableColumn<T>[];
  apiEndpoint: string;
  /** مفتاح المعرف في الصف (افتراضي _id) */
  rowIdKey?: keyof T | string;
  enableActions?: boolean;
  actions?: {
    onView?: (row: T) => void;
    onEdit?: (row: T) => void;
  };
  onAdd?: () => void;
  addLabel?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  enableDelete?: boolean;
  enableEdit?: boolean;
  enableView?: boolean;
  skeletonRows?: number;
  deleteTitle?: string;
  deleteDescription?: (row: T) => React.ReactNode;
  onDeleteConfirm?: (row: T) => Promise<void>;
  /** اسم حقل البحث في طلب الـ API (افتراضي q) */
  searchParamKey?: string;
  /** اسم معامل البحث في عنوان الصفحة (افتراضي search؛ استخدم q لمزامنة شريط الهيدر) */
  urlSearchKey?: string;
  limitOptions?: number[];
  showIdColumn?: boolean;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

type ListShape<T> = {
  items?: T[];
  data?: T[];
  page?: number;
  limit?: number;
  total?: number;
  meta?: PaginationMeta;
};

function getRowId<T extends object>(row: T, key: string): string {
  const v = (row as Record<string, unknown>)[key];
  return v != null ? String(v) : '';
}

function normalizeList<T>(raw: ListShape<T>, page: number, limit: number): { data: T[]; meta: PaginationMeta } {
  const items = raw.items ?? raw.data ?? [];
  const total = raw.total ?? items.length;
  const perPage = raw.limit ?? limit;
  const currentPage = raw.page ?? page;
  const lastPage = Math.max(1, Math.ceil(total / perPage) || 1);
  if (raw.meta) {
    return { data: items, meta: raw.meta };
  }
  return {
    data: items,
    meta: {
      current_page: currentPage,
      last_page: lastPage,
      per_page: perPage,
      total,
    },
  };
}

export function DataTable<T extends object>(props: DataTableProps<T>) {
  return (
    <React.Suspense fallback={<p className="text-sm text-slate-500">جاري التحميل…</p>}>
      <DataTableInner {...props} />
    </React.Suspense>
  );
}

function DataTableInner<T extends object>({
  columns,
  apiEndpoint,
  rowIdKey = '_id' as keyof T & string,
  enableActions = true,
  actions,
  onAdd,
  addLabel = 'إضافة جديد',
  searchPlaceholder = 'بحث…',
  emptyMessage = 'لا توجد بيانات',
  enableDelete = true,
  enableEdit = true,
  enableView = false,
  skeletonRows = 5,
  deleteTitle = 'تأكيد الحذف',
  deleteDescription,
  onDeleteConfirm,
  searchParamKey = 'q',
  urlSearchKey = 'search',
  limitOptions = [...LIMIT_OPTIONS],
  showIdColumn = false,
}: DataTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.max(1, Number(searchParams.get('limit')) || DEFAULT_LIMIT);
  const urlSearch = searchParams.get(urlSearchKey) ?? '';

  const [searchValue, setSearchValue] = React.useState(urlSearch);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<T | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    setSearchValue(urlSearch);
  }, [urlSearch]);

  const queryKey = React.useMemo(
    () => ['table-data', apiEndpoint, searchParams.toString()],
    [apiEndpoint, searchParams],
  );

  const { data: queryData, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const params: Record<string, string | number | boolean> = { page, limit };
      const search = searchParams.get(urlSearchKey);
      if (search) params[searchParamKey] = search;

      const response = await api.get<ListShape<T>>(apiEndpoint, { params });
      if (response.isError) throw new Error(response.message ?? 'تعذّر التحميل');
      return normalizeList(response as unknown as ListShape<T>, page, limit);
    },
    staleTime: 30_000,
  });

  const data = queryData?.data ?? [];
  const pagination = queryData?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: limit,
    total: 0,
  };

  const updateParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) params.delete(key);
        else params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleSearch = (value: string) => {
    setSearchValue(value);
    updateParams({ [urlSearchKey]: value || null, page: '1' });
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return;
    try {
      setIsDeleting(true);
      if (onDeleteConfirm) {
        await onDeleteConfirm(selectedRow);
      } else {
        const base = apiEndpoint.replace(/\?.*$/, '');
        const id = getRowId(selectedRow, String(rowIdKey));
        const res = await api.delete(`${base}/${id}`);
        if (res.isError) throw new Error(res.message);
        toast.success(res.message ?? 'تم الحذف بنجاح');
      }
      await queryClient.invalidateQueries({ queryKey: ['table-data', apiEndpoint] });
      setDeleteOpen(false);
      setSelectedRow(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'فشل الحذف');
    } finally {
      setIsDeleting(false);
    }
  };

  const allColumns = React.useMemo(() => {
    if (!showIdColumn) return columns;
    const idCol: TableColumn<T> = {
      key: String(rowIdKey),
      label: '#',
      width: 'w-28',
      render: (value) => (
        <span className="font-mono text-xs text-slate-500" dir="ltr">
          {String(value).slice(-6)}
        </span>
      ),
    };
    return [idCol, ...columns];
  }, [columns, rowIdKey, showIdColumn]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pe-10"
            dir="rtl"
          />
          {searchValue ? (
            <button
              type="button"
              className="absolute start-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              onClick={() => handleSearch('')}
              aria-label="مسح البحث"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        {onAdd ? (
          <Button type="button" onClick={onAdd} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-2xl bg-slate-50/80">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100/90 text-start text-xs font-semibold text-slate-500">
            <tr>
              {allColumns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3', col.width)}>
                  {col.label}
                </th>
              ))}
              {enableActions ? <th className="w-28 px-4 py-3 text-end">إجراءات</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i}>
                  {allColumns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-5 animate-pulse rounded bg-slate-100" />
                    </td>
                  ))}
                  {enableActions ? <td className="px-4 py-3" /> : null}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={allColumns.length + (enableActions ? 1 : 0)}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={getRowId(row, String(rowIdKey))} className="hover:bg-slate-50/80">
                  {allColumns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3', col.className)}>
                      {col.render
                        ? col.render((row as Record<string, unknown>)[col.key], row)
                        : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                  {enableActions ? (
                    <td className="px-4 py-3 text-end">
                      <div className="flex items-center justify-end gap-1">
                        {enableView && actions?.onView ? (
                          <Button type="button" variant="ghost" className="px-2 py-1" onClick={() => actions.onView?.(row)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        ) : null}
                        {enableEdit && actions?.onEdit ? (
                          <Button type="button" variant="ghost" className="px-2 py-1" onClick={() => actions.onEdit?.(row)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        ) : null}
                        {enableDelete ? (
                          <Button
                            type="button"
                            variant="ghost"
                            className="px-2 py-1 text-rose-600"
                            onClick={() => {
                              setSelectedRow(row);
                              setDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.total > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            عرض {(pagination.current_page - 1) * pagination.per_page + 1}–
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} من {pagination.total}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-slate-500">عدد العرض:</label>
            <select
              className="rounded-xl bg-white px-2 py-1.5 text-sm text-slate-800"
              value={String(pagination.per_page)}
              onChange={(e) => updateParams({ limit: e.target.value, page: '1' })}
            >
              {limitOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              disabled={pagination.current_page <= 1}
              onClick={() => updateParams({ page: String(pagination.current_page - 1) })}
            >
              السابق
            </Button>
            <span className="text-sm text-slate-600">
              {pagination.current_page} / {pagination.last_page}
            </span>
            <Button
              type="button"
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => updateParams({ page: String(pagination.current_page + 1) })}
            >
              التالي
            </Button>
          </div>
        </div>
      ) : null}

      <Modal
        open={deleteOpen}
        title={deleteTitle}
        onClose={() => !isDeleting && setDeleteOpen(false)}
        footer={
          <>
            <Button type="button" variant="secondary" disabled={isDeleting} onClick={() => setDeleteOpen(false)}>
              إلغاء
            </Button>
            <Button type="button" variant="danger" disabled={isDeleting} onClick={() => void handleDeleteConfirm()}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحذف…
                </>
              ) : (
                'حذف'
              )}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          {selectedRow && deleteDescription
            ? deleteDescription(selectedRow)
            : 'هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.'}
        </p>
      </Modal>
    </div>
  );
}

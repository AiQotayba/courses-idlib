'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categoryCreateSchema, categoryUpdateSchema } from '@repo/validation';
import type { z } from 'zod';
import type { Category } from '@repo/types';
import { Button, Input, Label, Modal } from '@repo/ui';
import { getAdminApi } from '@/lib/client-api';
import { useEffect, useState } from 'react';

type List = { items: Category[]; page: number; limit: number; total: number };
type CreateForm = z.infer<typeof categoryCreateSchema>;
type UpdateForm = z.infer<typeof categoryUpdateSchema>;

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const list = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const api = getAdminApi();
      return api.get<List>('/admin/categories?page=1&limit=100');
    },
  });

  const createForm = useForm<CreateForm>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: { name: '', slug: '', image: '' },
  });

  const editForm = useForm<UpdateForm>({
    resolver: zodResolver(categoryUpdateSchema),
  });

  useEffect(() => {
    if (editing) {
      editForm.reset({
        name: editing.name,
        slug: editing.slug,
        image: editing.image ?? '',
      });
    }
  }, [editing, editForm]);

  const createMut = useMutation({
    mutationFn: async (body: CreateForm) => {
      const api = getAdminApi();
      return api.post<Category>('/admin/categories', body);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setCreateOpen(false);
      createForm.reset({ name: '', slug: '', image: '' });
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateForm }) => {
      const api = getAdminApi();
      return api.put<Category>(`/admin/categories/${id}`, body);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setEditing(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const api = getAdminApi();
      await api.delete(`/admin/categories/${id}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setDeleting(null);
    },
  });

  if (list.isLoading) {
    return <p className="text-sm text-slate-600">جاري تحميل التصنيفات…</p>;
  }

  if (list.isError) {
    return <p className="text-sm text-rose-600">تعذّر تحميل التصنيفات.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">التصنيفات</h2>
          <p className="text-sm text-slate-600">إنشاء التصنيفات أو تعديلها أو حذفها.</p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          تصنيف جديد
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-start text-xs font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-3">الاسم</th>
              <th className="px-4 py-3">المعرّف (slug)</th>
              <th className="px-4 py-3 text-end">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.data?.items.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                <td className="px-4 py-3 text-slate-600" dir="ltr">
                  {c.slug}
                </td>
                <td className="px-4 py-3 text-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-2 py-1 text-xs"
                    onClick={() => setEditing(c)}
                  >
                    تعديل
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-2 py-1 text-xs text-rose-600 hover:text-rose-700"
                    onClick={() => setDeleting(c)}
                  >
                    حذف
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={createOpen}
        title="تصنيف جديد"
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={createForm.handleSubmit((v) => createMut.mutate(v))}
              disabled={createMut.isPending}
            >
              {createMut.isPending ? 'جاري الحفظ…' : 'إنشاء'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <Label htmlFor="c-name">الاسم</Label>
            <Input id="c-name" {...createForm.register('name')} />
          </div>
          <div>
            <Label htmlFor="c-slug">المعرّف (slug)</Label>
            <Input id="c-slug" dir="ltr" className="text-start" {...createForm.register('slug')} />
          </div>
          <div>
            <Label htmlFor="c-image">رابط الصورة (اختياري)</Label>
            <Input
              id="c-image"
              dir="ltr"
              className="text-start"
              {...createForm.register('image')}
            />
          </div>
          {createMut.isError ? (
            <p className="text-sm text-rose-600">
              تعذّر الإنشاء. تأكد أن المعرّف غير مكرر.
            </p>
          ) : null}
        </form>
      </Modal>

      <Modal
        open={!!editing}
        title="تعديل التصنيف"
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={editForm.handleSubmit((v) =>
                editing ? updateMut.mutate({ id: editing._id, body: v }) : undefined,
              )}
              disabled={updateMut.isPending}
            >
              {updateMut.isPending ? 'جاري الحفظ…' : 'حفظ'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <Label htmlFor="e-name">الاسم</Label>
            <Input id="e-name" {...editForm.register('name')} />
          </div>
          <div>
            <Label htmlFor="e-slug">المعرّف (slug)</Label>
            <Input id="e-slug" dir="ltr" className="text-start" {...editForm.register('slug')} />
          </div>
          <div>
            <Label htmlFor="e-image">رابط الصورة</Label>
            <Input id="e-image" dir="ltr" className="text-start" {...editForm.register('image')} />
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleting}
        title="حذف التصنيف"
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
          حذف <span className="font-semibold text-slate-900">{deleting?.name}</span>؟ لا يمكن
          التراجع إن لم تكن هناك دورات مرتبطة.
        </p>
      </Modal>
    </div>
  );
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseCreateSchema, courseUpdateSchema } from '@repo/validation';
import type { z } from 'zod';
import type { Category, Course } from '@repo/types';
import { Button, Input, Label, Modal } from '@repo/ui';
import { getAdminApi } from '@/lib/client-api';
import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

type List = { items: Course[]; page: number; limit: number; total: number };
type CreateForm = z.infer<typeof courseCreateSchema>;
type UpdateForm = z.infer<typeof courseUpdateSchema>;

export default function AdminCoursesPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState<Course | null>(null);

  const list = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: async () => {
      const api = getAdminApi();
      return api.get<List>('/admin/courses?page=1&limit=100');
    },
  });

  const categories = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const api = getAdminApi();
      return api.get<Category[]>('/categories');
    },
  });

  const createForm = useForm<CreateForm>({
    resolver: zodResolver(courseCreateSchema),
    defaultValues: {
      title: '',
      description: '',
      thumbnail: '',
      price: 0,
      categoryId: '',
      isPublished: false,
      featured: false,
    },
  });

  const editForm = useForm<UpdateForm>({
    resolver: zodResolver(courseUpdateSchema),
  });

  useEffect(() => {
    if (editing) {
      editForm.reset({
        title: editing.title,
        description: editing.description,
        thumbnail: editing.thumbnail ?? '',
        price: editing.price,
        categoryId: editing.categoryId,
        isPublished: editing.isPublished,
        featured: editing.featured ?? false,
      });
    }
  }, [editing, editForm]);

  const createMut = useMutation({
    mutationFn: async (body: CreateForm) => {
      const api = getAdminApi();
      return api.post<Course>('/admin/courses', body);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'courses'] });
      setCreateOpen(false);
      createForm.reset({
        title: '',
        description: '',
        thumbnail: '',
        price: 0,
        categoryId: '',
        isPublished: false,
        featured: false,
      });
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateForm }) => {
      const api = getAdminApi();
      return api.put<Course>(`/admin/courses/${id}`, body);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'courses'] });
      setEditing(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const api = getAdminApi();
      await api.delete(`/admin/courses/${id}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'courses'] });
      setDeleting(null);
    },
  });

  if (list.isLoading) return <p className="text-sm text-slate-600">جاري تحميل الدورات…</p>;
  if (list.isError) return <p className="text-sm text-rose-600">تعذّر تحميل الدورات.</p>;

  const catOptions = categories.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">الدورات</h2>
          <p className="text-sm text-slate-600">النشر والتسعير والتصنيف.</p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          دورة جديدة
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-start text-xs font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-3">العنوان</th>
              <th className="px-4 py-3">التصنيف</th>
              <th className="px-4 py-3">السعر</th>
              <th className="px-4 py-3">منشور</th>
              <th className="px-4 py-3">مميز</th>
              <th className="px-4 py-3 text-end">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.data?.items.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">{c.title}</td>
                <td className="px-4 py-3 text-slate-600">{c.category?.name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600" dir="ltr">
                  ${c.price}
                </td>
                <td className="px-4 py-3 text-slate-600">{c.isPublished ? 'نعم' : 'لا'}</td>
                <td className="px-4 py-3 text-slate-600">{c.featured ? 'نعم' : 'لا'}</td>
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
                    className="px-2 py-1 text-xs text-rose-600"
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
        title="دورة جديدة"
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
        <CourseFields form={createForm} categories={catOptions} />
      </Modal>

      <Modal
        open={!!editing}
        title="تعديل الدورة"
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
        <CourseFields form={editForm} categories={catOptions} />
      </Modal>

      <Modal
        open={!!deleting}
        title="حذف الدورة"
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
          حذف <span className="font-semibold text-slate-900">{deleting?.title}</span>؟
        </p>
      </Modal>
    </div>
  );
}

type CourseFormState = UseFormReturn<CreateForm> | UseFormReturn<UpdateForm>;

function CourseFields({
  form,
  categories,
}: {
  form: CourseFormState;
  categories: Category[];
}) {
  const { register } = form;
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <Label>عنوان الدورة</Label>
        <Input {...register('title')} />
      </div>
      <div>
        <Label>الوصف</Label>
        <textarea
          className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          {...register('description')}
        />
      </div>
      <div>
        <Label>رابط الصورة المصغّرة</Label>
        <Input dir="ltr" className="text-start" {...register('thumbnail')} />
      </div>
      <div>
        <Label>السعر</Label>
        <Input type="number" step="0.01" dir="ltr" className="text-start" {...register('price', { valueAsNumber: true })} />
      </div>
      <div>
        <Label>التصنيف</Label>
        <select
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
          {...register('categoryId')}
        >
          <option value="">اختر…</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" {...register('isPublished')} />
        منشور
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" {...register('featured')} />
        مميز (الصفحة الرئيسية)
      </label>
    </form>
  );
}

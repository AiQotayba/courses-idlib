'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseCreateSchema, courseUpdateSchema } from '@repo/validation';
import type { z } from 'zod';
import type { Category, Course } from '@repo/types';
import { Button, Input, Label, Modal } from '@repo/ui';
import { getAdminApi } from '@/lib/client-api';
import { DataTable, type TableColumn } from '@/components/table/data-table';
import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

const courseColumns: TableColumn<Course>[] = [
  { key: 'title', label: 'العنوان' },
  {
    key: 'category',
    label: 'التصنيف',
    render: (_, row) => row.category?.name ?? '—',
  },
  {
    key: 'price',
    label: 'السعر',
    render: (v) => (
      <span dir="ltr" className="font-medium">
        ${Number(v)}
      </span>
    ),
  },
  {
    key: 'isPublished',
    label: 'منشور',
    render: (v) => (v ? 'نعم' : 'لا'),
  },
  {
    key: 'featured',
    label: 'مميز',
    render: (v) => (v ? 'نعم' : 'لا'),
  },
];
type CreateForm = z.infer<typeof courseCreateSchema>;
type UpdateForm = z.infer<typeof courseUpdateSchema>;

export default function AdminCoursesPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const invalidateTable = () =>
    qc.invalidateQueries({ queryKey: ['table-data', '/admin/courses'] });

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
      await invalidateTable();
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
      await invalidateTable();
      setEditing(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const api = getAdminApi();
      await api.delete(`/admin/courses/${id}`);
    },
    onSuccess: async () => {
      await invalidateTable();
    },
  });

  const catOptions = categories.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">الدورات</h2>
        <p className="text-sm text-slate-600">النشر والتسعير والتصنيف.</p>
      </div>

      <DataTable<Course>
        apiEndpoint="/admin/courses"
        columns={courseColumns}
        searchPlaceholder="بحث بالعنوان…"
        onAdd={() => setCreateOpen(true)}
        addLabel="دورة جديدة"
        actions={{ onEdit: setEditing }}
        deleteDescription={(c) => (
          <>
            حذف <span className="font-semibold text-slate-900">{c.title}</span>؟
          </>
        )}
        onDeleteConfirm={async (c) => {
          await deleteMut.mutateAsync(c._id);
        }}
      />

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

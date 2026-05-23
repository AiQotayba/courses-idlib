'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categoryCreateSchema, categoryUpdateSchema } from '@repo/validation';
import type { z } from 'zod';
import type { Category } from '@repo/types';
import { Button, Input, Label, Modal } from '@repo/ui';
import { getAdminApi } from '@/lib/client-api';
import { DataTable, type TableColumn } from '@/components/table/data-table';
import { useEffect, useState } from 'react';

const categoryColumns: TableColumn<Category>[] = [
  { key: 'name', label: 'الاسم' },
  {
    key: 'slug',
    label: 'المعرّف (slug)',
    render: (v) => (
      <span dir="ltr" className="text-slate-600">
        {String(v)}
      </span>
    ),
  },
];
type CreateForm = z.infer<typeof categoryCreateSchema>;
type UpdateForm = z.infer<typeof categoryUpdateSchema>;

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const invalidateTable = () =>
    qc.invalidateQueries({ queryKey: ['table-data', '/admin/categories'] });

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
      await invalidateTable();
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
      await invalidateTable();
      setEditing(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const api = getAdminApi();
      await api.delete(`/admin/categories/${id}`);
    },
    onSuccess: async () => {
      await invalidateTable();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">التصنيفات</h2>
        <p className="text-sm text-slate-600">إنشاء التصنيفات أو تعديلها أو حذفها.</p>
      </div>

      <DataTable<Category>
        apiEndpoint="/admin/categories"
        columns={categoryColumns}
        searchPlaceholder="بحث بالاسم أو المعرّف…"
        onAdd={() => setCreateOpen(true)}
        addLabel="تصنيف جديد"
        actions={{ onEdit: setEditing }}
        deleteDescription={(c) => (
          <>
            حذف <span className="font-semibold text-slate-900">{c.name}</span>؟
          </>
        )}
        onDeleteConfirm={async (c) => {
          await deleteMut.mutateAsync(c._id);
        }}
      />

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

    </div>
  );
}

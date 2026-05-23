'use client';

import { Suspense, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { adminUserCreateSchema, adminUserUpdateSchema } from '@repo/validation';
import type { z } from 'zod';
import type { UserPublic } from '@repo/types';
import { Button, Input, Label, Modal } from '@repo/ui';
import { getAdminApi } from '@/lib/client-api';
import { DataTable, type TableColumn } from '@/components/table/data-table';

const userColumns: TableColumn<UserPublic>[] = [
  { key: 'fullName', label: 'الاسم' },
  {
    key: 'email',
    label: 'البريد',
    render: (v) => (
      <span dir="ltr" className="text-slate-600">
        {String(v)}
      </span>
    ),
  },
  {
    key: 'role',
    label: 'الدور',
    render: (v) => roleLabel(String(v)),
  },
];
type CreateForm = z.infer<typeof adminUserCreateSchema>;
type UpdateForm = z.infer<typeof adminUserUpdateSchema>;

function roleLabel(role: string): string {
  if (role === 'admin') return 'مسؤول';
  if (role === 'user') return 'مستخدم';
  return role;
}

function AdminUsersPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q')?.trim() ?? '';
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<UserPublic | null>(null);
  const invalidateTable = () =>
    qc.invalidateQueries({ queryKey: ['table-data', '/admin/users'] });

  const createForm = useForm<CreateForm>({
    resolver: zodResolver(adminUserCreateSchema),
    defaultValues: { fullName: '', email: '', password: '', role: 'user' },
  });

  const editForm = useForm<UpdateForm>({
    resolver: zodResolver(adminUserUpdateSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (editing) {
      editForm.reset({
        fullName: editing.fullName,
        email: editing.email,
        role: editing.role,
        password: '',
      });
    }
  }, [editing, editForm]);

  const createMut = useMutation({
    mutationFn: async (body: CreateForm) => {
      const api = getAdminApi();
      return api.post<UserPublic>('/admin/users', body);
    },
    onSuccess: async () => {
      await invalidateTable();
      setCreateOpen(false);
      createForm.reset({ fullName: '', email: '', password: '', role: 'user' });
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateForm }) => {
      const api = getAdminApi();
      const { password, ...rest } = body;
      const payload = password && password.length > 0 ? body : rest;
      return api.put<UserPublic>(`/admin/users/${id}`, payload);
    },
    onSuccess: async () => {
      await invalidateTable();
      setEditing(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const api = getAdminApi();
      await api.delete(`/admin/users/${id}`);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">المستخدمون</h2>
        <p className="text-sm text-slate-600">
          إدارة الأدوار والصلاحيات.
          {q ? (
            <>
              {' '}
              <span className="text-slate-500">نتائج البحث عن «{q}».</span>
            </>
          ) : null}
        </p>
      </div>

      <DataTable<UserPublic>
        apiEndpoint="/admin/users"
        columns={userColumns}
        urlSearchKey="q"
        searchPlaceholder="بحث بالاسم أو البريد…"
        onAdd={() => setCreateOpen(true)}
        addLabel="مستخدم جديد"
        actions={{ onEdit: setEditing }}
        deleteDescription={(u) => (
          <>
            إزالة <span className="font-semibold" dir="ltr">{u.email}</span>؟
          </>
        )}
        onDeleteConfirm={async (u) => {
          await deleteMut.mutateAsync(u._id);
          await invalidateTable();
        }}
      />

      <Modal
        open={createOpen}
        title="مستخدم جديد"
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
            <Label>الاسم</Label>
            <Input {...createForm.register('fullName')} />
          </div>
          <div>
            <Label>البريد الإلكتروني</Label>
            <Input
              type="email"
              dir="ltr"
              className="text-start"
              {...createForm.register('email')}
            />
          </div>
          <div>
            <Label>كلمة المرور</Label>
            <Input type="password" dir="ltr" className="text-start" {...createForm.register('password')} />
          </div>
          <div>
            <Label>الدور</Label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
              {...createForm.register('role')}
            >
              <option value="user">مستخدم</option>
              <option value="admin">مسؤول</option>
            </select>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!editing}
        title="تعديل المستخدم"
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
            <Label>الاسم</Label>
            <Input {...editForm.register('fullName')} />
          </div>
          <div>
            <Label>البريد الإلكتروني</Label>
            <Input type="email" dir="ltr" className="text-start" {...editForm.register('email')} />
          </div>
          <div>
            <Label>كلمة مرور جديدة (اختياري)</Label>
            <Input type="password" dir="ltr" className="text-start" {...editForm.register('password')} />
          </div>
          <div>
            <Label>الدور</Label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
              {...editForm.register('role')}
            >
              <option value="user">مستخدم</option>
              <option value="admin">مسؤول</option>
            </select>
          </div>
        </form>
      </Modal>

    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-600">جاري تحميل الصفحة…</p>}>
      <AdminUsersPageContent />
    </Suspense>
  );
}

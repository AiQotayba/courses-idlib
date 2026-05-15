'use client';

import { Suspense, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { adminUserCreateSchema, adminUserUpdateSchema } from '@repo/validation';
import type { z } from 'zod';
import type { UserPublic } from '@repo/types';
import { Button, Input, Label, Modal } from '@repo/ui';
import { getAdminApi } from '@/lib/client-api';

type List = { items: UserPublic[]; page: number; limit: number; total: number };
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
  const [deleting, setDeleting] = useState<UserPublic | null>(null);

  const list = useQuery({
    queryKey: ['admin', 'users', q],
    queryFn: async () => {
      const api = getAdminApi();
      const params = new URLSearchParams({ page: '1', limit: '100' });
      if (q) params.set('q', q);
      return api.get<List>(`/admin/users?${params}`);
    },
  });

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
      await qc.invalidateQueries({ queryKey: ['admin', 'users'] });
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
      await qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      setEditing(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const api = getAdminApi();
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      setDeleting(null);
    },
  });

  if (list.isLoading) return <p className="text-sm text-slate-600">جاري تحميل المستخدمين…</p>;
  if (list.isError) return <p className="text-sm text-rose-600">تعذّر تحميل المستخدمين.</p>;

  const items = list.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        <Button type="button" onClick={() => setCreateOpen(true)}>
          مستخدم جديد
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-start text-xs font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-3">الاسم</th>
              <th className="px-4 py-3">البريد</th>
              <th className="px-4 py-3">الدور</th>
              <th className="px-4 py-3 text-end">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                  لا توجد نتائج مطابقة.
                </td>
              </tr>
            ) : (
              items.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.fullName}</td>
                  <td className="px-4 py-3 text-slate-600" dir="ltr">
                    {u.email}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{roleLabel(u.role)}</td>
                  <td className="px-4 py-3 text-end">
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-2 py-1 text-xs"
                      onClick={() => setEditing(u)}
                    >
                      تعديل
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-2 py-1 text-xs text-rose-600"
                      onClick={() => setDeleting(u)}
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

      <Modal
        open={!!deleting}
        title="حذف المستخدم"
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
          إزالة <span className="font-semibold text-slate-900" dir="ltr">{deleting?.email}</span>؟
        </p>
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

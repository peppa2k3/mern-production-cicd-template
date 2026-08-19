import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Power } from 'lucide-react';
import SEO from '@/components/common/SEO';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import { Input, Field, Select } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/admin/DataTable';
import Pagination from '@/components/ui/Pagination';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useSetUserActive,
  useRoles,
} from '@/features/admin/hooks';
import { formatDate } from '@/lib/utils';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUsers({ page, limit: 10 });
  const { data: rolesData } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const setActive = useSetUserActive();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    reset(
      editing
        ? { name: editing.name, phone: editing.phone, role: editing.role?._id || editing.role }
        : { name: '', email: '', phone: '', password: '', role: '' }
    );
  }, [editing, dialogOpen, reset]);

  const onSubmit = (values) => {
    if (editing) {
      updateUser.mutate({ id: editing._id, payload: values }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createUser.mutate(values, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Người dùng',
      render: (u) => (
        <div>
          <p className="font-medium">{u.name}</p>
          <p className="text-xs text-ink-700">{u.email}</p>
        </div>
      ),
    },
    { key: 'role', label: 'Vai trò', render: (u) => <Badge variant="gold">{u.role?.displayName}</Badge> },
    {
      key: 'isActive',
      label: 'Trạng thái',
      render: (u) => <Badge variant={u.isActive ? 'teal' : 'hot'}>{u.isActive ? 'Hoạt động' : 'Chờ duyệt / Khoá'}</Badge>,
    },
    { key: 'createdAt', label: 'Ngày tạo', render: (u) => formatDate(u.createdAt) },
    {
      key: 'actions',
      label: '',
      render: (u) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            title={u.isActive ? 'Khoá tài khoản' : 'Kích hoạt tài khoản'}
            onClick={() => setActive.mutate({ id: u._id, isActive: !u.isActive })}
          >
            <Power size={15} className={u.isActive ? 'text-teal-400' : 'text-ink-700'} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { setEditing(u); setDialogOpen(true); }}>
            <Pencil size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.confirm(`Xoá tài khoản "${u.name}"?`) && deleteUser.mutate(u._id)}
          >
            <Trash2 size={15} className="text-hot-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <SEO title="Quản lý người dùng" />
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Người dùng</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus size={16} /> Thêm tài khoản
        </Button>
      </div>

      <p className="mt-1 text-sm text-ink-500">
        Tài khoản KOL tự đăng ký sẽ ở trạng thái "Chờ duyệt" — bấm nút nguồn điện để kích hoạt.
      </p>

      <div className="mt-6">
        <DataTable columns={columns} rows={data?.data} isLoading={isLoading} emptyLabel="Chưa có người dùng" />
      </div>

      {data?.meta && (
        <div className="mt-6">
          <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? 'Sửa người dùng' : 'Thêm người dùng'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Họ tên">
            <Input {...register('name', { required: true })} />
          </Field>
          {!editing && (
            <>
              <Field label="Email">
                <Input type="email" {...register('email', { required: true })} />
              </Field>
              <Field label="Mật khẩu">
                <Input type="password" {...register('password', { required: true })} />
              </Field>
            </>
          )}
          <Field label="Số điện thoại">
            <Input {...register('phone')} />
          </Field>
          <Field label="Vai trò">
            <Select {...register('role', { required: true })}>
              <option value="">-- Chọn vai trò --</option>
              {rolesData?.data?.map((r) => (
                <option key={r._id} value={r._id}>{r.displayName}</option>
              ))}
            </Select>
          </Field>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Huỷ</Button>
            <Button type="submit">{editing ? 'Cập nhật' : 'Tạo mới'}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

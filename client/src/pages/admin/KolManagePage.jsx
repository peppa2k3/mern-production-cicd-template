import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/common/SEO';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import { Input, Field, Select } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/admin/DataTable';
import { useKolAdminList, useCreateKol, useUpdateKol, useDeleteKol } from '@/features/kol/hooks';
import { useUsers } from '@/features/admin/hooks';

export default function KolManagePage() {
  const { data, isLoading } = useKolAdminList({ limit: 100 });
  const { data: usersData } = useUsers({ role: undefined, limit: 200 });
  const createKol = useCreateKol();
  const updateKol = useUpdateKol();
  const deleteKol = useDeleteKol();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const kolEligibleUsers = usersData?.data?.filter((u) => u.role?.name === 'kol') || [];

  useEffect(() => {
    reset(
      editing
        ? { displayName: editing.displayName, route: editing.route, bio: editing.bio, user: editing.user?._id || editing.user }
        : { displayName: '', route: '', bio: '', user: '' }
    );
  }, [editing, dialogOpen, reset]);

  const onSubmit = (values) => {
    if (editing) {
      const { user, ...payload } = values;
      updateKol.mutate({ id: editing._id, payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createKol.mutate(values, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const columns = [
    {
      key: 'displayName',
      label: 'KOL',
      render: (k) => (
        <div className="flex items-center gap-3">
          <img src={k.avatar || 'https://placehold.co/50x50'} alt="" className="h-9 w-9 rounded-full object-cover" />
          <div>
            <p className="font-medium">{k.displayName}</p>
            <p className="text-xs text-ink-700">{k.user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'route',
      label: 'Route',
      render: (k) => (
        <Link to={`/kol/${k.route}`} target="_blank" className="flex items-center gap-1 font-mono text-xs text-teal-400 hover:underline">
          /kol/{k.route} <ExternalLink size={11} />
        </Link>
      ),
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      render: (k) => <Badge variant={k.isActive ? 'teal' : 'neutral'}>{k.isActive ? 'Hoạt động' : 'Ẩn'}</Badge>,
    },
    {
      key: 'actions',
      label: '',
      render: (k) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditing(k); setDialogOpen(true); }}>
            <Pencil size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.confirm(`Xoá trang KOL "${k.displayName}"?`) && deleteKol.mutate(k._id)}
          >
            <Trash2 size={15} className="text-hot-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <SEO title="Quản lý KOL" />
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Quản lý KOL</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus size={16} /> Tạo trang KOL
        </Button>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={data?.data} isLoading={isLoading} emptyLabel="Chưa có KOL nào" />
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? 'Sửa trang KOL' : 'Tạo trang KOL'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!editing && (
            <Field label="Tài khoản KOL (đã có role KOL)">
              <Select {...register('user', { required: true })}>
                <option value="">-- Chọn tài khoản --</option>
                {kolEligibleUsers.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Tên hiển thị">
            <Input {...register('displayName', { required: true })} placeholder="Nguyễn Văn A" />
          </Field>
          <Field label="Route (URL trang cá nhân)" hint="Chỉ chữ thường, số, dấu gạch ngang">
            <Input {...register('route', { required: true })} placeholder="nguyen-van-a" disabled={!!editing} />
          </Field>
          <Field label="Giới thiệu ngắn">
            <Input {...register('bio')} placeholder="KOL chuyên review công nghệ..." />
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

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Lock } from 'lucide-react';
import SEO from '@/components/common/SEO';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import { Input, Field } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useRoles, usePermissionsList, useCreateRole, useUpdateRole, useDeleteRole } from '@/features/admin/hooks';

const permissionLabels = {
  'product:create': 'Tạo sản phẩm',
  'product:read': 'Xem sản phẩm',
  'product:update': 'Sửa sản phẩm',
  'product:delete': 'Xoá sản phẩm',
  'category:manage': 'Quản lý danh mục',
  'kol:manage': 'Quản lý KOL (mọi trang)',
  'kol:manage_own': 'Quản lý trang KOL của mình',
  'user:manage': 'Quản lý người dùng',
  'role:manage': 'Quản lý vai trò & phân quyền',
  'notification:send': 'Gửi thông báo',
  'notification:read_own': 'Xem thông báo cá nhân',
  'contact:manage': 'Quản lý liên hệ',
  'settings:manage': 'Quản lý cấu hình hệ thống',
  'dashboard:view': 'Xem bảng điều khiển',
};

export default function RolesPage() {
  const { data: rolesData, isLoading } = useRoles();
  const { data: permissionsData } = usePermissionsList();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedPerms, setSelectedPerms] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    reset(editing ? { name: editing.name, displayName: editing.displayName, description: editing.description } : { name: '', displayName: '', description: '' });
    setSelectedPerms(editing?.permissions || []);
  }, [editing, dialogOpen, reset]);

  const togglePerm = (perm) => {
    setSelectedPerms((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
  };

  const onSubmit = (values) => {
    const payload = { ...values, permissions: selectedPerms };
    if (editing) {
      updateRole.mutate({ id: editing._id, payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createRole.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  return (
    <div>
      <SEO title="Vai trò & Quyền" />
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Vai trò & Phân quyền</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus size={16} /> Thêm vai trò
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && <p className="text-ink-500">Đang tải...</p>}
        {rolesData?.data?.map((role) => (
          <Card key={role._id}>
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="flex items-center gap-1.5 font-display font-semibold">
                    {role.displayName}
                    {role.isSystem && <Lock size={12} className="text-ink-700" />}
                  </h3>
                  <p className="mt-0.5 font-mono text-xs text-ink-700">{role.name}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(role); setDialogOpen(true); }}>
                    <Pencil size={14} />
                  </Button>
                  {!role.isSystem && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.confirm(`Xoá vai trò "${role.displayName}"?`) && deleteRole.mutate(role._id)}
                    >
                      <Trash2 size={14} className="text-hot-500" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {role.permissions?.slice(0, 4).map((p) => (
                  <Badge key={p} variant="neutral">{permissionLabels[p] || p}</Badge>
                ))}
                {role.permissions?.length > 4 && (
                  <Badge variant="neutral">+{role.permissions.length - 4}</Badge>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? 'Sửa vai trò' : 'Thêm vai trò'} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!editing && (
            <Field label="Mã vai trò (không dấu, không khoảng trắng)">
              <Input {...register('name', { required: true })} placeholder="vd: content_editor" />
            </Field>
          )}
          <Field label="Tên hiển thị">
            <Input {...register('displayName', { required: true })} placeholder="VD: Biên tập viên" />
          </Field>
          <Field label="Mô tả">
            <Input {...register('description')} />
          </Field>

          <Field label="Quyền hạn">
            <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto rounded-lg border border-border p-3 sm:grid-cols-2">
              {permissionsData?.data?.map((perm) => (
                <label key={perm} className="flex items-center gap-2 text-sm text-ink-300">
                  <input
                    type="checkbox"
                    className="rounded accent-gold-500"
                    checked={selectedPerms.includes(perm)}
                    onChange={() => togglePerm(perm)}
                  />
                  {permissionLabels[perm] || perm}
                </label>
              ))}
            </div>
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

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import SEO from '@/components/common/SEO';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import { Input, Field, Select } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/admin/DataTable';
import {
  useCategoriesAdmin,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/features/categories/hooks';

export default function CategoriesPage() {
  const { data, isLoading } = useCategoriesAdmin({ limit: 100 });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    reset(
      editing
        ? { name: editing.name, description: editing.description, isActive: editing.isActive }
        : { name: '', description: '', isActive: true }
    );
  }, [editing, dialogOpen, reset]);

  const onSubmit = (values) => {
    const payload = { ...values, isActive: values.isActive === 'true' || values.isActive === true };
    if (editing) {
      updateCategory.mutate({ id: editing._id, payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createCategory.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const columns = [
    { key: 'name', label: 'Tên danh mục' },
    { key: 'slug', label: 'Slug', render: (c) => <span className="font-mono text-xs text-ink-500">{c.slug}</span> },
    {
      key: 'isActive',
      label: 'Trạng thái',
      render: (c) => <Badge variant={c.isActive ? 'teal' : 'neutral'}>{c.isActive ? 'Hoạt động' : 'Ẩn'}</Badge>,
    },
    {
      key: 'actions',
      label: '',
      render: (c) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setDialogOpen(true); }}>
            <Pencil size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.confirm(`Xoá danh mục "${c.name}"?`) && deleteCategory.mutate(c._id)}
          >
            <Trash2 size={15} className="text-hot-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <SEO title="Quản lý danh mục" />
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Danh mục</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus size={16} /> Thêm danh mục
        </Button>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={data?.data} isLoading={isLoading} emptyLabel="Chưa có danh mục nào" />
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? 'Sửa danh mục' : 'Thêm danh mục'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Tên danh mục">
            <Input {...register('name', { required: true })} placeholder="VD: Thời trang" />
          </Field>
          <Field label="Mô tả">
            <Input {...register('description')} placeholder="Mô tả ngắn gọn" />
          </Field>
          <Field label="Trạng thái">
            <Select {...register('isActive')}>
              <option value="true">Hoạt động</option>
              <option value="false">Ẩn</option>
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

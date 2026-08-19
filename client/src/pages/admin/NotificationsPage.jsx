import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send } from 'lucide-react';
import SEO from '@/components/common/SEO';
import Button from '@/components/ui/Button';
import { Input, Textarea, Select, Field } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import DataTable from '@/components/admin/DataTable';
import { useAdminNotifications, useSendNotification } from '@/features/admin/hooks';
import { useRoles } from '@/features/admin/hooks';
import { formatDate } from '@/lib/utils';

export default function NotificationsPage() {
  const { data, isLoading } = useAdminNotifications({ limit: 20 });
  const { data: rolesData } = useRoles();
  const sendNotification = useSendNotification();
  const [targetType, setTargetType] = useState('all');
  const { register, handleSubmit, reset } = useForm({ defaultValues: { targetType: 'all' } });

  const onSubmit = (values) => {
    const payload = { title: values.title, message: values.message, targetType: values.targetType };
    if (values.targetType === 'role') payload.targetRole = values.targetRole;
    sendNotification.mutate(payload, { onSuccess: () => reset({ targetType: 'all', title: '', message: '' }) });
  };

  const columns = [
    { key: 'title', label: 'Tiêu đề' },
    { key: 'message', label: 'Nội dung', render: (n) => <span className="line-clamp-1 max-w-xs">{n.message}</span> },
    {
      key: 'targetType',
      label: 'Đối tượng',
      render: (n) => ({ all: 'Tất cả', role: 'Theo vai trò', user: 'Cá nhân' }[n.targetType]),
    },
    { key: 'createdAt', label: 'Ngày gửi', render: (n) => formatDate(n.createdAt) },
  ];

  return (
    <div>
      <SEO title="Thông báo" />
      <h1 className="font-display text-2xl font-bold">Thông báo</h1>

      <Card className="mt-6">
        <CardBody>
          <h2 className="font-display font-semibold">Gửi thông báo mới</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <Field label="Tiêu đề">
              <Input {...register('title', { required: true })} placeholder="VD: Cập nhật chính sách hoa hồng" />
            </Field>
            <Field label="Nội dung">
              <Textarea {...register('message', { required: true })} placeholder="Nội dung thông báo..." />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Gửi đến">
                <Select {...register('targetType')} onChange={(e) => setTargetType(e.target.value)}>
                  <option value="all">Tất cả người dùng</option>
                  <option value="role">Theo vai trò</option>
                </Select>
              </Field>
              {targetType === 'role' && (
                <Field label="Chọn vai trò">
                  <Select {...register('targetRole', { required: targetType === 'role' })}>
                    {rolesData?.data?.map((r) => (
                      <option key={r._id} value={r._id}>{r.displayName}</option>
                    ))}
                  </Select>
                </Field>
              )}
            </div>
            <Button type="submit" disabled={sendNotification.isPending}>
              <Send size={16} /> {sendNotification.isPending ? 'Đang gửi...' : 'Gửi thông báo'}
            </Button>
          </form>
        </CardBody>
      </Card>

      <div className="mt-6">
        <h2 className="mb-3 font-display font-semibold">Lịch sử thông báo</h2>
        <DataTable columns={columns} rows={data?.data} isLoading={isLoading} emptyLabel="Chưa có thông báo nào" />
      </div>
    </div>
  );
}

import { useState } from 'react';
import SEO from '@/components/common/SEO';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import DataTable from '@/components/admin/DataTable';
import Pagination from '@/components/ui/Pagination';
import { Trash2 } from 'lucide-react';
import { useContactsAdmin, useUpdateContact, useDeleteContact } from '@/features/contact/hooks';
import { formatDate } from '@/lib/utils';

const statusLabel = { new: 'Mới', in_progress: 'Đang xử lý', resolved: 'Đã xử lý', closed: 'Đã đóng' };

export default function ContactsAdminPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useContactsAdmin({ page, limit: 10 });
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  const columns = [
    {
      key: 'name',
      label: 'Người gửi',
      render: (c) => (
        <div>
          <p className="font-medium">{c.name}</p>
          <p className="text-xs text-ink-700">{c.email}</p>
        </div>
      ),
    },
    { key: 'subject', label: 'Chủ đề' },
    { key: 'message', label: 'Nội dung', render: (c) => <span className="line-clamp-1 max-w-xs">{c.message}</span> },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (c) => (
        <Select
          value={c.status}
          onChange={(e) => updateContact.mutate({ id: c._id, payload: { status: e.target.value } })}
          className="w-40 py-1.5 text-xs"
        >
          {Object.entries(statusLabel).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      ),
    },
    { key: 'createdAt', label: 'Ngày gửi', render: (c) => formatDate(c.createdAt) },
    {
      key: 'actions',
      label: '',
      render: (c) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.confirm('Xoá liên hệ này?') && deleteContact.mutate(c._id)}
        >
          <Trash2 size={15} className="text-hot-500" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <SEO title="Liên hệ" />
      <h1 className="font-display text-2xl font-bold">Liên hệ từ khách hàng</h1>

      <div className="mt-6">
        <DataTable columns={columns} rows={data?.data} isLoading={isLoading} emptyLabel="Chưa có liên hệ nào" />
      </div>

      {data?.meta && (
        <div className="mt-6">
          <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}

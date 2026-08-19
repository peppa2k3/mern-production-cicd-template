import { useState } from 'react';
import { Plus, Pencil, Trash2, Flame, Star } from 'lucide-react';
import SEO from '@/components/common/SEO';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import DataTable from '@/components/admin/DataTable';
import ProductFormDialog from './ProductFormDialog';
import { useProductsAdmin, useDeleteProduct } from '@/features/products/hooks';
import { formatCurrency } from '@/lib/utils';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useProductsAdmin({ page, limit: 10 });
  const deleteProduct = useDeleteProduct();

  const handleDelete = (product) => {
    if (window.confirm(`Xoá sản phẩm "${product.name}"?`)) {
      deleteProduct.mutate(product._id);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Sản phẩm',
      render: (p) => (
        <div className="flex items-center gap-3">
          <img
            src={p.images?.[0]?.url || 'https://placehold.co/60x60'}
            alt=""
            className="h-10 w-10 rounded-lg object-cover"
          />
          <div>
            <p className="max-w-[220px] truncate font-medium text-ink-100">{p.name}</p>
            <p className="text-xs text-ink-700">{p.category?.name}</p>
          </div>
        </div>
      ),
    },
    { key: 'price', label: 'Giá', render: (p) => formatCurrency(p.salePrice || p.price) },
    {
      key: 'commission',
      label: 'Hoa hồng',
      render: (p) => (p.commissionType === 'percent' ? `${p.commissionValue}%` : formatCurrency(p.commissionValue)),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (p) => (
        <Badge variant={p.status === 'published' ? 'teal' : 'neutral'}>
          {{ draft: 'Nháp', published: 'Đã đăng', archived: 'Lưu trữ' }[p.status]}
        </Badge>
      ),
    },
    {
      key: 'flags',
      label: 'Gắn cờ',
      render: (p) => (
        <div className="flex gap-1">
          {p.isFeatured && <Badge variant="gold"><Star size={10} /></Badge>}
          {p.isHot && <Badge variant="hot"><Flame size={10} /></Badge>}
        </div>
      ),
    },
    { key: 'clickCount', label: 'Lượt click' },
    {
      key: 'actions',
      label: '',
      render: (p) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditing(p);
              setDialogOpen(true);
            }}
          >
            <Pencil size={15} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(p)}>
            <Trash2 size={15} className="text-hot-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <SEO title="Quản lý sản phẩm" />
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Sản phẩm</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus size={16} /> Thêm sản phẩm
        </Button>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={data?.data} isLoading={isLoading} emptyLabel="Chưa có sản phẩm nào" />
      </div>

      {data?.meta && (
        <div className="mt-6">
          <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />
        </div>
      )}

      <ProductFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} product={editing} />
    </div>
  );
}

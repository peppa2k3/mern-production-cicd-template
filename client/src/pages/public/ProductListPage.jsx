import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import SEO from '@/components/common/SEO';
import ProductGrid from '@/components/product/ProductGrid';
import Pagination from '@/components/ui/Pagination';
import { Input, Select } from '@/components/ui/Input';
import { useProductsPublic } from '@/features/products/hooks';
import { useCategoriesPublic } from '@/features/categories/hooks';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const page = Number(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';

  const { data, isLoading } = useProductsPublic({
    page,
    limit: 12,
    category: category || undefined,
    search: searchParams.get('search') || undefined,
    sort,
  });
  const { data: categoriesData } = useCategoriesPublic();

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="container-page py-10">
      <SEO title="Sản phẩm" description="Danh sách sản phẩm Affiliate với hoa hồng hấp dẫn." />

      <h1 className="font-display text-3xl font-bold">Sản phẩm</h1>
      <p className="mt-1 text-ink-500">Khám phá sản phẩm phù hợp để bắt đầu chia sẻ liên kết.</p>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateParam('search', search);
          }}
          className="relative flex-1"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-700" size={16} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-10"
          />
        </form>

        <Select
          value={category}
          onChange={(e) => updateParam('category', e.target.value)}
          className="md:w-56"
        >
          <option value="">Tất cả danh mục</option>
          {categoriesData?.data?.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="md:w-56">
          <option value="-createdAt">Mới nhất</option>
          <option value="price">Giá tăng dần</option>
          <option value="-price">Giá giảm dần</option>
          <option value="-clickCount">Phổ biến nhất</option>
        </Select>
      </div>

      <div className="mt-8">
        <ProductGrid products={data?.data} isLoading={isLoading} />
      </div>

      {data?.meta && (
        <div className="mt-10">
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onChange={(p) => updateParam('page', p)}
          />
        </div>
      )}
    </div>
  );
}

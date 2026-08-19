import ProductCard from './ProductCard';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { PackageSearch } from 'lucide-react';

export default function ProductGrid({ products, isLoading, kolRoute, columns = 4 }) {
  const colsClass = {
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns];

  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 gap-4 ${colsClass}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4.2] w-full" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Chưa có sản phẩm"
        description="Hiện chưa có sản phẩm nào phù hợp với bộ lọc của bạn."
      />
    );
  }

  return (
    <div className={`grid grid-cols-2 gap-4 ${colsClass}`}>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} kolRoute={kolRoute} />
      ))}
    </div>
  );
}

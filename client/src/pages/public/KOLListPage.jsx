import SEO from '@/components/common/SEO';
import KOLCard from '@/components/kol/KOLCard';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';
import { useKolPublicList } from '@/features/kol/hooks';

export default function KOLListPage() {
  const { data, isLoading } = useKolPublicList({ limit: 24 });

  return (
    <div className="container-page py-10">
      <SEO title="Danh sách KOL" description="Khám phá các KOL và cộng tác viên nổi bật." />
      <h1 className="font-display text-3xl font-bold">Cộng đồng KOL</h1>
      <p className="mt-1 text-ink-500">Ghé thăm trang cá nhân và khám phá sản phẩm được yêu thích.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-52 w-full" />)}

        {!isLoading && data?.data?.length === 0 && (
          <div className="col-span-full">
            <EmptyState icon={Users} title="Chưa có KOL nào" />
          </div>
        )}

        {data?.data?.map((kol) => (
          <KOLCard key={kol._id} kol={kol} />
        ))}
      </div>
    </div>
  );
}

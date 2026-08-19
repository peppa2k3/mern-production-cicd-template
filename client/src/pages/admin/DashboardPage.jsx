import { Package, Star, Users2, Eye, MousePointerClick } from 'lucide-react';
import SEO from '@/components/common/SEO';
import { Card, CardBody } from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { useDashboardSummary } from '@/features/admin/hooks';

const statCards = [
  { key: 'totalProducts', label: 'Tổng sản phẩm', icon: Package, color: 'text-teal-400 bg-teal-500/15' },
  { key: 'totalKOL', label: 'Tổng KOL', icon: Star, color: 'text-gold-400 bg-gold-500/15' },
  { key: 'totalStaff', label: 'Tổng nhân viên', icon: Users2, color: 'text-ink-300 bg-base-600' },
  { key: 'totalViews', label: 'Tổng lượt xem', icon: Eye, color: 'text-teal-400 bg-teal-500/15' },
  {
    key: 'totalAffiliateClicks',
    label: 'Tổng lượt click Affiliate',
    icon: MousePointerClick,
    color: 'text-gold-400 bg-gold-500/15',
  },
];

export default function DashboardPage() {
  const { data, isLoading } = useDashboardSummary();
  const summary = data?.data;

  return (
    <div>
      <SEO title="Tổng quan" />
      <h1 className="font-display text-2xl font-bold">Tổng quan hệ thống</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {statCards.map((s) => (
          <Card key={s.key}>
            <CardBody>
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon size={18} />
              </span>
              {isLoading ? (
                <Skeleton className="mt-3 h-7 w-16" />
              ) : (
                <p className="mt-3 font-mono text-2xl font-bold">
                  {(summary?.[s.key] ?? 0).toLocaleString('vi-VN')}
                </p>
              )}
              <p className="mt-1 text-xs text-ink-500">{s.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="font-display font-semibold">Top sản phẩm theo lượt click</h2>
            <div className="mt-4 space-y-3">
              {isLoading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              {summary?.topProducts?.map((p, i) => (
                <div key={p._id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-ink-700">#{i + 1}</span> {p.name}
                  </span>
                  <span className="font-mono text-gold-400">{p.clickCount.toLocaleString('vi-VN')}</span>
                </div>
              ))}
              {!isLoading && !summary?.topProducts?.length && (
                <p className="text-sm text-ink-700">Chưa có dữ liệu</p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-display font-semibold">Top KOL theo lượt click</h2>
            <div className="mt-4 space-y-3">
              {isLoading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              {summary?.topKOL?.map((k, i) => (
                <div key={k._id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-ink-700">#{i + 1}</span> {k.kol.displayName}
                  </span>
                  <span className="font-mono text-teal-400">{k.totalClicks.toLocaleString('vi-VN')}</span>
                </div>
              ))}
              {!isLoading && !summary?.topKOL?.length && (
                <p className="text-sm text-ink-700">Chưa có dữ liệu</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

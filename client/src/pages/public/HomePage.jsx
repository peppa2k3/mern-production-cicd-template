import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Star, ShieldCheck, Zap } from 'lucide-react';
import SEO from '@/components/common/SEO';
import Button from '@/components/ui/Button';
import ProductGrid from '@/components/product/ProductGrid';
import { useFeaturedProducts, useHotProducts } from '@/features/products/hooks';
import { useCategoriesPublic } from '@/features/categories/hooks';

const perks = [
  { icon: Zap, title: 'Hoa hồng hấp dẫn', desc: 'Mức hoa hồng cạnh tranh, minh bạch cho từng sản phẩm.' },
  { icon: ShieldCheck, title: 'Uy tín & minh bạch', desc: 'Theo dõi lượt click, doanh số theo thời gian thực.' },
  { icon: Star, title: 'Hỗ trợ KOL tận tâm', desc: 'Trang cá nhân riêng, dễ dàng chia sẻ tới người theo dõi.' },
];

export default function HomePage() {
  const { data: featured, isLoading: loadingFeatured } = useFeaturedProducts(8);
  const { data: hot, isLoading: loadingHot } = useHotProducts(8);
  const { data: categories } = useCategoriesPublic();

  return (
    <>
      <SEO
        title="Trang chủ"
        description="Nền tảng Affiliate & KOL - khám phá sản phẩm hoa hồng cao, đăng ký làm cộng tác viên ngay hôm nay."
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,166,35,0.12),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(0,217,192,0.10),transparent_45%)]" />
        <div className="container-page relative flex flex-col items-center gap-6 py-20 text-center md:py-28">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-mono font-semibold text-gold-400"
          >
            🎉 Nền tảng Affiliate & KOL hàng đầu
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="max-w-3xl font-display text-4xl font-extrabold leading-tight md:text-6xl"
          >
            Biến lượt theo dõi thành <span className="text-gradient-gold">hoa hồng thực</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl text-ink-400"
          >
            Chọn sản phẩm, chia sẻ liên kết, nhận hoa hồng minh bạch. Tham gia cộng đồng KOL và cộng
            tác viên đang phát triển mỗi ngày.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Button as={Link} to="/dang-ky-cong-tac-vien" size="lg">
              Đăng ký cộng tác viên <ArrowRight size={18} />
            </Button>
            <Button as={Link} to="/san-pham" variant="secondary" size="lg">
              Khám phá sản phẩm
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="container-page grid gap-5 py-14 sm:grid-cols-3">
        {perks.map((p) => (
          <div key={p.title} className="rounded-xl2 border border-border bg-base-800 p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400">
              <p.icon size={18} />
            </span>
            <h3 className="mt-4 font-display font-semibold">{p.title}</h3>
            <p className="mt-1.5 text-sm text-ink-500">{p.desc}</p>
          </div>
        ))}
      </section>

      {/* Categories */}
      {categories?.data?.length > 0 && (
        <section className="container-page py-6">
          <div className="flex flex-wrap gap-2">
            {categories.data.map((c) => (
              <Link
                key={c._id}
                to={`/san-pham?category=${c._id}`}
                className="rounded-full border border-border bg-base-800 px-4 py-2 text-sm text-ink-300 transition-colors hover:border-gold-500/50 hover:text-gold-400"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Hot products */}
      <section className="container-page py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            <Flame className="text-hot-500" size={22} /> Sản phẩm HOT
          </h2>
          <Link to="/san-pham" className="text-sm text-teal-400 hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <ProductGrid products={hot?.data} isLoading={loadingHot} />
      </section>

      {/* Featured products */}
      <section className="container-page py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            <Star className="text-gold-500" size={22} /> Nổi bật
          </h2>
          <Link to="/san-pham" className="text-sm text-teal-400 hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <ProductGrid products={featured?.data} isLoading={loadingFeatured} />
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-base-800/40">
        <div className="container-page flex flex-col items-center gap-4 py-16 text-center">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Sẵn sàng trở thành cộng tác viên?
          </h2>
          <p className="max-w-lg text-ink-500">
            Đăng ký miễn phí, chọn sản phẩm yêu thích và bắt đầu chia sẻ liên kết ngay hôm nay.
          </p>
          <Button as={Link} to="/dang-ky-cong-tac-vien" size="lg">
            Đăng ký ngay <ArrowRight size={18} />
          </Button>
        </div>
      </section>
    </>
  );
}

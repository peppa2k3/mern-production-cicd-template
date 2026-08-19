import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Eye, MousePointerClick, ChevronRight } from 'lucide-react';
import SEO from '@/components/common/SEO';
import { PageSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import CommissionBadge from '@/components/product/CommissionBadge';
import ProductGrid from '@/components/product/ProductGrid';
import { useProductBySlug, useTrackClick } from '@/features/products/hooks';
import { useKolByRoute, useTrackKolClick } from '@/features/kol/hooks';
import { formatCurrency } from '@/lib/utils';

export default function ProductDetailPage() {
  const { slug, route } = useParams();
  const [activeImage, setActiveImage] = useState(0);

  const { data, isLoading } = useProductBySlug(slug);
  const { data: kolData } = useKolByRoute(route); // only fetches if `route` present
  const trackClick = useTrackClick();
  const trackKolClick = useTrackKolClick();

  if (isLoading) return <PageSpinner />;
  if (!data?.data) return null;

  const { product, related } = data.data;
  const image = product.images?.[activeImage] || product.images?.[0];
  const kol = kolData?.data?.kol;

  const handleBuyClick = () => {
    trackClick.mutate(product._id);
    if (route && kol) trackKolClick.mutate({ kolId: kol._id, productId: product._id });
    window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container-page py-10">
      <SEO title={product.name} description={product.shortDescription} />

      <nav className="mb-6 flex items-center gap-1.5 text-sm text-ink-500">
        <Link to="/" className="hover:text-ink-100">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link to="/san-pham" className="hover:text-ink-100">Sản phẩm</Link>
        <ChevronRight size={14} />
        <span className="text-ink-300">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-xl2 border border-border bg-base-800">
            <img
              src={image?.url || 'https://placehold.co/700x700'}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                    i === activeImage ? 'border-gold-500' : 'border-border'
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {kol && (
            <p className="mb-2 text-sm text-ink-500">
              Được giới thiệu bởi{' '}
              <Link to={`/kol/${kol.route}`} className="font-medium text-gold-400 hover:underline">
                {kol.displayName}
              </Link>
            </p>
          )}

          <h1 className="font-display text-2xl font-bold md:text-3xl">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="font-mono text-3xl font-bold text-teal-400">
              {formatCurrency(product.salePrice || product.price)}
            </span>
            {product.salePrice && (
              <span className="font-mono text-lg text-ink-700 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
            <CommissionBadge product={product} size="md" />
          </div>

          {product.shortDescription && (
            <p className="mt-4 text-ink-400">{product.shortDescription}</p>
          )}

          <div className="mt-6 flex items-center gap-4 text-sm text-ink-500">
            <span className="flex items-center gap-1.5">
              <Eye size={15} /> {product.viewCount?.toLocaleString('vi-VN')} lượt xem
            </span>
            <span className="flex items-center gap-1.5">
              <MousePointerClick size={15} /> {product.clickCount?.toLocaleString('vi-VN')} lượt click
            </span>
          </div>

          <Button size="lg" className="mt-6 w-full sm:w-auto" onClick={handleBuyClick}>
            Mua ngay <ExternalLink size={18} />
          </Button>

          {product.description && (
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="font-display text-lg font-semibold">Mô tả sản phẩm</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-400">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {related?.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 font-display text-xl font-bold">Sản phẩm liên quan</h2>
          <ProductGrid products={related} kolRoute={route} />
        </section>
      )}
    </div>
  );
}

import { useParams } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Globe, Pin } from 'lucide-react';
import SEO from '@/components/common/SEO';
import { PageSpinner } from '@/components/ui/Spinner';
import ProductGrid from '@/components/product/ProductGrid';
import { useKolByRoute } from '@/features/kol/hooks';

export default function KOLPage() {
  const { route } = useParams();
  const { data, isLoading } = useKolByRoute(route);

  if (isLoading) return <PageSpinner />;
  if (!data?.data) return null;

  const { kol, pinnedProducts, products } = data.data;
  const socialIcons = { facebook: Facebook, instagram: Instagram, youtube: Youtube, website: Globe };

  return (
    <div>
      <SEO title={kol.displayName} description={kol.bio} />

      {/* Banner */}
      <div
        className="h-48 w-full bg-cover bg-center md:h-64"
        style={{
          backgroundImage: `url(${kol.banner || 'https://placehold.co/1600x400'})`,
        }}
      />

      <div className="container-page -mt-14 pb-14">
        <div className="flex flex-col items-center rounded-xl2 border border-border bg-base-800 p-8 text-center">
          <div className="-mt-20 h-28 w-28 overflow-hidden rounded-full border-4 border-base-800 bg-base-700 shadow-gold-glow">
            <img
              src={kol.avatar || 'https://placehold.co/200x200'}
              alt={kol.displayName}
              className="h-full w-full object-cover"
            />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">{kol.displayName}</h1>
          {kol.bio && <p className="mt-2 max-w-lg text-ink-500">{kol.bio}</p>}

          <div className="mt-4 flex gap-3">
            {Object.entries(kol.socials || {}).map(([key, url]) => {
              if (!url) return null;
              const Icon = socialIcons[key];
              if (!Icon) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-500 hover:border-gold-500 hover:text-gold-400"
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>

        {pinnedProducts?.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-5 flex items-center gap-2 font-display text-xl font-bold">
              <Pin size={18} className="text-gold-500" /> Sản phẩm nổi bật
            </h2>
            <ProductGrid products={pinnedProducts.map((kp) => kp.product)} kolRoute={route} />
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-5 font-display text-xl font-bold">Toàn bộ sản phẩm giới thiệu</h2>
          <ProductGrid products={products.map((kp) => kp.product)} kolRoute={route} />
        </section>
      </div>
    </div>
  );
}

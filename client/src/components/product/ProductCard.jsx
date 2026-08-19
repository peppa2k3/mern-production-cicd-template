import { Link } from 'react-router-dom';
import { Flame, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import CommissionBadge from './CommissionBadge';

// Single reusable product card used across HomePage, ProductListPage, and
// KOLPage so styling/behavior only needs to be maintained in one place.
export default function ProductCard({ product, kolRoute }) {
  const image = product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const href = kolRoute
    ? `/kol/${kolRoute}/san-pham/${product.slug}`
    : `/san-pham/${product.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-xl2 border border-border bg-base-800 transition-colors hover:border-gold-500/40"
    >
      <Link to={href} className="relative block aspect-square overflow-hidden bg-base-700">
        <img
          src={image?.url || 'https://placehold.co/500x500'}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {product.isHot && (
            <Badge variant="hot">
              <Flame size={11} /> HOT
            </Badge>
          )}
        </div>
        <div className="absolute right-2 top-2">
          <CommissionBadge product={product} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link to={href}>
          <h3 className="line-clamp-2 min-h-[2.5rem] font-display text-sm font-semibold text-ink-100 transition-colors group-hover:text-gold-400">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-base font-bold text-teal-400">
              {formatCurrency(product.salePrice || product.price)}
            </span>
            {product.salePrice && (
              <span className="font-mono text-xs text-ink-700 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>

        {typeof product.viewCount === 'number' && (
          <div className="flex items-center gap-1 text-xs text-ink-700">
            <Eye size={12} /> {product.viewCount.toLocaleString('vi-VN')} lượt xem
          </div>
        )}
      </div>
    </motion.div>
  );
}

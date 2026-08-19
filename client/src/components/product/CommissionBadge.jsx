import { Coins } from 'lucide-react';
import { formatCommission } from '@/lib/utils';

// Signature element: a glowing gold "coin" chip used consistently on every
// product surface (card, detail page, KOL page) so "hoa hồng" (commission)
// reads as this platform's visual signature at a glance.
export default function CommissionBadge({ product, size = 'sm' }) {
  const sizes = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border border-gold-500/40 bg-gradient-to-r from-gold-500/20 to-gold-600/10 font-mono font-semibold text-gold-400 shadow-gold-glow ${sizes[size]}`}
    >
      <Coins size={size === 'sm' ? 12 : 14} />
      {formatCommission(product)}
    </span>
  );
}

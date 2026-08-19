import { cn } from '@/lib/utils';

const variants = {
  gold: 'bg-gold-500/15 text-gold-400 border border-gold-500/30',
  teal: 'bg-teal-500/15 text-teal-400 border border-teal-500/30',
  hot: 'bg-hot-500/15 text-hot-500 border border-hot-500/30',
  neutral: 'bg-base-600 text-ink-300 border border-border',
};

export default function Badge({ variant = 'neutral', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold font-mono tracking-wide',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

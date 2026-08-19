import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-gold-500 text-base-900 hover:bg-gold-400 shadow-gold-glow',
  secondary: 'bg-base-600 text-ink-100 hover:bg-base-500 border border-border',
  teal: 'bg-teal-500 text-base-900 hover:bg-teal-400',
  ghost: 'bg-transparent text-ink-100 hover:bg-base-700',
  danger: 'bg-hot-500 text-white hover:bg-hot-600',
  outline: 'bg-transparent border border-border text-ink-100 hover:border-gold-500',
};

const sizes = {
  sm: 'text-sm px-3 py-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 rounded-lg',
  lg: 'text-base px-6 py-3 rounded-xl',
  icon: 'p-2 rounded-lg',
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

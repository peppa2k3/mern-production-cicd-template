import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border bg-base-700 px-3.5 py-2.5 text-sm text-ink-100 placeholder:text-ink-700',
        'border-border focus:border-teal-500 focus:outline-none transition-colors',
        error && 'border-hot-500 focus:border-hot-500',
        className
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ className, error, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border bg-base-700 px-3.5 py-2.5 text-sm text-ink-100 placeholder:text-ink-700',
        'border-border focus:border-teal-500 focus:outline-none transition-colors min-h-[120px] resize-y',
        error && 'border-hot-500 focus:border-hot-500',
        className
      )}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className, error, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-lg border bg-base-700 px-3.5 py-2.5 text-sm text-ink-100',
        'border-border focus:border-teal-500 focus:outline-none transition-colors',
        error && 'border-hot-500',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-300">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-ink-700">{hint}</p>}
      {error && <p className="text-xs text-hot-500">{error}</p>}
    </div>
  );
}

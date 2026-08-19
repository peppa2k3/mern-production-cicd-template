import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Spinner({ className, size = 20 }) {
  return <Loader2 size={size} className={cn('animate-spin text-teal-500', className)} />;
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center">
      <Spinner size={32} />
    </div>
  );
}

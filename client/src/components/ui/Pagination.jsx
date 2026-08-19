import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Trang trước"
      >
        <ChevronLeft size={18} />
      </Button>

      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-ink-700">…</span>}
          <button
            onClick={() => onChange(p)}
            className={
              p === page
                ? 'h-9 w-9 rounded-lg bg-gold-500 font-mono text-sm font-semibold text-base-900'
                : 'h-9 w-9 rounded-lg font-mono text-sm text-ink-300 hover:bg-base-700'
            }
          >
            {p}
          </button>
        </span>
      ))}

      <Button
        variant="ghost"
        size="icon"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Trang sau"
      >
        <ChevronRight size={18} />
      </Button>
    </div>
  );
}

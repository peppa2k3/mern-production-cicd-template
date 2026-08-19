import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Inbox } from 'lucide-react';

// Minimal, reusable admin table: columns = [{ key, label, render? }]
export default function DataTable({ columns, rows, isLoading, emptyLabel = 'Không có dữ liệu' }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return <EmptyState icon={Inbox} title={emptyLabel} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl2 border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-base-700 text-xs uppercase tracking-wide text-ink-500">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row._id} className="bg-base-800 hover:bg-base-700/50">
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-3">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

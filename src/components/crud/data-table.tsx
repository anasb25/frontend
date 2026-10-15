import { cn } from '@/lib/utils';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
  getRowKey: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = 'No records found.',
  className,
  getRowKey,
}: DataTableProps<T>) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--shell-border)] px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-[var(--shell-border)] text-left">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'pb-3 pr-4 font-semibold text-muted-foreground',
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={getRowKey(row)}
              className="border-b border-[var(--shell-border)] last:border-0"
            >
              {columns.map((column) => (
                <td key={column.key} className={cn('py-4 pr-4', column.className)}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Eye } from 'lucide-react';
import { CrudPanel } from '@/components/crud/crud-panel';
import { DataTable } from '@/components/crud/data-table';
import { TablePagination } from '@/components/crud/table-pagination';
import { TableSearch } from '@/components/crud/table-search';
import { useAuth } from '@/context/auth-context';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  api,
  ApiError,
  DEFAULT_PAGE_SIZE,
  JobCard,
  PaginationMeta,
} from '@/lib/api';
import { cn } from '@/lib/utils';

const emptyMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

export function JobCardsPanel() {
  const { token } = useAuth();
  const [items, setItems] = useState<JobCard[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setPage(1);
  }, [search]);

  const loadData = useCallback(
    async (signal?: AbortSignal) => {
      if (!token) return;
      setIsLoading(true);
      setError('');
      try {
        const result = await api.getJobCards(token, {
          page,
          limit: DEFAULT_PAGE_SIZE,
          search: search || undefined,
        });
        if (signal?.aborted) return;
        setItems(result.data);
        setMeta(result.meta);
      } catch (err) {
        if (signal?.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load job cards');
      } finally {
        if (!signal?.aborted) setIsLoading(false);
      }
    },
    [token, page, search],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  const columns = useMemo(
    () => [
      {
        key: 'customer',
        header: 'Customer',
        render: (row: JobCard) => {
          const inv = row.estimate.investigation;
          return (
            <div>
              <p className="font-medium">{inv.customer.name}</p>
              <p className="text-xs text-muted-foreground">{inv.plateNo}</p>
            </div>
          );
        },
      },
      {
        key: 'parts',
        header: 'Parts',
        render: (row: JobCard) => {
          const done = row.lines.filter((line) => line.isCompleted).length;
          return (
            <span className="text-sm">
              {done}/{row.lines.length} complete
            </span>
          );
        },
      },
      {
        key: 'status',
        header: 'Status',
        render: (row: JobCard) => (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
              row.status === 'completed'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
            )}
          >
            {row.status.replace('_', ' ')}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'w-28 text-right',
        render: (row: JobCard) => (
          <Link
            href={`/dashboard/job-cards/${row.id}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--shell-border)] px-2.5 text-xs font-medium transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Eye className="h-3.5 w-3.5" />
            Open
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <CrudPanel
      title="Job Cards"
      description="Step 3 — Work from estimates with costing and part completion"
      icon={<ClipboardList className="h-5 w-5 text-primary" />}
      isLoading={isLoading}
      error={error}
      onRefresh={() => loadData()}
      toolbar={
        <TableSearch
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search customer, plate, brand..."
        />
      }
    >
      <DataTable
        columns={columns}
        data={items}
        getRowKey={(row) => row.id}
        emptyMessage="No job cards yet. Open a job card from a saved estimate."
      />
      <TablePagination meta={meta} onPageChange={setPage} disabled={isLoading} />
    </CrudPanel>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calculator, Eye } from 'lucide-react';
import { OpenJobCardLink } from '@/components/job-cards/open-job-card-link';
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
  Estimate,
  PaginationMeta,
} from '@/lib/api';

const emptyMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

function formatInvestigationId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export function EstimatesPanel() {
  const { token } = useAuth();
  const [items, setItems] = useState<Estimate[]>([]);
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
        const result = await api.getEstimates(token, {
          page,
          limit: DEFAULT_PAGE_SIZE,
          search: search || undefined,
        });
        if (signal?.aborted) return;
        setItems(result.data);
        setMeta(result.meta);
      } catch (err) {
        if (signal?.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load estimates');
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
        key: 'investigation',
        header: 'Investigation',
        render: (row: Estimate) => (
          <span className="font-mono text-xs font-semibold uppercase">
            {formatInvestigationId(row.investigationId)}
          </span>
        ),
      },
      {
        key: 'customer',
        header: 'Customer',
        render: (row: Estimate) => (
          <div>
            <p className="font-medium">{row.investigation.customer.name}</p>
            <p className="text-xs text-muted-foreground">{row.investigation.plateNo}</p>
          </div>
        ),
      },
      {
        key: 'delivery',
        header: 'Delivery',
        render: (row: Estimate) => (
          <span>{row.estimatedDeliveryDays} day{row.estimatedDeliveryDays === 1 ? '' : 's'}</span>
        ),
      },
      {
        key: 'category',
        header: 'Job Category',
        render: (row: Estimate) => (
          <span className="capitalize">{row.jobCategory}</span>
        ),
      },
      {
        key: 'lumpSum',
        header: 'Lump Sum',
        render: (row: Estimate) =>
          row.jobCategory === 'insurance' && row.lumpSumAmount != null ? (
            <span className="tabular-nums font-medium">
              {Number(row.lumpSumAmount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        key: 'parts',
        header: 'Parts',
        render: (row: Estimate) => (
          <span className="text-muted-foreground">{row.spareParts.length}</span>
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'w-36 text-right',
        render: (row: Estimate) => (
          <div className="flex items-center justify-end gap-1">
            <Link
              href={`/dashboard/estimates/${row.id}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              aria-label="View estimate"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <OpenJobCardLink estimateId={row.id} size="sm" compact />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <CrudPanel
      title="Estimates"
      description="Job estimates linked to completed investigations."
      icon={<Calculator className="h-5 w-5 text-primary" />}
      isLoading={isLoading}
      error={error}
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
        emptyMessage="No estimates yet. Complete an investigation to create one."
      />
      <TablePagination meta={meta} onPageChange={setPage} />
    </CrudPanel>
  );
}

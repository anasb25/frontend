'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Eye, Plus } from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { ColorSwatch } from '@/components/ui/color-swatch';
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
  Investigation,
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

export function InvestigationsPanel() {
  const { token } = useAuth();
  const [items, setItems] = useState<Investigation[]>([]);
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
        const result = await api.getInvestigations(token, {
          page,
          limit: DEFAULT_PAGE_SIZE,
          search: search || undefined,
        });
        if (signal?.aborted) return;
        setItems(result.data);
        setMeta(result.meta);
      } catch (err) {
        if (signal?.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load investigations');
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
        render: (row: Investigation) => (
          <div>
            <p className="font-medium">{row.customer?.name ?? '—'}</p>
            <p className="text-xs text-muted-foreground">{row.customer?.mobileNumber}</p>
          </div>
        ),
      },
      {
        key: 'vehicle',
        header: 'Vehicle',
        render: (row: Investigation) => (
          <div className="flex items-center gap-2.5">
            <BrandLogo
              name={row.brand?.name ?? 'Brand'}
              logoUrl={row.brand?.logoUrl}
              size="sm"
            />
            <div>
              <p className="font-medium">
                {row.brand?.name} {row.model?.name}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                {row.color && (
                  <ColorSwatch hexCode={row.color.hexCode} name={row.color.name} size="sm" />
                )}
                {row.color?.name} · {row.makeYear}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'plate',
        header: 'Plate',
        render: (row: Investigation) => row.plateNo,
      },
      {
        key: 'damage',
        header: 'Damage',
        render: (row: Investigation) =>
          row.damagedZones?.length
            ? `${row.damagedZones.length} zone${row.damagedZones.length === 1 ? '' : 's'}`
            : 'None',
      },
      {
        key: 'actions',
        header: '',
        className: 'w-24 text-right',
        render: (row: Investigation) => (
          <Link
            href={`/dashboard/investigations/${row.id}`}
            className="inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <Eye className="h-4 w-4" />
            View
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <CrudPanel
      title="Investigations"
      description="Vehicle intake investigations with customer and damage details"
      icon={<ClipboardList className="h-5 w-5 text-primary" />}
      isLoading={isLoading}
      error={error}
      onRefresh={() => loadData()}
      toolbar={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TableSearch
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search customer, plate, chassis, brand..."
          />
          <Link
            href="/dashboard/investigations/new"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl brand-gradient px-4 text-sm font-semibold text-white shadow-md transition-all hover:brightness-105"
          >
            <Plus className="h-4 w-4" />
            New Investigation
          </Link>
        </div>
      }
    >
      <DataTable
        columns={columns}
        data={items}
        getRowKey={(row) => row.id}
        emptyMessage={
          search
            ? 'No investigations match your search.'
            : 'No investigations yet. Start a new investigation.'
        }
      />
      <TablePagination meta={meta} onPageChange={setPage} disabled={isLoading} />
    </CrudPanel>
  );
}

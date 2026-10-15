'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Car } from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { CrudPanel } from '@/components/crud/crud-panel';
import { DataTable } from '@/components/crud/data-table';
import { StatusBadge } from '@/components/crud/status-badge';
import { TableActions } from '@/components/crud/table-actions';
import { TablePagination } from '@/components/crud/table-pagination';
import { TableSearch } from '@/components/crud/table-search';
import { VehicleBrandFormDialog } from '@/components/vehicle-brands/vehicle-brand-form-dialog';
import { useAuth } from '@/context/auth-context';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  api,
  ApiError,
  CreateVehicleBrandPayload,
  DEFAULT_PAGE_SIZE,
  PaginationMeta,
  VehicleBrand,
} from '@/lib/api';

const emptyMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

export function VehicleBrandsPanel() {
  const { token } = useAuth();
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VehicleBrand | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const loadData = useCallback(
    async (signal?: AbortSignal) => {
      if (!token) return;

      setIsLoading(true);
      setError('');

      try {
        const result = await api.getVehicleBrands(token, {
          page,
          limit: DEFAULT_PAGE_SIZE,
          search: search || undefined,
        });
        if (signal?.aborted) return;
        setBrands(result.data);
        setMeta(result.meta);
      } catch (err) {
        if (signal?.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load vehicle brands');
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

  const handleSubmit = async (payload: CreateVehicleBrandPayload) => {
    if (!token) return;

    if (editing) {
      await api.updateVehicleBrand(token, editing.id, payload);
      await loadData();
      return;
    }

    await api.createVehicleBrand(token, payload);
    if (page === 1) {
      await loadData();
    } else {
      setPage(1);
    }
  };

  const handleDelete = useCallback(
    async (brand: VehicleBrand) => {
      if (!token) return;
      if (!window.confirm(`Delete brand "${brand.name}"?`)) return;

      setDeletingId(brand.id);
      setError('');

      try {
        await api.deleteVehicleBrand(token, brand.id);
        if (brands.length === 1 && page > 1) {
          setPage((current) => current - 1);
        } else {
          await loadData();
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to delete vehicle brand');
      } finally {
        setDeletingId(null);
      }
    },
    [token, brands.length, page, loadData],
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Brand Name',
        render: (row: VehicleBrand) => (
          <div className="flex items-center gap-3">
            <BrandLogo name={row.name} logoUrl={row.logoUrl} size="lg" />
            <span className="font-medium">{row.name}</span>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (row: VehicleBrand) => <StatusBadge status={row.status} />,
      },
      {
        key: 'actions',
        header: '',
        className: 'w-24 text-right',
        render: (row: VehicleBrand) => (
          <TableActions
            onEdit={() => {
              setEditing(row);
              setDialogOpen(true);
            }}
            onDelete={() => handleDelete(row)}
            isDeleting={deletingId === row.id}
          />
        ),
      },
    ],
    [deletingId, handleDelete],
  );

  return (
    <>
      <CrudPanel
        title="Vehicle Brands"
        description="Manage vehicle manufacturers and their availability status"
        icon={<Car className="h-5 w-5 text-primary" />}
        isLoading={isLoading}
        error={error}
        onRefresh={() => loadData()}
        onAdd={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
        addLabel="Add Brand"
        toolbar={
          <TableSearch
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search brand name..."
          />
        }
      >
        <DataTable
          columns={columns}
          data={brands}
          getRowKey={(row) => row.id}
          emptyMessage={
            search
              ? 'No brands match your search.'
              : 'No vehicle brands yet. Add your first brand to continue.'
          }
        />
        <TablePagination meta={meta} onPageChange={setPage} disabled={isLoading} />
      </CrudPanel>

      <VehicleBrandFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        editing={editing}
        onSubmit={handleSubmit}
      />
    </>
  );
}

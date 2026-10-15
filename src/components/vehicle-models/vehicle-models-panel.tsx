'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layers } from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { CrudPanel } from '@/components/crud/crud-panel';
import { DataTable } from '@/components/crud/data-table';
import { StatusBadge } from '@/components/crud/status-badge';
import { TableActions } from '@/components/crud/table-actions';
import { TablePagination } from '@/components/crud/table-pagination';
import { TableSearch } from '@/components/crud/table-search';
import { VehicleModelFormDialog } from '@/components/vehicle-models/vehicle-model-form-dialog';
import { useAuth } from '@/context/auth-context';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  api,
  ApiError,
  CreateVehicleModelPayload,
  DEFAULT_PAGE_SIZE,
  PaginationMeta,
  VehicleBrand,
  VehicleModel,
} from '@/lib/api';

const emptyMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

export function VehicleModelsPanel() {
  const { token } = useAuth();
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VehicleModel | null>(null);
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
        const [modelsResult, brandsResult] = await Promise.all([
          api.getVehicleModels(token, {
            page,
            limit: DEFAULT_PAGE_SIZE,
            search: search || undefined,
          }),
          api.getVehicleBrands(token, { page: 1, limit: 100 }),
        ]);
        if (signal?.aborted) return;
        setModels(modelsResult.data);
        setMeta(modelsResult.meta);
        setBrands(brandsResult.data);
      } catch (err) {
        if (signal?.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load vehicle models');
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

  const handleSubmit = async (payload: CreateVehicleModelPayload) => {
    if (!token) return;

    if (editing) {
      await api.updateVehicleModel(token, editing.id, payload);
      await loadData();
      return;
    }

    await api.createVehicleModel(token, payload);
    if (page === 1) {
      await loadData();
    } else {
      setPage(1);
    }
  };

  const handleDelete = useCallback(
    async (model: VehicleModel) => {
      if (!token) return;
      if (!window.confirm(`Delete model "${model.name}"?`)) return;

      setDeletingId(model.id);
      setError('');

      try {
        await api.deleteVehicleModel(token, model.id);
        if (models.length === 1 && page > 1) {
          setPage((current) => current - 1);
        } else {
          await loadData();
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to delete vehicle model');
      } finally {
        setDeletingId(null);
      }
    },
    [token, models.length, page, loadData],
  );

  const columns = useMemo(
    () => [
      {
        key: 'brand',
        header: 'Brand',
        render: (row: VehicleModel) => (
          <div className="flex items-center gap-2.5">
            <BrandLogo
              name={row.brand?.name ?? 'Brand'}
              logoUrl={row.brand?.logoUrl}
              size="md"
            />
            <span className="font-medium">{row.brand?.name ?? '—'}</span>
            {row.brand?.status && <StatusBadge status={row.brand.status} />}
          </div>
        ),
      },
      {
        key: 'name',
        header: 'Model Name',
        render: (row: VehicleModel) => row.name,
      },
      {
        key: 'actions',
        header: '',
        className: 'w-24 text-right',
        render: (row: VehicleModel) => (
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
        title="Vehicle Models"
        description="Define vehicle models linked to their brands"
        icon={<Layers className="h-5 w-5 text-primary" />}
        isLoading={isLoading}
        error={error}
        onRefresh={() => loadData()}
        onAdd={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
        addLabel="Add Model"
        toolbar={
          <TableSearch
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search model or brand..."
          />
        }
      >
        <DataTable
          columns={columns}
          data={models}
          getRowKey={(row) => row.id}
          emptyMessage={
            search
              ? 'No models match your search.'
              : 'No vehicle models yet. Add brands first, then create models.'
          }
        />
        <TablePagination meta={meta} onPageChange={setPage} disabled={isLoading} />
      </CrudPanel>

      <VehicleModelFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        brands={brands}
        editing={editing}
        onSubmit={handleSubmit}
      />
    </>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Palette } from 'lucide-react';
import { ColorSwatch } from '@/components/ui/color-swatch';
import { CrudPanel } from '@/components/crud/crud-panel';
import { DataTable } from '@/components/crud/data-table';
import { TableActions } from '@/components/crud/table-actions';
import { TablePagination } from '@/components/crud/table-pagination';
import { TableSearch } from '@/components/crud/table-search';
import { VehicleColorFormDialog } from '@/components/vehicle-colors/vehicle-color-form-dialog';
import { useAuth } from '@/context/auth-context';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  api,
  ApiError,
  CreateVehicleColorPayload,
  DEFAULT_PAGE_SIZE,
  PaginationMeta,
  VehicleColor,
} from '@/lib/api';

const emptyMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

export function VehicleColorsPanel() {
  const { token } = useAuth();
  const [colors, setColors] = useState<VehicleColor[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VehicleColor | null>(null);
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
        const result = await api.getVehicleColors(token, {
          page,
          limit: DEFAULT_PAGE_SIZE,
          search: search || undefined,
        });
        if (signal?.aborted) return;
        setColors(result.data);
        setMeta(result.meta);
      } catch (err) {
        if (signal?.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load vehicle colors');
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

  const handleSubmit = async (payload: CreateVehicleColorPayload) => {
    if (!token) return;

    if (editing) {
      await api.updateVehicleColor(token, editing.id, payload);
      await loadData();
      return;
    }

    await api.createVehicleColor(token, payload);
    if (page === 1) {
      await loadData();
    } else {
      setPage(1);
    }
  };

  const handleDelete = useCallback(
    async (color: VehicleColor) => {
      if (!token) return;
      if (!window.confirm(`Delete color "${color.name}"?`)) return;

      setDeletingId(color.id);
      setError('');

      try {
        await api.deleteVehicleColor(token, color.id);
        if (colors.length === 1 && page > 1) {
          setPage((current) => current - 1);
        } else {
          await loadData();
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to delete vehicle color');
      } finally {
        setDeletingId(null);
      }
    },
    [token, colors.length, page, loadData],
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Color Name',
        render: (row: VehicleColor) => (
          <div className="flex items-center gap-2.5">
            <ColorSwatch hexCode={row.hexCode} name={row.name} size="md" />
            <span className="font-medium">{row.name}</span>
          </div>
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'w-24 text-right',
        render: (row: VehicleColor) => (
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
        title="Vehicle Colors"
        description="Manage the color options available for vehicle registration"
        icon={<Palette className="h-5 w-5 text-primary" />}
        isLoading={isLoading}
        error={error}
        onRefresh={() => loadData()}
        onAdd={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
        addLabel="Add Color"
        toolbar={
          <TableSearch
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search color name..."
          />
        }
      >
        <DataTable
          columns={columns}
          data={colors}
          getRowKey={(row) => row.id}
          emptyMessage={
            search
              ? 'No colors match your search.'
              : 'No vehicle colors yet. Add your first color to continue.'
          }
        />
        <TablePagination meta={meta} onPageChange={setPage} disabled={isLoading} />
      </CrudPanel>

      <VehicleColorFormDialog
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

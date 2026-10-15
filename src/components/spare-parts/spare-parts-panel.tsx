'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Package } from 'lucide-react';
import { CrudPanel } from '@/components/crud/crud-panel';
import { DataTable } from '@/components/crud/data-table';
import { TableActions } from '@/components/crud/table-actions';
import { TablePagination } from '@/components/crud/table-pagination';
import { TableSearch } from '@/components/crud/table-search';
import { SparePartFormDialog } from '@/components/spare-parts/spare-part-form-dialog';
import { SparePartsImportButton } from '@/components/spare-parts/spare-parts-import-button';
import { useAuth } from '@/context/auth-context';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  api,
  ApiError,
  CreateSparePartPayload,
  DEFAULT_PAGE_SIZE,
  PaginationMeta,
  SparePart,
} from '@/lib/api';

const emptyMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

export function SparePartsPanel() {
  const { token } = useAuth();
  const [parts, setParts] = useState<SparePart[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SparePart | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importInfo, setImportInfo] = useState('');

  useEffect(() => {
    setPage(1);
  }, [search]);

  const loadData = useCallback(
    async (signal?: AbortSignal) => {
      if (!token) return;

      setIsLoading(true);
      setError('');

      try {
        const result = await api.getSpareParts(token, {
          page,
          limit: DEFAULT_PAGE_SIZE,
          search: search || undefined,
        });
        if (signal?.aborted) return;
        setParts(result.data);
        setMeta(result.meta);
      } catch (err) {
        if (signal?.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load spare parts');
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

  const handleSubmit = async (payload: CreateSparePartPayload) => {
    if (!token) return;

    if (editing) {
      await api.updateSparePart(token, editing.id, payload);
      await loadData();
      return;
    }

    await api.createSparePart(token, payload);
    if (page === 1) {
      await loadData();
    } else {
      setPage(1);
    }
  };

  const handleDelete = useCallback(
    async (part: SparePart) => {
      if (!token) return;
      if (!window.confirm(`Delete spare part "${part.name}"?`)) return;

      setDeletingId(part.id);
      setError('');

      try {
        await api.deleteSparePart(token, part.id);
        if (parts.length === 1 && page > 1) {
          setPage((current) => current - 1);
        } else {
          await loadData();
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to delete spare part');
      } finally {
        setDeletingId(null);
      }
    },
    [token, parts.length, page, loadData],
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Part Name',
        render: (row: SparePart) => (
          <span className="font-medium">{row.name}</span>
        ),
      },
      {
        key: 'partNumber',
        header: 'Part No.',
        render: (row: SparePart) => (
          <span className="text-muted-foreground">{row.partNumber || '—'}</span>
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'w-24 text-right',
        render: (row: SparePart) => (
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
        title="Spare Parts"
        description="Part names for estimates — supplier or in-house is set on each estimate line"
        icon={<Package className="h-5 w-5 text-primary" />}
        isLoading={isLoading}
        error={error}
        onRefresh={() => loadData()}
        onAdd={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
        addLabel="Add Part"
        headerActions={
          <SparePartsImportButton
            disabled={isLoading}
            onImport={async (file) => {
              if (!token) throw new ApiError('Not authenticated', 401);
              const result = await api.importSparePartsFile(token, file);
              setPage(1);
              await loadData();
              return result;
            }}
            onComplete={(result) => {
              setError('');
              const emptyNote =
                result.skippedEmpty > 0 ? `, ${result.skippedEmpty} empty row(s) skipped` : '';
              setImportInfo(
                `Import complete: ${result.added} part(s) added, ${result.skippedDuplicates} duplicate name(s) skipped (not case-sensitive)${emptyNote}.`,
              );
            }}
            onError={(message) => {
              setImportInfo('');
              setError(message);
            }}
          />
        }
        toolbar={
          <TableSearch
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by name or part number..."
          />
        }
      >
        {importInfo && (
          <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
            {importInfo}
          </div>
        )}
        <DataTable
          columns={columns}
          data={parts}
          getRowKey={(row) => row.id}
          emptyMessage={
            search
              ? 'No spare parts match your search.'
              : 'No spare parts yet. Add your first part to continue.'
          }
        />
        <TablePagination meta={meta} onPageChange={setPage} disabled={isLoading} />
      </CrudPanel>

      <SparePartFormDialog
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

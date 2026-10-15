'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2 } from 'lucide-react';
import { CrudPanel } from '@/components/crud/crud-panel';
import { DataTable } from '@/components/crud/data-table';
import { TableActions } from '@/components/crud/table-actions';
import { TablePagination } from '@/components/crud/table-pagination';
import { TableSearch } from '@/components/crud/table-search';
import { ContractorFormDialog } from '@/components/contractors/contractor-form-dialog';
import { useAuth } from '@/context/auth-context';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  api,
  ApiError,
  Contractor,
  CreateContractorPayload,
  DEFAULT_PAGE_SIZE,
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

export function ContractorsPanel() {
  const { token } = useAuth();
  const [items, setItems] = useState<Contractor[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contractor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => setPage(1), [search]);

  const loadData = useCallback(
    async (signal?: AbortSignal) => {
      if (!token) return;
      setIsLoading(true);
      setError('');
      try {
        const result = await api.getContractors(token, {
          page,
          limit: DEFAULT_PAGE_SIZE,
          search: search || undefined,
        });
        if (signal?.aborted) return;
        setItems(result.data);
        setMeta(result.meta);
      } catch (err) {
        if (signal?.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load contractors');
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

  const handleSubmit = async (payload: CreateContractorPayload) => {
    if (!token) return;
    if (editing) {
      await api.updateContractor(token, editing.id, payload);
      await loadData();
      return;
    }
    await api.createContractor(token, payload);
    if (page === 1) await loadData();
    else setPage(1);
  };

  const handleDelete = useCallback(
    async (item: Contractor) => {
      if (!token) return;
      if (!window.confirm(`Delete contractor "${item.name}"?`)) return;
      setDeletingId(item.id);
      try {
        await api.deleteContractor(token, item.id);
        if (items.length === 1 && page > 1) setPage((p) => p - 1);
        else await loadData();
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to delete');
      } finally {
        setDeletingId(null);
      }
    },
    [token, items.length, page, loadData],
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Contractor',
        render: (row: Contractor) => <span className="font-medium">{row.name}</span>,
      },
      {
        key: 'actions',
        header: '',
        className: 'w-24 text-right',
        render: (row: Contractor) => (
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
        title="Contractors"
        description="Insurance contractor companies for insurance job cards"
        icon={<Building2 className="h-5 w-5 text-primary" />}
        isLoading={isLoading}
        error={error}
        onRefresh={() => loadData()}
        onAdd={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
        addLabel="Add Contractor"
        toolbar={
          <TableSearch value={searchInput} onChange={setSearchInput} placeholder="Search contractor..." />
        }
      >
        <DataTable
          columns={columns}
          data={items}
          getRowKey={(row) => row.id}
          emptyMessage="No contractors yet."
        />
        <TablePagination meta={meta} onPageChange={setPage} disabled={isLoading} />
      </CrudPanel>
      <ContractorFormDialog
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

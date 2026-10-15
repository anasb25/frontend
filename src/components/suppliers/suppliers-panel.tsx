'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Truck } from 'lucide-react';
import { CrudPanel } from '@/components/crud/crud-panel';
import { DataTable } from '@/components/crud/data-table';
import { TableActions } from '@/components/crud/table-actions';
import { TablePagination } from '@/components/crud/table-pagination';
import { TableSearch } from '@/components/crud/table-search';
import { SupplierFormDialog } from '@/components/suppliers/supplier-form-dialog';
import { useAuth } from '@/context/auth-context';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  api,
  ApiError,
  CreateSupplierPayload,
  DEFAULT_PAGE_SIZE,
  PaginationMeta,
  Supplier,
} from '@/lib/api';

const emptyMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

export function SuppliersPanel() {
  const { token } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
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
        const result = await api.getSuppliers(token, {
          page,
          limit: DEFAULT_PAGE_SIZE,
          search: search || undefined,
        });
        if (signal?.aborted) return;
        setSuppliers(result.data);
        setMeta(result.meta);
      } catch (err) {
        if (signal?.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load suppliers');
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

  const handleSubmit = async (payload: CreateSupplierPayload) => {
    if (!token) return;

    if (editing) {
      await api.updateSupplier(token, editing.id, payload);
      await loadData();
      return;
    }

    await api.createSupplier(token, payload);
    if (page === 1) {
      await loadData();
    } else {
      setPage(1);
    }
  };

  const handleDelete = useCallback(
    async (supplier: Supplier) => {
      if (!token) return;
      if (!window.confirm(`Delete supplier "${supplier.name}"?`)) return;

      setDeletingId(supplier.id);
      setError('');

      try {
        await api.deleteSupplier(token, supplier.id);
        if (suppliers.length === 1 && page > 1) {
          setPage((current) => current - 1);
        } else {
          await loadData();
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to delete supplier');
      } finally {
        setDeletingId(null);
      }
    },
    [token, suppliers.length, page, loadData],
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Supplier',
        render: (row: Supplier) => (
          <div>
            <p className="font-medium">{row.name}</p>
            {row.email && (
              <p className="text-xs text-muted-foreground">{row.email}</p>
            )}
          </div>
        ),
      },
      {
        key: 'mobile',
        header: 'Mobile',
        render: (row: Supplier) => row.mobileNumber,
      },
      {
        key: 'trn',
        header: 'TRN #',
        render: (row: Supplier) => (
          <span className="font-mono text-xs">{row.trnNumber}</span>
        ),
      },
      {
        key: 'address',
        header: 'Address',
        render: (row: Supplier) => (
          <span className="line-clamp-2 max-w-xs text-sm text-muted-foreground">
            {row.address}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'w-24 text-right',
        render: (row: Supplier) => (
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
        title="Suppliers"
        description="Manage vendor contacts for supplier spare parts"
        icon={<Truck className="h-5 w-5 text-primary" />}
        isLoading={isLoading}
        error={error}
        onRefresh={() => loadData()}
        onAdd={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
        addLabel="Add Supplier"
        toolbar={
          <TableSearch
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search name, mobile, TRN, email, address..."
          />
        }
      >
        <DataTable
          columns={columns}
          data={suppliers}
          getRowKey={(row) => row.id}
          emptyMessage={
            search
              ? 'No suppliers match your search.'
              : 'No suppliers yet. Add your first supplier to continue.'
          }
        />
        <TablePagination meta={meta} onPageChange={setPage} disabled={isLoading} />
      </CrudPanel>

      <SupplierFormDialog
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

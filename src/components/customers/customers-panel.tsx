'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { CrudPanel } from '@/components/crud/crud-panel';
import { DataTable } from '@/components/crud/data-table';
import { TableActions } from '@/components/crud/table-actions';
import { TablePagination } from '@/components/crud/table-pagination';
import { TableSearch } from '@/components/crud/table-search';
import { CustomerFormDialog } from '@/components/customers/customer-form-dialog';
import { useAuth } from '@/context/auth-context';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  api,
  ApiError,
  CreateCustomerPayload,
  Customer,
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

export function CustomersPanel() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
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
        const result = await api.getCustomers(token, {
          page,
          limit: DEFAULT_PAGE_SIZE,
          search: search || undefined,
        });
        if (signal?.aborted) return;
        setCustomers(result.data);
        setMeta(result.meta);
      } catch (err) {
        if (signal?.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load customers');
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

  const handleSubmit = async (payload: CreateCustomerPayload) => {
    if (!token) return;

    if (editing) {
      await api.updateCustomer(token, editing.id, payload);
      await loadData();
      return;
    }

    await api.createCustomer(token, payload);
    if (page === 1) {
      await loadData();
    } else {
      setPage(1);
    }
  };

  const handleDelete = useCallback(
    async (customer: Customer) => {
      if (!token) return;
      if (!window.confirm(`Delete customer "${customer.name}"?`)) return;

      setDeletingId(customer.id);
      setError('');

      try {
        await api.deleteCustomer(token, customer.id);
        if (customers.length === 1 && page > 1) {
          setPage((current) => current - 1);
        } else {
          await loadData();
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to delete customer');
      } finally {
        setDeletingId(null);
      }
    },
    [token, customers.length, page, loadData],
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Customer',
        render: (row: Customer) => (
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
        render: (row: Customer) => row.mobileNumber,
      },
      {
        key: 'vat',
        header: 'VAT TRN #',
        render: (row: Customer) => row.vatTrnNumber,
      },
      {
        key: 'phone',
        header: 'Phone',
        render: (row: Customer) => row.phoneNumber ?? '—',
      },
      {
        key: 'crtn',
        header: 'CRTN #',
        render: (row: Customer) => row.crtnNumber ?? '—',
      },
      {
        key: 'actions',
        header: '',
        className: 'w-24 text-right',
        render: (row: Customer) => (
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
        title="Customers"
        description="Manage customer profiles, contact details, and tax information"
        icon={<Users className="h-5 w-5 text-primary" />}
        isLoading={isLoading}
        error={error}
        onRefresh={() => loadData()}
        onAdd={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
        addLabel="Add New Customer"
        toolbar={
          <TableSearch
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search name, mobile, VAT, email..."
          />
        }
      >
        <DataTable
          columns={columns}
          data={customers}
          getRowKey={(row) => row.id}
          emptyMessage={
            search
              ? 'No customers match your search.'
              : 'No customers yet. Add your first customer to get started.'
          }
        />
        <TablePagination
          meta={meta}
          onPageChange={setPage}
          disabled={isLoading}
        />
      </CrudPanel>

      <CustomerFormDialog
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

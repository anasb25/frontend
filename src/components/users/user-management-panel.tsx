'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, UserPlus, Users } from 'lucide-react';
import { AddUserDialog, CreateUserPayload } from '@/components/users/add-user-dialog';
import { UsersTable } from '@/components/users/users-table';
import { TablePagination } from '@/components/crud/table-pagination';
import { TableSearch } from '@/components/crud/table-search';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { UserRole } from '@/lib/auth';
import {
  api,
  ApiError,
  DEFAULT_PAGE_SIZE,
  PaginationMeta,
  Role,
  UserWithRole,
} from '@/lib/api';

interface UserManagementPanelProps {
  title?: string;
  description?: string;
  showHeader?: boolean;
  className?: string;
}

const emptyMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

export function UserManagementPanel({
  title = 'User Management',
  description = 'Add team members and manage their access roles',
  showHeader = true,
  className,
}: UserManagementPanelProps) {
  const { token } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const loadData = useCallback(
    async (signal?: AbortSignal) => {
      if (!token) return;

      setIsLoading(true);
      setError('');

      try {
        const [rolesData, usersResult] = await Promise.all([
          api.getRoles(token),
          api.getUsers(token, {
            page,
            limit: DEFAULT_PAGE_SIZE,
            search: search || undefined,
          }),
        ]);
        if (signal?.aborted) return;
        setRoles(rolesData);
        setUsers(usersResult.data);
        setMeta(usersResult.meta);
      } catch (err) {
        if (signal?.aborted) return;
        setError(
          err instanceof ApiError ? err.message : 'Failed to load users',
        );
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

  const handleCreateUser = async (payload: CreateUserPayload) => {
    if (!token) return;

    await api.createUser(token, payload);
    if (page === 1) {
      await loadData();
    } else {
      setPage(1);
    }
  };

  const handleRoleChange = async (userId: string, roleName: UserRole) => {
    if (!token) return;

    setUpdatingUserId(userId);
    setError('');

    try {
      const updated = await api.assignUserRole(token, userId, roleName);
      setUsers((current) =>
        current.map((user) => (user.id === userId ? updated : user)),
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to update user role',
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className={className}>
      <Card className="modern-card overflow-hidden">
        {showHeader && (
          <CardHeader className="border-b border-[var(--shell-border)] bg-gradient-to-r from-primary/5 via-transparent to-cyan-500/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => loadData()}
                  disabled={isLoading}
                >
                  <RefreshCw className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                  Refresh
                </Button>
                <Button type="button" size="sm" onClick={() => setDialogOpen(true)}>
                  <UserPlus className="h-4 w-4" />
                  Add User
                </Button>
              </div>
            </div>
          </CardHeader>
        )}

        <CardContent className="p-0">
          {error && (
            <div className="border-b border-destructive/20 bg-destructive/5 px-6 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="px-6 py-5">
              <div className="mb-4">
                <TableSearch
                  value={searchInput}
                  onChange={setSearchInput}
                  placeholder="Search username or full name..."
                />
              </div>
              <UsersTable
                users={users}
                roles={roles}
                updatingUserId={updatingUserId}
                onRoleChange={handleRoleChange}
                emptyMessage={
                  search ? 'No users match your search.' : 'No users found yet.'
                }
              />
              <TablePagination
                meta={meta}
                onPageChange={setPage}
                disabled={isLoading}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AddUserDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        roles={roles}
        onSubmit={handleCreateUser}
      />
    </div>
  );
}

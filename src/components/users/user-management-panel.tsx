'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, UserPlus, Users } from 'lucide-react';
import { AddUserDialog, CreateUserPayload } from '@/components/users/add-user-dialog';
import { UsersTable } from '@/components/users/users-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { UserRole } from '@/lib/auth';
import { api, ApiError, Role, UserWithRole } from '@/lib/api';

interface UserManagementPanelProps {
  title?: string;
  description?: string;
  showHeader?: boolean;
  className?: string;
}

export function UserManagementPanel({
  title = 'User Management',
  description = 'Add team members and manage their access roles',
  showHeader = true,
  className,
}: UserManagementPanelProps) {
  const { token } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      const [rolesData, usersData] = await Promise.all([
        api.getRoles(token),
        api.getUsers(token),
      ]);
      setRoles(rolesData);
      setUsers(usersData);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to load users',
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateUser = async (payload: CreateUserPayload) => {
    if (!token) return;

    const created = await api.createUser(token, payload);
    setUsers((current) =>
      [...current, created].sort((a, b) => a.username.localeCompare(b.username)),
    );
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
                  onClick={loadData}
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
              <UsersTable
                users={users}
                roles={roles}
                updatingUserId={updatingUserId}
                onRoleChange={handleRoleChange}
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

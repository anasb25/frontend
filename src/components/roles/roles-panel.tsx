'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, Shield, ShieldPlus } from 'lucide-react';
import { AddRoleDialog, CreateRolePayload } from '@/components/roles/add-role-dialog';
import { UserRoleBadge } from '@/components/users/user-role-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { api, ApiError, Role } from '@/lib/api';

interface RolesPanelProps {
  title?: string;
  description?: string;
  showHeader?: boolean;
  className?: string;
}

export function RolesPanel({
  title = 'Roles',
  description = 'System roles and their access levels',
  showHeader = true,
  className,
}: RolesPanelProps) {
  const { token } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadRoles = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      const rolesData = await api.getRoles(token);
      setRoles(rolesData);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to load roles',
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleCreateRole = async (payload: CreateRolePayload) => {
    if (!token) return;

    const created = await api.createRole(token, payload);
    setRoles((current) =>
      [...current, created].sort((a, b) => a.label.localeCompare(b.label)),
    );
  };

  return (
    <div className={className}>
      <Card className="modern-card overflow-hidden">
        {showHeader && (
          <CardHeader className="border-b border-[var(--shell-border)] bg-gradient-to-r from-primary/5 via-transparent to-cyan-500/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
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
                  onClick={loadRoles}
                  disabled={isLoading}
                >
                  <RefreshCw className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                  Refresh
                </Button>
                <Button type="button" size="sm" onClick={() => setDialogOpen(true)}>
                  <ShieldPlus className="h-4 w-4" />
                  Add Role
                </Button>
              </div>
            </div>
          </CardHeader>
        )}

        <CardContent className="p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : roles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--shell-border)] px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No roles yet. Add your first role to get started.
              </p>
              <Button type="button" className="mt-4" size="sm" onClick={() => setDialogOpen(true)}>
                <ShieldPlus className="h-4 w-4" />
                Add Role
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {roles.map((role) => (
                <Card key={role.id} className="border border-[var(--shell-border)] bg-card/80 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{role.label}</CardTitle>
                        <UserRoleBadge role={role.name} label={role.label} className="mt-1" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {role.description || 'No description provided.'}
                    </CardDescription>
                    <Badge variant="default" className="mt-3 font-mono text-[11px]">
                      {role.name}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddRoleDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateRole}
      />
    </div>
  );
}

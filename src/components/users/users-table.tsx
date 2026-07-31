'use client';

import { Loader2 } from 'lucide-react';
import { UserAvatar } from '@/components/users/user-avatar';
import { UserRoleBadge } from '@/components/users/user-role-badge';
import { RoleSelect } from '@/components/users/role-select';
import { UserRole } from '@/lib/auth';
import { Role, UserWithRole } from '@/lib/api';
import { formatUserDate } from '@/lib/user-ui';
import { cn } from '@/lib/utils';

interface UsersTableProps {
  users: UserWithRole[];
  roles: Role[];
  updatingUserId?: string | null;
  onRoleChange?: (userId: string, roleName: UserRole) => void;
  showJoinedDate?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function UsersTable({
  users,
  roles,
  updatingUserId,
  onRoleChange,
  showJoinedDate = true,
  emptyMessage = 'No users found yet.',
  className,
}: UsersTableProps) {
  if (!users.length) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--shell-border)] px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-[var(--shell-border)] text-left">
            <th className="pb-3 pr-4 font-semibold text-muted-foreground">User</th>
            <th className="pb-3 pr-4 font-semibold text-muted-foreground">Username</th>
            <th className="pb-3 pr-4 font-semibold text-muted-foreground">Role</th>
            {showJoinedDate && (
              <th className="pb-3 pr-4 font-semibold text-muted-foreground">Joined</th>
            )}
            {onRoleChange && (
              <th className="pb-3 font-semibold text-muted-foreground">Assign Role</th>
            )}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-[var(--shell-border)] last:border-0"
            >
              <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                  <UserAvatar name={user.fullName} size="sm" />
                  <div>
                    <p className="font-medium text-foreground">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-4 pr-4 text-muted-foreground">@{user.username}</td>
              <td className="py-4 pr-4">
                <UserRoleBadge role={user.role?.name} />
              </td>
              {showJoinedDate && (
                <td className="py-4 pr-4 text-muted-foreground">
                  {formatUserDate(user.createdAt)}
                </td>
              )}
              {onRoleChange && (
                <td className="py-4">
                  <div className="inline-flex items-center gap-2">
                    <RoleSelect
                      roles={roles}
                      value={user.role?.name ?? ''}
                      onChange={(roleName) => onRoleChange(user.id, roleName)}
                      disabled={updatingUserId === user.id}
                      size="sm"
                      className="min-w-[160px]"
                    />
                    {updatingUserId === user.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

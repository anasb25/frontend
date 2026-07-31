import { UserRole } from '@/lib/auth';

export const ROLE_BADGE_VARIANT: Record<string, 'primary' | 'warning' | 'default'> = {
  admin: 'primary',
  accounts: 'warning',
  basicUser: 'default',
};

export function getRoleBadgeVariant(
  role: string | null | undefined,
): 'primary' | 'warning' | 'default' {
  if (!role) return 'default';
  return ROLE_BADGE_VARIANT[role] ?? 'default';
}

export function formatUserDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatRoleKey(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '');
}

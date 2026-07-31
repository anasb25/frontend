import { Badge } from '@/components/ui/badge';
import { getRoleLabel } from '@/lib/auth';
import { getRoleBadgeVariant } from '@/lib/user-ui';

interface UserRoleBadgeProps {
  role: string | null | undefined;
  label?: string;
  className?: string;
}

export function UserRoleBadge({ role, label, className }: UserRoleBadgeProps) {
  if (!role) {
    return (
      <Badge variant="default" className={className}>
        Unassigned
      </Badge>
    );
  }

  return (
    <Badge variant={getRoleBadgeVariant(role)} className={className}>
      {getRoleLabel(role, label)}
    </Badge>
  );
}

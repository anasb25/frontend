import { Select, SelectOption } from '@/components/ui/select';
import { UserRole } from '@/lib/auth';
import { Role } from '@/lib/api';

interface RoleSelectProps {
  roles: Role[];
  value: UserRole | '';
  onChange: (value: UserRole) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

export function RoleSelect({
  roles,
  value,
  onChange,
  disabled,
  className,
  placeholder = 'Select role',
  size = 'md',
  id,
}: RoleSelectProps) {
  const options: SelectOption<UserRole>[] = roles.map((role) => ({
    value: role.name,
    label: role.label,
    description: role.description,
  }));

  return (
    <Select
      id={id}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      size={size}
      className={className}
      aria-label="Select role"
    />
  );
}

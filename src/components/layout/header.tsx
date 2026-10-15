'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
} from '@/components/ui/dropdown';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useAuth } from '@/context/auth-context';
import { isAdmin, USER_ROLE_LABELS } from '@/lib/auth';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="shell-topbar sticky top-0 z-30 border-b">
      <div className="flex h-[4.25rem] items-center justify-between gap-4 px-3 sm:px-4">
        <div className="min-w-0">
          <p className="text-xs font-medium shell-text-muted">{today}</p>
          <h1 className="truncate text-lg font-bold tracking-tight shell-text">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden truncate text-xs shell-text-muted sm:block">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle variant="shell" className="hidden sm:flex" />

          <Dropdown align="end" className="hidden sm:inline-flex">
            <DropdownTrigger className="h-auto gap-2 border-[var(--shell-border)] bg-card/90 py-1.5 pl-1.5 pr-2.5 backdrop-blur-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-icon text-xs font-bold">
                {user?.fullName?.charAt(0) ?? 'A'}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold leading-none shell-text">
                  {user?.fullName}
                </p>
                <p className="mt-0.5 text-xs shell-text-muted">
                  {user?.role ? USER_ROLE_LABELS[user.role] : 'User'}
                </p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
            </DropdownTrigger>

            <DropdownContent className="min-w-[12.5rem]">
              <DropdownLabel>Account</DropdownLabel>
              {isAdmin(user) && (
                <DropdownItem onClick={() => router.push('/dashboard/settings')}>
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownItem>
              )}
              <DropdownSeparator />
              <DropdownItem destructive onClick={logout}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}

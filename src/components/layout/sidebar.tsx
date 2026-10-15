'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calculator,
  ClipboardList,
  Database,
  LayoutDashboard,
  LogOut,
  Settings,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { isAdmin, USER_ROLE_LABELS } from '@/lib/auth';
import { ThemeToggle } from '@/components/theme/theme-toggle';

type NavChild = {
  label: string;
  href: string;
};

type NavLinkItem = {
  type: 'link';
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

type NavGroupItem = {
  type: 'group';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: NavChild[];
};

type NavItem = NavLinkItem | NavGroupItem;

const navItems: NavItem[] = [
  { type: 'link', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    type: 'link',
    label: 'Investigations',
    href: '/dashboard/investigations',
    icon: ClipboardList,
  },
  {
    type: 'link',
    label: 'Estimates',
    href: '/dashboard/estimates',
    icon: Calculator,
  },
  {
    type: 'link',
    label: 'Job Cards',
    href: '/dashboard/job-cards',
    icon: ClipboardList,
  },
  {
    type: 'group',
    label: 'Master Data',
    icon: Database,
    children: [
      { label: 'Customers', href: '/dashboard/customers' },
      { label: 'Suppliers', href: '/dashboard/suppliers' },
      { label: 'Contractors', href: '/dashboard/contractors' },
      { label: 'Vehicle Brands', href: '/dashboard/vehicle-brands' },
      { label: 'Vehicle Models', href: '/dashboard/vehicle-models' },
      { label: 'Vehicle Colors', href: '/dashboard/vehicle-colors' },
      { label: 'Spare Parts', href: '/dashboard/spare-parts' },
    ],
  },
  {
    type: 'link',
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    adminOnly: true,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function isGroupActive(pathname: string, children: NavChild[]) {
  return children.some(
    (child) => pathname === child.href || pathname.startsWith(`${child.href}/`),
  );
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpandedGroups((current) => {
      const next = { ...current };
      for (const item of navItems) {
        if (item.type === 'group' && isGroupActive(pathname, item.children)) {
          next[item.label] = true;
        }
      }
      return next;
    });
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((current) => ({
      ...current,
      [label]: !current[label],
    }));
  };

  const visibleItems = navItems.filter(
    (item) => item.type === 'link' ? !item.adminOnly || isAdmin(user) : true,
  );

  return (
    <aside
      className={cn(
        'shell-sidebar fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden rounded-r-2xl border-r shadow-[4px_0_24px_rgba(37,99,235,0.06)] transition-all duration-300 dark:shadow-[4px_0_24px_rgba(0,0,0,0.25)]',
        collapsed ? 'w-[76px]' : 'w-[260px]',
      )}
    >
      <div className="p-3">
        <div
          className={cn(
            'flex items-center rounded-2xl border border-[var(--shell-border)] bg-white/40 p-2.5 backdrop-blur-md dark:bg-white/5',
            collapsed ? 'justify-center' : 'justify-between gap-2',
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl brand-icon">
              <Wrench className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold shell-text">Al-Thara</p>
                <p className="truncate text-[10px] font-semibold uppercase tracking-widest shell-text-muted">
                  Garage GMS
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={onToggle}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shell-text-muted transition-colors hover:bg-[var(--shell-hover)] hover:text-[var(--shell-foreground)]"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={onToggle}
            className="mt-2 flex w-full items-center justify-center rounded-xl border border-[var(--shell-border)] bg-white/30 py-2 shell-text-muted backdrop-blur-sm transition-colors hover:bg-[var(--shell-hover)] hover:text-[var(--shell-foreground)] dark:bg-white/5"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {!collapsed && (
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest shell-text-muted">
            Main Menu
          </p>
        )}

        {visibleItems.map((item) => {
          if (item.type === 'link') {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'nav-item-active'
                    : 'shell-text-muted hover:bg-[var(--shell-hover)] hover:text-[var(--shell-foreground)]',
                  collapsed && 'justify-center px-2',
                )}
                title={collapsed ? item.label : undefined}
              >
                <span
                  className={cn(
                    'nav-icon-wrap flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
                    !isActive && 'group-hover:scale-105',
                  )}
                >
                  <Icon className="h-[17px] w-[17px]" />
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          }

          const Icon = item.icon;
          const groupActive = isGroupActive(pathname, item.children);
          const isExpanded = expandedGroups[item.label] ?? groupActive;

          if (collapsed) {
            return (
              <Link
                key={item.label}
                href={item.children[0].href}
                onClick={() => onToggle()}
                className={cn(
                  'group flex items-center justify-center rounded-xl px-2 py-2 text-sm font-medium transition-all duration-200',
                  groupActive
                    ? 'nav-item-active'
                    : 'shell-text-muted hover:bg-[var(--shell-hover)] hover:text-[var(--shell-foreground)]',
                )}
                title={item.label}
              >
                <span className="nav-icon-wrap flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="h-[17px] w-[17px]" />
                </span>
              </Link>
            );
          }

          return (
            <div key={item.label} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleGroup(item.label)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium transition-all duration-200',
                  groupActive
                    ? 'nav-item-active'
                    : 'shell-text-muted hover:bg-[var(--shell-hover)] hover:text-[var(--shell-foreground)]',
                )}
              >
                <span className="nav-icon-wrap flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="h-[17px] w-[17px]" />
                </span>
                <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 transition-transform duration-200',
                    isExpanded && 'rotate-180',
                  )}
                />
              </button>

              {isExpanded && (
                <div className="ml-3 space-y-1 border-l border-[var(--shell-border)] pl-3">
                  {item.children.map((child) => {
                    const isChildActive =
                      pathname === child.href || pathname.startsWith(`${child.href}/`);

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'block rounded-lg px-3 py-2 text-sm transition-colors',
                          isChildActive
                            ? 'bg-primary/10 font-semibold text-primary'
                            : 'shell-text-muted hover:bg-[var(--shell-hover)] hover:text-[var(--shell-foreground)]',
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-[var(--shell-border)] p-3">
        {!collapsed && user && (
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-[var(--shell-border)] bg-white/40 p-3 backdrop-blur-md dark:bg-white/5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl brand-icon text-xs font-bold">
              {user.fullName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold shell-text">
                {user.fullName}
              </p>
              <p className="truncate text-xs shell-text-muted">@{user.username}</p>
              <p className="truncate text-[10px] font-medium shell-text-muted">
                {USER_ROLE_LABELS[user.role]}
              </p>
            </div>
          </div>
        )}

        <div className={cn('mb-2 flex gap-2', collapsed ? 'flex-col items-center' : '')}>
          <ThemeToggle variant="shell" />
          <button
            onClick={logout}
            className={cn(
              'flex items-center gap-2 rounded-xl border border-[var(--shell-border)] bg-white/30 px-3 py-2 text-sm font-medium shell-text-muted backdrop-blur-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:bg-white/5 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400',
              collapsed ? 'h-9 w-9 justify-center px-0' : 'flex-1',
            )}
            title="Sign out"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

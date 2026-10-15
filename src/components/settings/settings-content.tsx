'use client';

import { useState } from 'react';
import { Shield, Users } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { RolesPanel } from '@/components/roles/roles-panel';
import { UserManagementPanel } from '@/components/users/user-management-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { isAdmin } from '@/lib/auth';
import { cn } from '@/lib/utils';

type SettingsSection = 'users' | 'roles';

interface SectionItem {
  id: SettingsSection;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sections: SectionItem[] = [
  {
    id: 'users',
    label: 'User Management',
    description: 'Add users and manage access roles',
    icon: Users,
  },
  {
    id: 'roles',
    label: 'Roles',
    description: 'View system roles and permissions',
    icon: Shield,
  },
];

export function SettingsContent() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>('users');

  if (!isAdmin(user)) {
    return (
      <>
        <Header title="Settings" subtitle="Admin access required" />
        <div className="p-6">
          <Card className="modern-card max-w-lg p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Settings are available to administrators only.
            </p>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Settings"
        subtitle="Manage users, roles, and system access"
      />

      <div className="flex flex-col gap-6 p-6 xl:flex-row">
        <aside className="xl:w-72 xl:shrink-0">
          <Card className="modern-card overflow-hidden">
            <CardHeader className="border-b border-[var(--shell-border)] pb-4">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">
                Settings Menu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-3">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all',
                      isActive
                        ? 'nav-item-active shadow-sm'
                        : 'shell-text-muted hover:bg-[var(--shell-hover)] hover:text-[var(--shell-foreground)]',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                        isActive ? 'nav-icon-wrap' : 'bg-[var(--shell-hover)]',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{section.label}</span>
                      <span className="mt-0.5 block text-xs opacity-80">
                        {section.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0 flex-1 animate-fade-in">
          {activeSection === 'users' && <UserManagementPanel />}
          {activeSection === 'roles' && (
            <RolesPanel description="Admin, Accounts, and Basic User access levels" />
          )}
        </div>
      </div>
    </>
  );
}

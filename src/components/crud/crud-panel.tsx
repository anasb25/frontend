'use client';

import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CrudPanelProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onAdd?: () => void;
  addLabel?: string;
  headerActions?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function CrudPanel({
  title,
  description,
  icon,
  isLoading,
  error,
  onRefresh,
  onAdd,
  addLabel = 'Add New',
  headerActions,
  toolbar,
  children,
  className,
}: CrudPanelProps) {
  return (
    <Card className={cn('modern-card overflow-hidden', className)}>
      <CardHeader className="border-b border-[var(--shell-border)] bg-gradient-to-r from-primary/5 via-transparent to-cyan-500/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
              {icon}
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {onRefresh && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                Refresh
              </Button>
            )}
            {headerActions}
            {onAdd && (
              <Button type="button" size="sm" onClick={onAdd}>
                <Plus className="h-4 w-4" />
                {addLabel}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {error && (
          <div className="border-b border-destructive/20 bg-destructive/5 px-6 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {toolbar && (
          <div className="border-b border-[var(--shell-border)] px-6 py-4">
            {toolbar}
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="px-6 py-5">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}

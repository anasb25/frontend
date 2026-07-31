'use client';

import {
  ArrowUpRight,
  Car,
  CheckCircle2,
  Clock,
  DollarSign,
  MoreHorizontal,
  Users,
  Wrench,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { StatCard } from '@/components/dashboard/stat-card';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

const stats = [
  {
    title: 'Active Work Orders',
    value: '24',
    change: '+12%',
    icon: Wrench,
    iconClassName: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Vehicles in Service',
    value: '18',
    change: '+5%',
    icon: Car,
    iconClassName: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  },
  {
    title: 'Total Customers',
    value: '342',
    change: '+8%',
    icon: Users,
    iconClassName: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  {
    title: 'Revenue (Month)',
    value: '$48.2K',
    change: '+18%',
    icon: DollarSign,
    iconClassName: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
];

const recentOrders = [
  { id: 'WO-1042', vehicle: 'Toyota Camry 2021', customer: 'Ahmed Hassan', status: 'In Progress' as const, time: '2h ago' },
  { id: 'WO-1041', vehicle: 'BMW X5 2019', customer: 'Sarah Johnson', status: 'Pending' as const, time: '4h ago' },
  { id: 'WO-1040', vehicle: 'Honda Civic 2022', customer: 'Mohammed Ali', status: 'Completed' as const, time: '6h ago' },
  { id: 'WO-1039', vehicle: 'Mercedes C200 2020', customer: 'Fatima Khan', status: 'In Progress' as const, time: '8h ago' },
];

const statusVariant = {
  'In Progress': 'primary' as const,
  Pending: 'default' as const,
  Completed: 'success' as const,
};

export function DashboardContent() {
  const { user } = useAuth();

  return (
    <>
      <Header title="Dashboard" />

      <div className="space-y-6 p-6">
        <div className="animate-fade-in">
          <WelcomeBanner name={user?.fullName ?? 'Admin'} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.title}
              className={cn('animate-fade-in', `stagger-${i + 1}`)}
            >
              <StatCard {...stat} />
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="animate-fade-in stagger-3 lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Recent Work Orders</CardTitle>
                <CardDescription>Latest service requests across your garage</CardDescription>
              </div>
              <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5">
                View all
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="group flex items-center justify-between rounded-xl border border-border bg-surface/50 px-4 py-3.5 transition-all hover:border-primary/20 hover:bg-surface hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                        <Car className="h-4 w-4" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{order.vehicle}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.id} · {order.customer}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                      <span className="hidden text-xs text-muted-foreground sm:block">{order.time}</span>
                      <button className="hidden rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 sm:block">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in stagger-4">
            <CardHeader>
              <CardTitle>Quick Overview</CardTitle>
              <CardDescription>Real-time garage metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: Clock, label: 'Avg. Turnaround', value: '2.4 days', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', pct: 72 },
                { icon: CheckCircle2, label: 'Completed Today', value: '7 orders', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', pct: 88 },
                { icon: Car, label: 'Bay Utilization', value: '85%', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10', pct: 85 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', item.bg)}>
                        <Icon className={cn('h-4 w-4', item.color)} strokeWidth={1.75} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className={cn('text-sm font-bold', item.color)}>{item.value}</p>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn('h-full rounded-full transition-all duration-700', item.bg.replace('/10', '/60'))}
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

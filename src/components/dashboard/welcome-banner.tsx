'use client';

import { Sparkles } from 'lucide-react';

interface WelcomeBannerProps {
  name: string;
}

export function WelcomeBanner({ name }: WelcomeBannerProps) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="modern-card relative overflow-hidden p-6">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-6 left-1/3 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
      <div className="relative flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            {greeting}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Welcome back, {name.split(' ')[0]}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s an overview of your garage performance today.
          </p>
        </div>
        <div className="mt-4 flex gap-6 sm:mt-0">
          {[
            { label: 'Open Orders', value: '24' },
            { label: 'In Bay', value: '8' },
            { label: 'Ready', value: '5' },
          ].map((item) => (
            <div key={item.label} className="text-center sm:text-right">
              <p className="text-lg font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

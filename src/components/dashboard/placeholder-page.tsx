'use client';

import { Construction } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <>
      <Header title={title} subtitle={description} />
      <div className="flex items-center justify-center p-6">
        <div className="modern-card w-full max-w-md animate-fade-in-scale p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Construction className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Coming Soon</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            The {title.toLowerCase()} module is being built and will be available in an upcoming release.
          </p>
          <Button variant="secondary" className="mt-6" disabled>
            Notify me when ready
          </Button>
        </div>
      </div>
    </>
  );
}

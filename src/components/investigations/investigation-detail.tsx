'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { ColorSwatch } from '@/components/ui/color-swatch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CarDamageDiagram } from '@/components/investigations/car-damage-diagram';
import { formatDisplayDate } from '@/components/ui/date-picker';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/context/auth-context';
import { api, ApiError, Investigation, getUploadOrigin } from '@/lib/api';

export function InvestigationDetail({ id }: { id: string }) {
  const { token } = useAuth();
  const [item, setItem] = useState<Investigation | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getInvestigation(token, id);
        if (!cancelled) setItem(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load investigation');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">{error || 'Investigation not found'}</p>
      </div>
    );
  }

  const origin = getUploadOrigin();

  return (
    <>
      <Header
        title="Investigation Details"
        subtitle={`${item.customer.name} · ${item.plateNo}`}
      />
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard/investigations"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to investigations
          </Link>
          <Link
            href={`/dashboard/estimates/new?investigationId=${item.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Continue to Estimate
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="modern-card">
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {item.customer.name}</p>
              <p><span className="text-muted-foreground">Mobile:</span> {item.customer.mobileNumber}</p>
              <p><span className="text-muted-foreground">VAT TRN:</span> {item.customer.vatTrnNumber}</p>
              {item.customer.email && (
                <p><span className="text-muted-foreground">Email:</span> {item.customer.email}</p>
              )}
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardHeader>
              <CardTitle>Vehicle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <BrandLogo name={item.brand.name} logoUrl={item.brand.logoUrl} size="md" />
                <span className="font-medium">
                  {item.brand.name} {item.model.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ColorSwatch hexCode={item.color.hexCode} name={item.color.name} />
                <span>{item.color.name}</span>
              </div>
              <p><span className="text-muted-foreground">Year:</span> {item.makeYear}</p>
              <p><span className="text-muted-foreground">Plate:</span> {item.plateNo}</p>
              <p><span className="text-muted-foreground">Chassis:</span> {item.chassisNumber}</p>
              <p><span className="text-muted-foreground">Mileage:</span> {item.mileage} km</p>
              <p><span className="text-muted-foreground">State:</span> {item.state}</p>
              <p><span className="text-muted-foreground">Reg. Expiry:</span> {formatDisplayDate(item.registrationExpiry)}</p>
              {item.note && (
                <p><span className="text-muted-foreground">Note:</span> {item.note}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="modern-card">
          <CardHeader>
            <CardTitle>Damage Map</CardTitle>
          </CardHeader>
          <CardContent>
            <CarDamageDiagram selected={item.damagedZones} readOnly />
            {item.damagedZones.length === 0 && (
              <p className="mt-2 text-sm text-muted-foreground">No damage marked</p>
            )}
          </CardContent>
        </Card>

        {item.imageUrls?.length > 0 && (
          <Card className="modern-card">
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {item.imageUrls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={`${origin}${url}`}
                  alt="Investigation"
                  className="h-32 w-full rounded-xl border border-[var(--shell-border)] object-cover"
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

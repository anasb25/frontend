'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Pencil } from 'lucide-react';
import { OpenJobCardLink } from '@/components/job-cards/open-job-card-link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  formatInvestigationId,
  InvestigationContext,
} from '@/components/investigations/investigation-context';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/context/auth-context';
import { api, ApiError, Estimate } from '@/lib/api';

export function EstimateDetail({ id }: { id: string }) {
  const { token } = useAuth();
  const [item, setItem] = useState<Estimate | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getEstimate(token, id);
        if (!cancelled) setItem(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load estimate');
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
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">{error || 'Estimate not found'}</p>
      </div>
    );
  }

  const inv = item.investigation;
  const supplierParts = item.spareParts.filter((p) => p.category === 'supplier');
  const inHouseParts = item.spareParts.filter((p) => p.category === 'in-house');

  const renderPartsTable = (parts: typeof item.spareParts, title: string) => (
    <div className="space-y-1.5">
      <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title} ({parts.length})
      </h4>
      {parts.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">No parts</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[var(--shell-border)]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--shell-border)] bg-[var(--surface)]/50 text-left text-[10px] text-muted-foreground">
                <th className="px-2.5 py-1.5 font-semibold">Part</th>
                <th className="px-2.5 py-1.5 font-semibold">Part No.</th>
                <th className="w-12 px-2.5 py-1.5 font-semibold">Qty</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => (
                <tr key={part.id} className="border-b border-[var(--shell-border)] last:border-0">
                  <td className="px-2.5 py-2 font-medium">{part.name}</td>
                  <td className="px-2.5 py-2 text-muted-foreground">{part.partNumber || '—'}</td>
                  <td className="px-2.5 py-2">{part.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Header
        title="Estimate Details"
        subtitle={`${inv.customer.name} · ${inv.plateNo}`}
      />
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/estimates"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          <Link
            href={`/dashboard/estimates/new?investigationId=${item.investigationId}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--shell-border)] px-2.5 py-1 text-xs font-medium transition-colors hover:bg-[var(--surface)]"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Link>
          <OpenJobCardLink estimateId={item.id} size="md" />
        </div>

        <div
          className={`grid gap-3 rounded-lg border border-[var(--shell-border)] bg-card px-3 py-2.5 ${
            item.jobCategory === 'insurance' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'
          }`}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Investigation
            </p>
            <p className="font-mono text-xs font-bold uppercase">
              {formatInvestigationId(item.investigationId)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Delivery
            </p>
            <p className="text-xs font-semibold">
              {item.estimatedDeliveryDays} day{item.estimatedDeliveryDays === 1 ? '' : 's'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Job Category
            </p>
            <p className="text-xs font-semibold capitalize">{item.jobCategory}</p>
          </div>
          {item.jobCategory === 'insurance' && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Lump Sum Amount
              </p>
              <p className="text-xs font-semibold tabular-nums">
                {item.lumpSumAmount != null
                  ? Number(item.lumpSumAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : '—'}
              </p>
            </div>
          )}
        </div>

        <InvestigationContext investigation={inv} />

        <Card className="modern-card overflow-hidden">
          <CardHeader className="border-b border-[var(--shell-border)] px-4 py-3">
            <CardTitle className="text-sm font-semibold">Spare Parts</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-4 lg:grid-cols-2">
            {renderPartsTable(supplierParts, 'Supplier')}
            {renderPartsTable(inHouseParts, 'In-House')}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

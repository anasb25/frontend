'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { EstimateForm } from '@/components/estimates/estimate-form';
import { useAuth } from '@/context/auth-context';
import { api, ApiError, Estimate } from '@/lib/api';

export default function NewEstimatePage() {
  const searchParams = useSearchParams();
  const investigationId = searchParams.get('investigationId') ?? '';
  const { token } = useAuth();
  const [existingEstimate, setExistingEstimate] = useState<Estimate | null | undefined>(
    undefined,
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !investigationId) {
      setExistingEstimate(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const estimate = await api.getEstimateByInvestigation(token, investigationId);
        if (!cancelled) setExistingEstimate(estimate);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load estimate');
          setExistingEstimate(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, investigationId]);

  if (!investigationId) {
    return (
      <>
        <Header title="New Estimate" subtitle="Step 2 — Job estimate" />
        <div className="px-3 py-4 sm:px-4">
          <p className="text-sm text-destructive">
            Missing investigation. Complete an investigation first.
          </p>
        </div>
      </>
    );
  }

  if (existingEstimate === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Header
        title={existingEstimate ? 'Edit Estimate' : 'New Estimate'}
        subtitle="Step 2 — Job estimate from investigation"
      />
      <div className="px-3 py-4 sm:px-4">
        {error && (
          <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <EstimateForm
          investigationId={investigationId}
          existingEstimate={existingEstimate}
        />
      </div>
    </>
  );
}

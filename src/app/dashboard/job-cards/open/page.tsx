'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { api, ApiError } from '@/lib/api';

export default function OpenJobCardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const estimateId = searchParams.get('estimateId') ?? '';
  const { token } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    if (!estimateId) {
      setError('Missing estimate. Open a job card from an estimate first.');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const card = await api.createJobCard(token, estimateId);
        if (!cancelled) router.replace(`/dashboard/job-cards/${card.id}`);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to open job card');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, estimateId, router]);

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Opening job card...</p>
    </div>
  );
}

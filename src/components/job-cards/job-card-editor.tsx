'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  CircleCheckBig,
  ClipboardList,
  Loader2,
  Save,
  Car,
  UserRound,
  Undo2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { InvestigationFullContext } from '@/components/investigations/investigation-full-context';
import { Header } from '@/components/layout/header';
import { FormField } from '@/components/users/form-field';
import { useAuth } from '@/context/auth-context';
import {
  api,
  ApiError,
  Contractor,
  JobCard,
  JobCardLine,
  SparePartCategory,
  Supplier,
  UpdateJobCardLinePayload,
} from '@/lib/api';
import { cn } from '@/lib/utils';

type TabId = 'investigation' | 'job';

type EditableLine = JobCardLine & {
  unitCostInput: string;
  unitPriceInput: string;
};

function toEditableLines(lines: JobCardLine[]): EditableLine[] {
  return lines.map((line) => ({
    ...line,
    unitCostInput: line.unitCost,
    unitPriceInput: line.unitPrice,
  }));
}

const SOURCE_OPTIONS = [
  { value: 'supplier', label: 'Supplier' },
  { value: 'in-house', label: 'In-House' },
];

function linesToPayload(lines: EditableLine[]): UpdateJobCardLinePayload[] {
  return lines.map((line) => ({
    id: line.id,
    unitCost: Number(line.unitCostInput) || 0,
    unitPrice: Number(line.unitPriceInput) || 0,
    category: line.category,
    supplierId: line.category === 'supplier' ? line.supplierId : null,
    isCompleted: line.isCompleted,
  }));
}

export function JobCardEditor({ id }: { id: string }) {
  const { token } = useAuth();
  const [tab, setTab] = useState<TabId>('job');
  const [jobCard, setJobCard] = useState<JobCard | null>(null);
  const [lines, setLines] = useState<EditableLine[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [lpoNumber, setLpoNumber] = useState('');
  const [contractorId, setContractorId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    try {
      const [card, suppliersResult, contractorsResult] = await Promise.all([
        api.getJobCard(token, id),
        api.getSuppliers(token, { page: 1, limit: 100 }),
        api.getContractors(token, { page: 1, limit: 100 }),
      ]);
      setJobCard(card);
      setLines(toEditableLines(card.lines));
      setLpoNumber(card.lpoNumber ?? '');
      setContractorId(card.contractorId ?? '');
      setSuppliers(suppliersResult.data);
      setContractors(contractorsResult.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load job card');
    } finally {
      setIsLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    load();
  }, [load]);

  const supplierOptions = useMemo(
    () =>
      suppliers.map((supplier) => ({
        value: supplier.id,
        label: supplier.name,
        description: supplier.mobileNumber,
      })),
    [suppliers],
  );

  const contractorOptions = useMemo(
    () =>
      contractors.map((contractor) => ({
        value: contractor.id,
        label: contractor.name,
      })),
    [contractors],
  );

  const updateLine = (lineId: string, patch: Partial<EditableLine>) => {
    setLines((current) =>
      current.map((line) => (line.id === lineId ? { ...line, ...patch } : line)),
    );
  };

  const markComplete = (lineId: string) => {
    updateLine(lineId, { isCompleted: true });
  };

  const markIncomplete = (lineId: string) => {
    updateLine(lineId, { isCompleted: false });
  };

  const setLineSource = (lineId: string, category: SparePartCategory) => {
    updateLine(lineId, {
      category,
      supplierId: category === 'in-house' ? null : undefined,
    });
  };

  const handleSave = async () => {
    if (!token || !jobCard) return;
    const isInsurance = jobCard.estimate.jobCategory === 'insurance';
    if (isInsurance && !contractorId) {
      setError('Select an insurance contractor for insurance jobs.');
      setTab('job');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      const updated = await api.updateJobCard(token, jobCard.id, {
        lpoNumber: lpoNumber.trim() || null,
        contractorId: isInsurance ? contractorId : null,
        lines: linesToPayload(lines),
      });
      setJobCard(updated);
      setLines(toEditableLines(updated.lines));
      setLpoNumber(updated.lpoNumber ?? '');
      setContractorId(updated.contractorId ?? '');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save job card');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !jobCard) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!jobCard) return null;

  const inv = jobCard.estimate.investigation;
  const customer = inv.customer;
  const jobCategory = jobCard.estimate.jobCategory;
  const isInsurance = jobCategory === 'insurance';
  const completedCount = lines.filter((line) => line.isCompleted).length;

  return (
    <>
      <Header title="Job Card" subtitle={`${customer.name} · ${inv.plateNo}`} />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/dashboard/job-cards"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to job cards
          </Link>
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
              jobCard.status === 'completed'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
            )}
          >
            {jobCard.status.replace('_', ' ')} · {completedCount}/{lines.length} parts
          </span>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-1 rounded-xl border border-[var(--shell-border)] bg-[var(--surface)]/40 p-1">
          <button
            type="button"
            onClick={() => setTab('investigation')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
              tab === 'investigation'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Car className="h-4 w-4" />
            Investigation
          </button>
          <button
            type="button"
            onClick={() => setTab('job')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
              tab === 'job'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <ClipboardList className="h-4 w-4" />
            Job Card
          </button>
        </div>

        {tab === 'investigation' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--shell-border)] bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold">Customer</h2>
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Name</dt>
                  <dd className="font-medium">{customer.name}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Mobile</dt>
                  <dd>{customer.mobileNumber}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase text-muted-foreground">VAT TRN</dt>
                  <dd>{customer.vatTrnNumber}</dd>
                </div>
                {customer.email && (
                  <div>
                    <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Email</dt>
                    <dd>{customer.email}</dd>
                  </div>
                )}
                {customer.address && (
                  <div className="sm:col-span-2">
                    <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Address</dt>
                    <dd>{customer.address}</dd>
                  </div>
                )}
              </dl>
            </div>
            <InvestigationFullContext investigation={inv} defaultOpen mediaLayout="split" />
          </div>
        )}

        {tab === 'job' && (
          <div className="space-y-4">
            <div className="grid gap-3 rounded-2xl border border-[var(--shell-border)] bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Job category</p>
                <p className="mt-1 text-sm font-semibold capitalize">{jobCategory}</p>
                <p className="text-[11px] text-muted-foreground">From estimate</p>
              </div>
              <FormField label="LPO No." htmlFor="lpoNumber">
                <Input
                  id="lpoNumber"
                  value={lpoNumber}
                  onChange={(e) => setLpoNumber(e.target.value)}
                  placeholder="Local purchase order number"
                  className="h-9"
                />
              </FormField>
              {isInsurance && (
                <FormField label="Insurance contractor" htmlFor="contractorId">
                  <SearchableSelect
                    id="contractorId"
                    value={contractorId}
                    onChange={setContractorId}
                    options={contractorOptions}
                    placeholder="Select contractor"
                    size="sm"
                  />
                </FormField>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--shell-border)] bg-card shadow-sm">
              <div className="border-b border-[var(--shell-border)] bg-[var(--surface)]/40 px-4 py-3">
                <h2 className="text-sm font-bold">Spare parts</h2>
                <p className="text-xs text-muted-foreground">
                  Cost, price, supplier (if applicable), and mark each line complete when done.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--shell-border)] bg-[var(--surface)]/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2.5 font-semibold">Part</th>
                      <th className="w-16 px-3 py-2.5 font-semibold">Qty</th>
                      <th className="w-24 px-3 py-2.5 font-semibold">Source</th>
                      <th className="w-28 px-3 py-2.5 font-semibold">Cost</th>
                      <th className="w-28 px-3 py-2.5 font-semibold">Price</th>
                      <th className="min-w-[180px] px-3 py-2.5 font-semibold">Supplier</th>
                      <th className="w-36 px-3 py-2.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line) => (
                      <tr
                        key={line.id}
                        className={cn(
                          'border-b border-[var(--shell-border)] align-top last:border-0',
                          line.isCompleted && 'bg-emerald-500/5',
                        )}
                      >
                        <td className="px-3 py-2.5">
                          <p className="font-medium">{line.name}</p>
                          {line.partNumber && (
                            <p className="text-xs text-muted-foreground">{line.partNumber}</p>
                          )}
                        </td>
                        <td className="px-3 py-2.5">{line.quantity}</td>
                        <td className="px-3 py-2.5">
                          <SearchableSelect
                            value={line.category}
                            onChange={(value) =>
                              setLineSource(line.id, value as SparePartCategory)
                            }
                            options={SOURCE_OPTIONS}
                            placeholder="Source"
                            size="sm"
                            disabled={line.isCompleted}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={line.unitCostInput}
                            onChange={(e) =>
                              updateLine(line.id, { unitCostInput: e.target.value })
                            }
                            className="h-9"
                            disabled={line.isCompleted}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={line.unitPriceInput}
                            onChange={(e) =>
                              updateLine(line.id, { unitPriceInput: e.target.value })
                            }
                            className="h-9"
                            disabled={line.isCompleted}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          {line.category === 'supplier' ? (
                            <SearchableSelect
                              value={line.supplierId ?? ''}
                              onChange={(value) =>
                                updateLine(line.id, { supplierId: value || null })
                              }
                              options={supplierOptions}
                              placeholder="Select supplier"
                              size="sm"
                              disabled={line.isCompleted}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">In-house</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          {line.isCompleted ? (
                            <div className="flex flex-col gap-1.5">
                              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 to-emerald-600/10 px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-sm dark:text-emerald-300">
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                Done
                              </span>
                              <button
                                type="button"
                                onClick={() => markIncomplete(line.id)}
                                className="inline-flex w-fit items-center gap-1 text-[10px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                              >
                                <Undo2 className="h-3 w-3" />
                                Undo
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => markComplete(line.id)}
                              className={cn(
                                'group inline-flex w-full min-w-[7.5rem] items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold',
                                'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white',
                                'shadow-md shadow-emerald-500/35 ring-1 ring-emerald-400/30',
                                'transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/45 hover:brightness-105 active:scale-[0.98]',
                              )}
                            >
                              <CircleCheckBig className="h-4 w-4 transition-transform group-hover:scale-110" />
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save job card
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

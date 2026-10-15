'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  ClipboardList,
  Loader2,
  Package,
  Save,
} from 'lucide-react';
import { AlertModal } from '@/components/ui/alert-modal';
import { Button } from '@/components/ui/button';
import { FormStepper, FormStep } from '@/components/ui/form-stepper';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  LocalSparePart,
  SparePartsSection,
  validateSparePartRows,
} from '@/components/estimates/spare-parts-section';
import {
  formatInvestigationId,
  InvestigationContext,
} from '@/components/investigations/investigation-context';
import { FormField } from '@/components/users/form-field';
import { useAuth } from '@/context/auth-context';
import {
  api,
  ApiError,
  Estimate,
  Investigation,
  JobCategory,
} from '@/lib/api';

const JOB_CATEGORY_OPTIONS = [
  { value: 'regular' as const, label: 'Regular' },
  { value: 'insurance' as const, label: 'Insurance' },
];

const STEPS: FormStep[] = [
  { id: 'investigation', label: 'Investigation', shortLabel: 'Review', icon: ClipboardList },
  { id: 'details', label: 'Estimate Details', shortLabel: 'Estimate', icon: Calculator },
  { id: 'parts', label: 'Spare Parts', shortLabel: 'Parts', icon: Package },
];

interface EstimateFormProps {
  investigationId: string;
  existingEstimate?: Estimate | null;
}

export function EstimateForm({
  investigationId,
  existingEstimate,
}: EstimateFormProps) {
  const router = useRouter();
  const { token } = useAuth();

  const [step, setStep] = useState(0);
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState('3');
  const [jobCategory, setJobCategory] = useState<JobCategory>('regular');
  const [lumpSumAmount, setLumpSumAmount] = useState('');
  const [spareParts, setSpareParts] = useState<LocalSparePart[]>([]);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [savedEstimateId, setSavedEstimateId] = useState<string | null>(null);

  const isEdit = Boolean(existingEstimate?.id);
  const isLastStep = step === STEPS.length - 1;

  const loadData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const inv = await api.getInvestigation(token, investigationId);
      setInvestigation(inv);

      if (existingEstimate?.id) {
        setEstimatedDeliveryDays(String(existingEstimate.estimatedDeliveryDays));
        setJobCategory(existingEstimate.jobCategory);
        setLumpSumAmount(
          existingEstimate.lumpSumAmount != null
            ? String(existingEstimate.lumpSumAmount)
            : '',
        );
        setSpareParts(
          (existingEstimate.spareParts ?? []).map((part) => ({
            localId: part.id,
            sparePartId: '',
            name: part.name,
            partNumber: part.partNumber ?? '',
            quantity: part.quantity,
            category: part.category,
          })),
        );
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load investigation');
    } finally {
      setIsLoading(false);
    }
  }, [token, investigationId, existingEstimate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const validateDetailsStep = () => {
    const days = Number(estimatedDeliveryDays);
    if (!days || days < 1) {
      setError('Estimated delivery must be at least 1 day.');
      return false;
    }
    if (jobCategory === 'insurance') {
      const lump = Number(lumpSumAmount);
      if (lumpSumAmount.trim() === '' || Number.isNaN(lump) || lump < 0) {
        setError('Enter a valid lump sum amount for insurance jobs.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const goNext = () => {
    if (step === 1 && !validateDetailsStep()) return;
    setError('');
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError('');
    setStep((current) => Math.max(current - 1, 0));
  };

  const saveEstimate = async () => {
    if (!token || !isLastStep) return;
    if (!validateDetailsStep()) {
      setStep(1);
      return;
    }

    const partsError = validateSparePartRows(spareParts);
    if (partsError) {
      setError(partsError);
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const days = Number(estimatedDeliveryDays);
      const payload = {
        estimatedDeliveryDays: days,
        jobCategory,
        lumpSumAmount:
          jobCategory === 'insurance' ? Number(lumpSumAmount) || 0 : null,
        spareParts: spareParts
          .filter((part) => part.sparePartId)
          .map((part) => ({
            name: part.name,
            partNumber: part.partNumber || undefined,
            quantity: part.quantity,
            category: part.category,
          })),
      };

      let savedId: string;
      if (isEdit && existingEstimate) {
        const updated = await api.updateEstimate(token, existingEstimate.id, payload);
        savedId = updated.id;
      } else {
        const created = await api.createEstimate(token, {
          investigationId,
          ...payload,
        });
        savedId = created.id;
      }

      setSavedEstimateId(savedId);
      setSuccessModalOpen(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save estimate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueToJobCard = () => {
    if (!savedEstimateId) return;
    setSuccessModalOpen(false);
    router.push(`/dashboard/job-cards/open?estimateId=${savedEstimateId}`);
  };

  const handleStayOnEstimates = () => {
    setSuccessModalOpen(false);
    router.push('/dashboard/estimates');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!investigation) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        {error || 'Investigation not found'}
      </div>
    );
  }

  return (
    <>
    <form
      onSubmit={(event) => event.preventDefault()}
      className="w-full space-y-4"
    >
      <div className="rounded-2xl border border-[var(--shell-border)] bg-gradient-to-br from-primary/5 via-card to-cyan-500/5 p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Workflow · Step 2 of 2
            </p>
            <h2 className="text-base font-bold tracking-tight">
              {isEdit ? 'Edit Estimate' : 'New Estimate'}
            </h2>
          </div>
          <span className="rounded-lg bg-primary/10 px-2 py-1 font-mono text-[10px] font-bold uppercase text-primary">
            {formatInvestigationId(investigationId)}
          </span>
        </div>
        <FormStepper
          steps={STEPS}
          currentStep={step}
          onStepClick={(index) => {
            if (index < step) setStep(index);
            if (index === 1 && step === 0) goNext();
            if (index === 2 && step <= 1) {
              if (step === 0) {
                setStep(1);
              } else if (validateDetailsStep()) {
                setStep(2);
              }
            }
          }}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="modern-card overflow-hidden rounded-2xl border border-[var(--shell-border)] bg-card shadow-sm">
        <div className="border-b border-[var(--shell-border)] bg-[var(--surface)]/40 px-4 py-2.5">
          <p className="text-xs font-semibold text-foreground">{STEPS[step].label}</p>
          <p className="text-[11px] text-muted-foreground">
            {step === 0 && 'Review customer and vehicle from the investigation.'}
            {step === 1 && 'Set delivery timeline and job category.'}
            {step === 2 && 'Add supplier and in-house spare parts.'}
          </p>
        </div>

        <div className="p-4">
          {step === 0 && (
            <InvestigationContext investigation={investigation} variant="flat" />
          )}

          {step === 1 && (
            <div className="space-y-3">
              <FormField label="Investigation ID" htmlFor="investigationId">
                <Input
                  id="investigationId"
                  value={formatInvestigationId(investigationId)}
                  disabled
                  className="h-9 font-mono text-xs uppercase"
                />
              </FormField>
              <FormField
                label="Delivery (days)"
                htmlFor="estimatedDeliveryDays"
              >
                <Input
                  id="estimatedDeliveryDays"
                  type="number"
                  min={1}
                  value={estimatedDeliveryDays}
                  onChange={(e) => setEstimatedDeliveryDays(e.target.value)}
                  className="h-9"
                  required
                />
              </FormField>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Job Category" htmlFor="jobCategory">
                  <SearchableSelect
                    id="jobCategory"
                    value={jobCategory}
                    onChange={(value) => {
                      setJobCategory(value);
                      if (value === 'regular') setLumpSumAmount('');
                    }}
                    options={JOB_CATEGORY_OPTIONS}
                    placeholder="Select category"
                    size="sm"
                  />
                </FormField>
                {jobCategory === 'insurance' && (
                  <FormField label="Lump Sum Amount" htmlFor="lumpSumAmount">
                    <Input
                      id="lumpSumAmount"
                      type="number"
                      min={0}
                      step="0.01"
                      value={lumpSumAmount}
                      onChange={(e) => setLumpSumAmount(e.target.value)}
                      placeholder="Insurance lump sum"
                      className="h-9"
                      required
                    />
                  </FormField>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <SparePartsSection parts={spareParts} onChange={setSpareParts} />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[var(--shell-border)] bg-[var(--surface)]/30 px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={goBack}
            disabled={step === 0}
            className={step === 0 ? 'invisible' : ''}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {isLastStep ? (
            <Button type="button" size="sm" disabled={isSubmitting} onClick={saveEstimate}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEdit ? 'Update' : 'Save Estimate'}
                </>
              )}
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={goNext}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </form>

    <AlertModal
      open={successModalOpen}
      onClose={handleStayOnEstimates}
      variant="success"
      title="Estimate Saved"
      description="Your estimate was saved. Continue to the job card to start workshop work."
      closeOnBackdrop={false}
      primaryAction={{
        label: 'Continue to Job Card',
        onClick: handleContinueToJobCard,
        icon: ClipboardList,
        className:
          'bg-gradient-to-br from-primary to-emerald-600 shadow-md shadow-primary/30 hover:brightness-105',
      }}
      secondaryAction={{
        label: 'Back to Estimates',
        onClick: handleStayOnEstimates,
      }}
    />
    </>
  );
}

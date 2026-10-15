'use client';

import { Car, UserRound } from 'lucide-react';
import { Accordion } from '@/components/ui/accordion';
import { BrandLogo } from '@/components/ui/brand-logo';
import { ColorSwatch } from '@/components/ui/color-swatch';
import { formatDisplayDate } from '@/components/ui/date-picker';
import { Investigation } from '@/lib/api';
import { cn } from '@/lib/utils';

export function formatInvestigationId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="truncate text-xs font-medium">{value}</dd>
    </div>
  );
}

interface InvestigationContextProps {
  investigation: Investigation;
  className?: string;
  defaultOpen?: boolean;
  variant?: 'accordion' | 'flat';
}

function InvestigationContextBody({ investigation }: { investigation: Investigation }) {
  const { customer, brand, model, color } = investigation;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg bg-[var(--surface)]/50 px-2.5 py-2">
        <UserRound className="h-3.5 w-3.5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold">{customer.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {customer.mobileNumber}
            {customer.vatTrnNumber ? ` · VAT ${customer.vatTrnNumber}` : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-[var(--surface)]/50 px-2.5 py-2">
        <Car className="h-3.5 w-3.5 shrink-0 text-primary" />
        <BrandLogo name={brand.name} logoUrl={brand.logoUrl} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold">
            {brand.name} {model.name}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ColorSwatch hexCode={color.hexCode} name={color.name} size="sm" />
            <span className="truncate">{color.name}</span>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
        <DetailItem label="Year" value={investigation.makeYear} />
        <DetailItem label="Plate" value={investigation.plateNo} />
        <DetailItem label="Chassis" value={investigation.chassisNumber} />
        <DetailItem label="Mileage" value={`${investigation.mileage.toLocaleString()} km`} />
        <DetailItem label="State" value={investigation.state} />
        <DetailItem
          label="Reg. expiry"
          value={formatDisplayDate(investigation.registrationExpiry)}
        />
        {customer.email && (
          <DetailItem label="Email" value={customer.email} className="col-span-2" />
        )}
        {customer.address && (
          <DetailItem label="Address" value={customer.address} className="col-span-2" />
        )}
      </dl>
    </div>
  );
}

export function InvestigationContext({
  investigation,
  className,
  defaultOpen = false,
  variant = 'accordion',
}: InvestigationContextProps) {
  const { customer, brand, model } = investigation;
  const summary = `${customer.name} · ${brand.name} ${model.name} · ${investigation.plateNo}`;

  if (variant === 'flat') {
    return (
      <div className={className}>
        <InvestigationContextBody investigation={investigation} />
      </div>
    );
  }

  return (
    <Accordion
      title="Investigation"
      summary={summary}
      className={className}
      compact
      defaultOpen={defaultOpen}
      badge={
        <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-primary">
          {formatInvestigationId(investigation.id)}
        </span>
      }
    >
      <InvestigationContextBody investigation={investigation} />
    </Accordion>
  );
}

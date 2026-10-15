'use client';

import { Accordion } from '@/components/ui/accordion';
import { BrandLogo } from '@/components/ui/brand-logo';
import { ColorSwatch } from '@/components/ui/color-swatch';
import { formatDisplayDate } from '@/components/ui/date-picker';
import { CarDamageDiagram } from '@/components/investigations/car-damage-diagram';
import { formatInvestigationId } from '@/components/investigations/investigation-context';
import { Investigation, getUploadOrigin } from '@/lib/api';

interface InvestigationFullContextProps {
  investigation: Investigation;
  defaultOpen?: boolean;
  /** Side-by-side damage map (left) and photos (right) on larger screens */
  mediaLayout?: 'stacked' | 'split';
}

export function InvestigationFullContext({
  investigation,
  defaultOpen = false,
  mediaLayout = 'stacked',
}: InvestigationFullContextProps) {
  const { customer, brand, model, color } = investigation;
  const origin = getUploadOrigin();
  const summary = `${customer.name} · ${brand.name} ${model.name} · ${investigation.plateNo}`;

  return (
    <Accordion
      title="Investigation details"
      summary={summary}
      compact
      defaultOpen={defaultOpen}
      badge={
        <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-primary">
          {formatInvestigationId(investigation.id)}
        </span>
      }
    >
      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Year</dt>
            <dd className="font-medium">{investigation.makeYear}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Plate</dt>
            <dd className="font-medium">{investigation.plateNo}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Chassis</dt>
            <dd className="font-medium">{investigation.chassisNumber}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Mileage</dt>
            <dd className="font-medium">{investigation.mileage.toLocaleString()} km</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase text-muted-foreground">State</dt>
            <dd className="font-medium">{investigation.state}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Reg. expiry</dt>
            <dd className="font-medium">{formatDisplayDate(investigation.registrationExpiry)}</dd>
          </div>
        </dl>

        <div className="flex items-center gap-2 rounded-lg bg-[var(--surface)]/50 px-3 py-2">
          <BrandLogo name={brand.name} logoUrl={brand.logoUrl} size="sm" />
          <div>
            <p className="text-sm font-semibold">
              {brand.name} {model.name}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ColorSwatch hexCode={color.hexCode} name={color.name} size="sm" />
              {color.name}
            </div>
          </div>
        </div>

        {investigation.note && (
          <p className="rounded-lg border border-[var(--shell-border)] bg-[var(--surface)]/30 px-3 py-2 text-xs">
            <span className="font-semibold text-muted-foreground">Note: </span>
            {investigation.note}
          </p>
        )}

        {mediaLayout === 'split' ? (
          <div className="grid gap-4 md:grid-cols-2 md:items-start">
            <div className="min-w-0 rounded-xl border border-[var(--shell-border)] bg-[var(--surface)]/30 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Damage map
              </p>
              <CarDamageDiagram selected={investigation.damagedZones} readOnly compact />
            </div>
            <div className="min-w-0 rounded-xl border border-[var(--shell-border)] bg-[var(--surface)]/30 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Photos
                {investigation.imageUrls?.length ? (
                  <span className="ml-1.5 font-normal normal-case text-muted-foreground/80">
                    ({investigation.imageUrls.length})
                  </span>
                ) : null}
              </p>
              {investigation.imageUrls?.length > 0 ? (
                <div className="grid max-h-[min(420px,55vh)] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {investigation.imageUrls.map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={url}
                      src={`${origin}${url}`}
                      alt="Investigation"
                      className="aspect-[4/3] w-full rounded-lg border border-[var(--shell-border)] object-cover"
                    />
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-xs text-muted-foreground">No photos uploaded</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Damage map
              </p>
              <CarDamageDiagram selected={investigation.damagedZones} readOnly compact />
            </div>

            {investigation.imageUrls?.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Photos
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {investigation.imageUrls.map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={url}
                      src={`${origin}${url}`}
                      alt="Investigation"
                      className="h-24 w-full rounded-lg border border-[var(--shell-border)] object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Accordion>
  );
}

'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { SparePartSearchSelect } from '@/components/estimates/spare-part-search-select';
import { SparePart, SparePartCategory } from '@/lib/api';

export interface LocalSparePart {
  localId: string;
  sparePartId: string;
  name: string;
  partNumber: string;
  quantity: number;
  category: SparePartCategory;
}

const CATEGORY_OPTIONS = [
  { value: 'supplier' as const, label: 'Supplier' },
  { value: 'in-house' as const, label: 'In-House' },
];

export function createEmptySparePartRow(
  category: SparePartCategory = 'supplier',
): LocalSparePart {
  return {
    localId: crypto.randomUUID(),
    sparePartId: '',
    name: '',
    partNumber: '',
    quantity: 1,
    category,
  };
}

export function validateSparePartRows(parts: LocalSparePart[]): string | null {
  const incomplete = parts.filter((part) => !part.sparePartId);
  if (incomplete.length > 0) {
    return 'Select a spare part from the catalog for each row, or remove empty rows.';
  }

  const ids = parts.map((part) => part.sparePartId);
  const unique = new Set(ids);
  if (unique.size !== ids.length) {
    return 'Each spare part can only be added once. Increase quantity instead.';
  }

  return null;
}

interface SparePartsSectionProps {
  parts: LocalSparePart[];
  onChange: (parts: LocalSparePart[]) => void;
}

export function SparePartsSection({ parts, onChange }: SparePartsSectionProps) {
  const usedPartIds = parts
    .map((part) => part.sparePartId)
    .filter(Boolean) as string[];

  const updateRow = (localId: string, patch: Partial<LocalSparePart>) => {
    onChange(
      parts.map((part) => (part.localId === localId ? { ...part, ...patch } : part)),
    );
  };

  const removeRow = (localId: string) => {
    onChange(parts.filter((part) => part.localId !== localId));
  };

  const addRow = () => {
    onChange([...parts, createEmptySparePartRow()]);
  };

  const handlePartSelect = (localId: string, catalogPart: SparePart) => {
    updateRow(localId, {
      sparePartId: catalogPart.id,
      name: catalogPart.name,
      partNumber: catalogPart.partNumber ?? '',
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Add rows and pick parts from the master catalog only.
        </p>
        <span className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {parts.length} row{parts.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--shell-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--shell-border)] bg-[var(--surface)]/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="min-w-[220px] px-3 py-2.5 font-semibold">Spare part</th>
              <th className="w-32 px-3 py-2.5 font-semibold">Part no.</th>
              <th className="w-20 px-3 py-2.5 font-semibold">Qty</th>
              <th className="w-36 px-3 py-2.5 font-semibold">Source</th>
              <th className="w-12 px-2 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {parts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-10 text-center text-xs text-muted-foreground"
                >
                  No spare parts yet. Click &quot;Add row&quot; to begin.
                </td>
              </tr>
            ) : (
              parts.map((part) => (
                <tr
                  key={part.localId}
                  className="border-b border-[var(--shell-border)] last:border-0 align-top"
                >
                  <td className="px-3 py-2.5">
                    <SparePartSearchSelect
                      id={`spare-part-${part.localId}`}
                      value={part.sparePartId}
                      displayLabel={part.name || undefined}
                      disabledPartIds={usedPartIds}
                      onChange={(catalogPart) =>
                        handlePartSelect(part.localId, catalogPart)
                      }
                    />
                  </td>
                  <td className="px-3 py-2.5 pt-3.5 text-muted-foreground">
                    {part.partNumber || '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <Input
                      type="number"
                      min={1}
                      value={part.quantity}
                      onChange={(e) =>
                        updateRow(part.localId, {
                          quantity: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                      className="h-9"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <SearchableSelect
                      value={part.category}
                      onChange={(value) => updateRow(part.localId, { category: value })}
                      options={CATEGORY_OPTIONS}
                      placeholder="Source"
                      size="sm"
                    />
                  </td>
                  <td className="px-2 py-2.5">
                    <button
                      type="button"
                      onClick={() => removeRow(part.localId)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Button type="button" variant="secondary" size="sm" onClick={addRow}>
        <Plus className="h-4 w-4" />
        Add row
      </Button>
    </div>
  );
}

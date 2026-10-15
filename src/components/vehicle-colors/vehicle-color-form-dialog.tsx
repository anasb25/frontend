'use client';

import { useEffect, useState } from 'react';
import { Loader2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ColorSwatch } from '@/components/ui/color-swatch';
import {
  Modal,
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/users/form-field';
import { ApiError, CreateVehicleColorPayload, VehicleColor } from '@/lib/api';

interface VehicleColorFormDialogProps {
  open: boolean;
  onClose: () => void;
  editing?: VehicleColor | null;
  onSubmit: (payload: CreateVehicleColorPayload) => Promise<void>;
}

function normalizeHex(value: string) {
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed.toUpperCase()}`;
  return trimmed;
}

export function VehicleColorFormDialog({
  open,
  onClose,
  editing,
  onSubmit,
}: VehicleColorFormDialogProps) {
  const [name, setName] = useState('');
  const [hexCode, setHexCode] = useState('#0A0A0A');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(editing);

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? '');
    setHexCode(editing?.hexCode ?? '#0A0A0A');
    setError('');
  }, [open, editing]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const normalizedHex = normalizeHex(hexCode);

    if (!trimmedName) {
      setError('Color name is required.');
      return;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(normalizedHex)) {
      setError('Pick a valid color (hex like #000000).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: trimmedName, hexCode: normalizedHex });
      handleClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save vehicle color');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>{isEditing ? 'Edit Vehicle Color' : 'Add Vehicle Color'}</ModalTitle>
          <ModalDescription>
            Maintain the color catalog used when registering vehicles.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-5">
          <FormField label="Color Name" htmlFor="colorName" icon={<Palette className="h-4 w-4" />}>
            <Input
              id="colorName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pearl White, Midnight Black..."
              className="pl-10"
              required
            />
          </FormField>

          <FormField label="Color" htmlFor="hexCode">
            <div className="flex items-center gap-3">
              <label
                htmlFor="hexPicker"
                className="relative flex h-11 w-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-[var(--input-border)] bg-input shadow-sm"
              >
                <input
                  id="hexPicker"
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/.test(hexCode) ? hexCode : '#0A0A0A'}
                  onChange={(e) => setHexCode(e.target.value.toUpperCase())}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <ColorSwatch hexCode={hexCode} name={name || 'Selected color'} size="lg" />
              </label>
              <Input
                id="hexCode"
                value={hexCode}
                onChange={(e) => setHexCode(e.target.value)}
                placeholder="#000000"
                className="font-mono uppercase"
                maxLength={7}
                required
              />
            </div>
          </FormField>

          <div className="flex items-center gap-2 rounded-xl border border-[var(--shell-border)] bg-[var(--surface)]/50 px-3 py-2.5 text-sm">
            <ColorSwatch hexCode={hexCode} name={name || 'Preview'} size="md" />
            <span className="font-medium text-foreground">{name.trim() || 'Color preview'}</span>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Add Color'
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

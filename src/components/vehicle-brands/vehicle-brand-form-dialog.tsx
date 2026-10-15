'use client';

import { useEffect, useState } from 'react';
import { Car, ImageIcon, Loader2, Tag } from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Button } from '@/components/ui/button';
import {
  Modal,
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/users/form-field';
import {
  ActiveStatus,
  ApiError,
  CreateVehicleBrandPayload,
  VehicleBrand,
} from '@/lib/api';

const STATUS_OPTIONS = [
  { value: 'active' as ActiveStatus, label: 'Active' },
  { value: 'inactive' as ActiveStatus, label: 'Inactive' },
];

interface VehicleBrandFormDialogProps {
  open: boolean;
  onClose: () => void;
  editing?: VehicleBrand | null;
  onSubmit: (payload: CreateVehicleBrandPayload) => Promise<void>;
}

export function VehicleBrandFormDialog({
  open,
  onClose,
  editing,
  onSubmit,
}: VehicleBrandFormDialogProps) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<ActiveStatus | ''>('active');
  const [logoUrl, setLogoUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(editing);

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? '');
    setStatus(editing?.status ?? 'active');
    setLogoUrl(editing?.logoUrl ?? '');
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
    if (!trimmedName || !status) {
      setError('Brand name and status are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        status,
        logoUrl: logoUrl.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save vehicle brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>{isEditing ? 'Edit Vehicle Brand' : 'Add Vehicle Brand'}</ModalTitle>
          <ModalDescription>
            Define vehicle manufacturers used across models and service records.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-[var(--shell-border)] bg-[var(--surface)]/50 px-3 py-3">
            <BrandLogo name={name || 'Brand'} logoUrl={logoUrl || null} size="xl" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {name.trim() || 'Brand preview'}
              </p>
              <p className="text-xs text-muted-foreground">Logo preview</p>
            </div>
          </div>

          <FormField label="Brand Name" htmlFor="brandName" icon={<Car className="h-4 w-4" />}>
            <Input
              id="brandName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Toyota, BMW, Mercedes..."
              className="pl-10"
              required
            />
          </FormField>

          <FormField
            label="Logo URL"
            htmlFor="logoUrl"
            hint="Optional. Use /brands/slug.png for local logos."
            icon={<ImageIcon className="h-4 w-4" />}
          >
            <Input
              id="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="/brands/toyota.png"
              className="pl-10"
            />
          </FormField>

          <FormField label="Status" htmlFor="brandStatus" icon={<Tag className="h-4 w-4" />}>
            <Select
              id="brandStatus"
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS}
              placeholder="Select status"
            />
          </FormField>

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
              isEditing ? 'Save Changes' : 'Add Brand'
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

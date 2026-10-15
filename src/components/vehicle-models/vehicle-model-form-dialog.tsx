'use client';

import { useEffect, useMemo, useState } from 'react';
import { Car, Loader2 } from 'lucide-react';
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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { FormField } from '@/components/users/form-field';
import {
  ApiError,
  CreateVehicleModelPayload,
  VehicleBrand,
  VehicleModel,
} from '@/lib/api';

interface VehicleModelFormDialogProps {
  open: boolean;
  onClose: () => void;
  brands: VehicleBrand[];
  editing?: VehicleModel | null;
  onSubmit: (payload: CreateVehicleModelPayload) => Promise<void>;
}

export function VehicleModelFormDialog({
  open,
  onClose,
  brands,
  editing,
  onSubmit,
}: VehicleModelFormDialogProps) {
  const [brandId, setBrandId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(editing);

  const brandOptions = useMemo(
    () =>
      brands.map((brand) => ({
        value: brand.id,
        label: brand.name,
        description: brand.status === 'inactive' ? 'Inactive brand' : undefined,
        disabled: brand.status === 'inactive' && brand.id !== editing?.brandId,
        icon: (
          <BrandLogo name={brand.name} logoUrl={brand.logoUrl} size="xs" />
        ),
      })),
    [brands, editing?.brandId],
  );

  useEffect(() => {
    if (!open) return;
    setBrandId(editing?.brandId ?? brands.find((b) => b.status === 'active')?.id ?? '');
    setName(editing?.name ?? '');
    setError('');
  }, [open, editing, brands]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!brandId || !trimmedName) {
      setError('Brand and model name are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ brandId, name: trimmedName });
      handleClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save vehicle model');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>{isEditing ? 'Edit Vehicle Model' : 'Add Vehicle Model'}</ModalTitle>
          <ModalDescription>
            Link a model to its manufacturer for accurate vehicle records.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-5">
          <FormField label="Brand" htmlFor="modelBrand">
            <SearchableSelect
              id="modelBrand"
              value={brandId}
              onChange={setBrandId}
              options={brandOptions}
              placeholder="Search and select brand"
              searchPlaceholder="Search brands..."
            />
          </FormField>

          <FormField label="Model Name" htmlFor="modelName" icon={<Car className="h-4 w-4" />}>
            <Input
              id="modelName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Camry, X5, C-Class..."
              className="pl-10"
              required
            />
          </FormField>

          {brands.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Add at least one active vehicle brand before creating models.
            </p>
          )}

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
          <Button type="submit" disabled={isSubmitting || brands.length === 0}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Add Model'
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

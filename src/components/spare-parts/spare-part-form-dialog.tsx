'use client';

import { useEffect, useState } from 'react';
import { Loader2, Package } from 'lucide-react';
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
import { FormField } from '@/components/users/form-field';
import { ApiError, CreateSparePartPayload, SparePart } from '@/lib/api';

interface SparePartFormDialogProps {
  open: boolean;
  onClose: () => void;
  editing?: SparePart | null;
  onSubmit: (payload: CreateSparePartPayload) => Promise<void>;
}

export function SparePartFormDialog({
  open,
  onClose,
  editing,
  onSubmit,
}: SparePartFormDialogProps) {
  const [name, setName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(editing);

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? '');
    setPartNumber(editing?.partNumber ?? '');
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
    if (!trimmedName) {
      setError('Part name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        partNumber: partNumber.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save spare part');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>{isEditing ? 'Edit Spare Part' : 'Add Spare Part'}</ModalTitle>
          <ModalDescription>
            Catalog entries are name only. Supplier or in-house is chosen when adding parts to an
            estimate.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-5">
          <FormField label="Part Name" htmlFor="sparePartName" icon={<Package className="h-4 w-4" />}>
            <Input
              id="sparePartName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Front bumper, headlight..."
              className="pl-10"
              required
            />
          </FormField>

          <FormField label="Part Number" htmlFor="sparePartNumber">
            <Input
              id="sparePartNumber"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              placeholder="Optional OEM / SKU"
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
              isEditing ? 'Save Changes' : 'Add Part'
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

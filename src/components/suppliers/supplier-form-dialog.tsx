'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Smartphone,
  Truck,
} from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/users/form-field';
import { ApiError, CreateSupplierPayload, Supplier } from '@/lib/api';

interface SupplierFormDialogProps {
  open: boolean;
  onClose: () => void;
  editing?: Supplier | null;
  onSubmit: (payload: CreateSupplierPayload) => Promise<void>;
}

export function SupplierFormDialog({
  open,
  onClose,
  editing,
  onSubmit,
}: SupplierFormDialogProps) {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [trnNumber, setTrnNumber] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(editing);

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? '');
    setMobileNumber(editing?.mobileNumber ?? '');
    setTrnNumber(editing?.trnNumber ?? '');
    setAddress(editing?.address ?? '');
    setEmail(editing?.email ?? '');
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
    const trimmedMobile = mobileNumber.trim();
    const trimmedTrn = trnNumber.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName || !trimmedMobile || !trimmedTrn || !trimmedAddress) {
      setError('Name, mobile number, TRN number, and address are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        mobileNumber: trimmedMobile,
        trnNumber: trimmedTrn,
        address: trimmedAddress,
        email: email.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save supplier');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>{isEditing ? 'Edit Supplier' : 'Add Supplier'}</ModalTitle>
          <ModalDescription>
            Register spare parts suppliers with contact and tax details.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-5">
          <FormField label="Supplier Name" htmlFor="supplierName" icon={<Truck className="h-4 w-4" />}>
            <Input
              id="supplierName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Company or vendor name"
              className="pl-10"
              required
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Mobile Number" htmlFor="supplierMobile" icon={<Smartphone className="h-4 w-4" />}>
              <Input
                id="supplierMobile"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+971..."
                className="pl-10"
                required
              />
            </FormField>

            <FormField label="TRN Number" htmlFor="supplierTrn" icon={<Hash className="h-4 w-4" />}>
              <Input
                id="supplierTrn"
                value={trnNumber}
                onChange={(e) => setTrnNumber(e.target.value)}
                placeholder="Tax registration number"
                className="pl-10"
                required
              />
            </FormField>
          </div>

          <FormField label="Email" htmlFor="supplierEmail" icon={<Mail className="h-4 w-4" />}>
            <Input
              id="supplierEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Optional"
              className="pl-10"
            />
          </FormField>

          <FormField label="Address" htmlFor="supplierAddress" icon={<MapPin className="h-4 w-4" />}>
            <Textarea
              id="supplierAddress"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, emirate..."
              className="min-h-[88px] pl-10"
              required
            />
          </FormField>

          <div className="flex items-center gap-2 rounded-xl border border-[var(--shell-border)] bg-[var(--surface)]/50 px-3 py-2.5 text-xs text-muted-foreground">
            <Building2 className="h-4 w-4 shrink-0" />
            Used when sourcing supplier spare parts on estimates.
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
              isEditing ? 'Save Changes' : 'Add Supplier'
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

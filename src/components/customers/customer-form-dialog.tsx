'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  Hash,
  Loader2,
  Mail,
  Phone,
  Smartphone,
  UserRound,
  UserPlus,
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
import { ApiError, Customer, CreateCustomerPayload } from '@/lib/api';

interface CustomerFormDialogProps {
  open: boolean;
  onClose: () => void;
  editing?: Customer | null;
  onSubmit: (payload: CreateCustomerPayload) => Promise<void>;
}

export function CustomerFormDialog({
  open,
  onClose,
  editing,
  onSubmit,
}: CustomerFormDialogProps) {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [vatTrnNumber, setVatTrnNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [crtnNumber, setCrtnNumber] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(editing);

  useEffect(() => {
    if (!open) return;

    setName(editing?.name ?? '');
    setMobileNumber(editing?.mobileNumber ?? '');
    setVatTrnNumber(editing?.vatTrnNumber ?? '');
    setEmail(editing?.email ?? '');
    setPhoneNumber(editing?.phoneNumber ?? '');
    setCrtnNumber(editing?.crtnNumber ?? '');
    setAddress(editing?.address ?? '');
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
    const trimmedVat = vatTrnNumber.trim();

    if (!trimmedName || !trimmedMobile || !trimmedVat) {
      setError('Name, mobile number, and VAT TRN # are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        mobileNumber: trimmedMobile,
        vatTrnNumber: trimmedVat,
        email: email.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        crtnNumber: crtnNumber.trim() || undefined,
        address: address.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>{isEditing ? 'Edit Customer' : 'Add New Customer'}</ModalTitle>
          <ModalDescription>
            {isEditing
              ? 'Update customer contact and billing details.'
              : 'Register a customer with required billing and contact information.'}
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-5">
          <FormField
            label="Customer Name *"
            htmlFor="customerName"
            icon={<UserRound className="h-4 w-4" />}
          >
            <Input
              id="customerName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Customer full name"
              className="pl-10"
              required
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Mobile Number *"
              htmlFor="mobileNumber"
              icon={<Smartphone className="h-4 w-4" />}
            >
              <Input
                id="mobileNumber"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+971 50 123 4567"
                className="pl-10"
                required
              />
            </FormField>

            <FormField
              label="VAT TRN # *"
              htmlFor="vatTrnNumber"
              icon={<Hash className="h-4 w-4" />}
            >
              <Input
                id="vatTrnNumber"
                value={vatTrnNumber}
                onChange={(e) => setVatTrnNumber(e.target.value)}
                placeholder="VAT registration number"
                className="pl-10"
                required
              />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Email" htmlFor="email" icon={<Mail className="h-4 w-4" />}>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@email.com"
                className="pl-10"
              />
            </FormField>

            <FormField label="Phone Number" htmlFor="phoneNumber" icon={<Phone className="h-4 w-4" />}>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Landline number"
                className="pl-10"
              />
            </FormField>
          </div>

          <FormField label="CRTN #" htmlFor="crtnNumber" icon={<Building2 className="h-4 w-4" />}>
            <Input
              id="crtnNumber"
              value={crtnNumber}
              onChange={(e) => setCrtnNumber(e.target.value)}
              placeholder="Commercial registration / tax number"
              className="pl-10"
            />
          </FormField>

          <FormField label="Address" htmlFor="address">
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, emirate"
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
              <>
                <UserPlus className="h-4 w-4" />
                {isEditing ? 'Save Changes' : 'Add Customer'}
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

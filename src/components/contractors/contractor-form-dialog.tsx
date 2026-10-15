'use client';

import { useEffect, useState } from 'react';
import { Building2, Loader2 } from 'lucide-react';
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
import { ApiError, Contractor, CreateContractorPayload } from '@/lib/api';

interface ContractorFormDialogProps {
  open: boolean;
  onClose: () => void;
  editing?: Contractor | null;
  onSubmit: (payload: CreateContractorPayload) => Promise<void>;
}

export function ContractorFormDialog({
  open,
  onClose,
  editing,
  onSubmit,
}: ContractorFormDialogProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? '');
    setError('');
  }, [open, editing]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Contractor name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ name: trimmed });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save contractor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>{editing ? 'Edit Contractor' : 'Add Contractor'}</ModalTitle>
          <ModalDescription>
            Insurance contractors used on job cards when job category is insurance.
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <FormField label="Company Name" htmlFor="contractorName" icon={<Building2 className="h-4 w-4" />}>
            <Input
              id="contractorName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10"
              required
            />
          </FormField>
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? 'Save' : 'Add'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

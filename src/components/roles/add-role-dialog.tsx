'use client';

import { useState } from 'react';
import { FileText, Loader2, ShieldPlus, Tag } from 'lucide-react';
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
import { ApiError } from '@/lib/api';
import { formatRoleKey } from '@/lib/user-ui';

export interface CreateRolePayload {
  name: string;
  label: string;
  description: string;
}

interface AddRoleDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateRolePayload) => Promise<void>;
}

export function AddRoleDialog({
  open,
  onClose,
  onSubmit,
}: AddRoleDialogProps) {
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setLabel('');
    setDescription('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLabelChange = (value: string) => {
    setLabel(value);
    if (!name || name === formatRoleKey(label)) {
      const generated = value
        .trim()
        .split(/\s+/)
        .map((part, index) =>
          index === 0
            ? part.toLowerCase()
            : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
        )
        .join('')
        .replace(/[^a-zA-Z0-9]/g, '');
      setName(formatRoleKey(generated));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const roleKey = formatRoleKey(name);
    if (roleKey.length < 3) {
      setError('Role key must be at least 3 characters (camelCase).');
      return;
    }

    if (!/^[a-z][a-zA-Z0-9]*$/.test(roleKey)) {
      setError('Role key must start with a lowercase letter and use camelCase.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: roleKey,
        label: label.trim(),
        description: description.trim(),
      });
      handleClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to create role',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>Add New Role</ModalTitle>
          <ModalDescription>
            Create a role with a display name and system key for user assignments.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-5">
          <FormField
            label="Display Name"
            htmlFor="roleLabel"
            icon={<Tag className="h-4 w-4" />}
          >
            <Input
              id="roleLabel"
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="Workshop Lead"
              className="pl-10"
              required
              minLength={2}
            />
          </FormField>

          <FormField
            label="Role Key"
            htmlFor="roleName"
            hint="camelCase identifier used in the system (e.g. workshopLead)"
            icon={<ShieldPlus className="h-4 w-4" />}
          >
            <Input
              id="roleName"
              value={name}
              onChange={(e) => setName(formatRoleKey(e.target.value))}
              placeholder="workshopLead"
              className="pl-10 font-mono text-sm"
              required
              minLength={3}
            />
          </FormField>

          <FormField
            label="Description"
            htmlFor="roleDescription"
            icon={<FileText className="h-4 w-4" />}
          >
            <Input
              id="roleDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What access does this role provide?"
              className="pl-10"
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
                Creating...
              </>
            ) : (
              <>
                <ShieldPlus className="h-4 w-4" />
                Create Role
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

'use client';

import { useState } from 'react';
import { Loader2, Lock, User, UserPlus, UserRound } from 'lucide-react';
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
import { RoleSelect } from '@/components/users/role-select';
import { UserRole } from '@/lib/auth';
import { ApiError, Role } from '@/lib/api';

export interface CreateUserPayload {
  username: string;
  password: string;
  fullName: string;
  roleName: UserRole;
}

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  roles: Role[];
  onSubmit: (payload: CreateUserPayload) => Promise<void>;
}

export function AddUserDialog({
  open,
  onClose,
  roles,
  onSubmit,
}: AddUserDialogProps) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState<UserRole | ''>(
    roles.find((r) => r.name === 'basicUser')?.name ?? '',
  );
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setUsername('');
    setFullName('');
    setPassword('');
    setRoleName(roles.find((r) => r.name === 'basicUser')?.name ?? '');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!roleName) {
      setError('Please select a role for the new user.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        username: username.trim(),
        password,
        fullName: fullName.trim() || username.trim(),
        roleName,
      });
      handleClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to create user',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>Add New User</ModalTitle>
          <ModalDescription>
            Create an account and assign a role for garage system access.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Full Name"
              htmlFor="fullName"
              icon={<UserRound className="h-4 w-4" />}
            >
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                className="pl-10"
              />
            </FormField>

            <FormField
              label="Username"
              htmlFor="username"
              icon={<User className="h-4 w-4" />}
            >
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johnsmith"
                className="pl-10"
                required
                minLength={3}
              />
            </FormField>
          </div>

          <FormField
            label="Password"
            htmlFor="password"
            hint="Minimum 6 characters"
            icon={<Lock className="h-4 w-4" />}
          >
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              className="pl-10"
              required
              minLength={6}
            />
          </FormField>

          <FormField label="Role" htmlFor="role">
            <RoleSelect
              id="role"
              roles={roles}
              value={roleName}
              onChange={setRoleName}
              placeholder="Choose a role"
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
                <UserPlus className="h-4 w-4" />
                Create User
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

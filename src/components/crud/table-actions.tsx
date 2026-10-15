'use client';

import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TableActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  editLabel?: string;
  deleteLabel?: string;
}

export function TableActions({
  onEdit,
  onDelete,
  isDeleting,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
}: TableActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg"
        onClick={onEdit}
        title={editLabel}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={onDelete}
        disabled={isDeleting}
        title={deleteLabel}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

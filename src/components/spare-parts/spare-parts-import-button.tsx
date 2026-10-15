'use client';

import { useRef, useState } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError, SparePartImportResult } from '@/lib/api';

interface SparePartsImportButtonProps {
  disabled?: boolean;
  onImport: (file: File) => Promise<SparePartImportResult>;
  onComplete: (result: SparePartImportResult) => void;
  onError: (message: string) => void;
}

export function SparePartsImportButton({
  disabled,
  onImport,
  onComplete,
  onError,
}: SparePartsImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handlePickFile = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !['xlsx', 'xls', 'csv'].includes(extension)) {
      onError('Please choose an Excel file (.xlsx, .xls) or CSV.');
      return;
    }

    setIsImporting(true);
    try {
      const result = await onImport(file);
      onComplete(result);
    } catch (err) {
      if (err instanceof ApiError) {
        onError(err.message);
        return;
      }
      if (err instanceof TypeError) {
        onError(
          'Could not reach the server. Check that the backend is running and try again.',
        );
        return;
      }
      onError('Failed to import spare parts');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handlePickFile}
        disabled={disabled || isImporting}
      >
        {isImporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <FileSpreadsheet className="h-4 w-4" />
            Import Excel
          </>
        )}
      </Button>
    </>
  );
}

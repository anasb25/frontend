'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useAuth } from '@/context/auth-context';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { api, SparePart } from '@/lib/api';

interface SparePartSearchSelectProps {
  value: string;
  displayLabel?: string;
  onChange: (part: SparePart) => void;
  disabled?: boolean;
  disabledPartIds?: string[];
  id?: string;
}

export function SparePartSearchSelect({
  value,
  displayLabel,
  onChange,
  disabled,
  disabledPartIds = [],
  id,
}: SparePartSearchSelectProps) {
  const { token } = useAuth();
  const [catalog, setCatalog] = useState<SparePart[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 250);
  const [isLoading, setIsLoading] = useState(false);

  const loadCatalog = useCallback(
    async (search: string) => {
      if (!token) return;
      setIsLoading(true);
      try {
        const result = await api.getSpareParts(token, {
          page: 1,
          limit: 100,
          search: search.trim() || undefined,
        });
        setCatalog(result.data);
      } catch {
        setCatalog([]);
      } finally {
        setIsLoading(false);
      }
    },
    [token],
  );

  const handleSearchQueryChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    [],
  );

  useEffect(() => {
    loadCatalog(debouncedSearch);
  }, [debouncedSearch, loadCatalog]);

  const options = useMemo(
    () =>
      catalog.map((part) => ({
        value: part.id,
        label: part.name,
        description: part.partNumber || undefined,
        disabled: disabledPartIds.includes(part.id) && part.id !== value,
      })),
    [catalog, disabledPartIds, value],
  );

  const handleChange = (partId: string) => {
    const part = catalog.find((item) => item.id === partId);
    if (part) onChange(part);
  };

  return (
    <SearchableSelect
      id={id}
      value={value}
      onChange={handleChange}
      options={options}
      placeholder="Select spare part..."
      searchPlaceholder="Search catalog..."
      displayLabel={value ? undefined : displayLabel}
      disabled={disabled}
      size="sm"
      remoteSearch
      onSearchQueryChange={handleSearchQueryChange}
      isLoadingOptions={isLoading}
      emptyMessage={
        debouncedSearch.trim()
          ? 'No matching parts in catalog.'
          : 'Type to search the spare parts catalog.'
      }
    />
  );
}

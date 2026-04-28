'use client';

import { useState, useCallback, useMemo } from 'react';
import { SearchState } from '@/app/types/store-types';

export interface AcfDistributor {
  name: string;
  city?: string;
  state?: string;
  phone?: string;
  address?: string;
  email?: string;
  coverage_area?: string;
}

interface UseDistributorSearchReturn {
  searchState: SearchState;
  filteredDistributors: AcfDistributor[];
  total: number;
  selectedState: string;
  search: (uf: string) => void;
  reset: () => void;
}

export function useDistributorSearch(distributors: AcfDistributor[] = []): UseDistributorSearchReturn {
  const [selectedState, setSelectedState] = useState('');
  const [searchState, setSearchState] = useState<SearchState>('idle');

  const filteredDistributors = useMemo(() => {
    if (!selectedState) return [];
    return distributors.filter(d => d.state?.toUpperCase() === selectedState.toUpperCase());
  }, [distributors, selectedState]);

  const search = useCallback((uf: string) => {
    if (!uf) {
      setSearchState('idle');
      setSelectedState('');
      return;
    }

    setSelectedState(uf);
    const filtered = distributors.filter(d => d.state?.toUpperCase() === uf.toUpperCase());
    setSearchState(filtered.length > 0 ? 'results' : 'no-results');
  }, [distributors]);

  const reset = useCallback(() => {
    setSearchState('idle');
    setSelectedState('');
  }, []);

  return {
    searchState,
    filteredDistributors,
    total: filteredDistributors.length,
    selectedState,
    search,
    reset,
  };
}

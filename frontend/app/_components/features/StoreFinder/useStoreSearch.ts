'use client';

import { useState, useCallback } from 'react';
import { Store, StoreSearchResult, SearchState } from '@/app/types/store-types';
import { geocodeCep } from './cep-utils';
import { wordpressAPI } from '@/app/lib/wordpress-api';

interface UseStoreSearchReturn {
  state: SearchState;
  stores: Store[];
  total: number;
  center: { lat: number; lng: number } | null;
  selectedStore: Store | null;
  errorMessage: string | null;
  search: (cep: string, vehicleType?: string) => Promise<void>;
  selectStore: (store: Store) => void;
  reset: () => void;
}

export function useStoreSearch(): UseStoreSearchReturn {
  const [state, setState] = useState<SearchState>('idle');
  const [stores, setStores] = useState<Store[]>([]);
  const [total, setTotal] = useState(0);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const search = useCallback(async (cep: string, vehicleType?: string) => {
    setState('loading');
    setErrorMessage(null);
    setSelectedStore(null);

    try {
      // Step 1: Geocode the CEP
      const geoResult = await geocodeCep(cep);

      if (!geoResult) {
        setState('error');
        setErrorMessage('CEP não encontrado. Verifique o CEP digitado.');
        return;
      }

      const { lat, lng } = geoResult;
      setCenter({ lat, lng });

      // Step 2: Search for stores near the location via WordPress/Salesforce
      let result = await wordpressAPI.getStores(lat, lng, 30, vehicleType || undefined, cep);

      // Fallback: if a vehicle type filter returned no results, retry without filter
      if (vehicleType && result && result.stores.length === 0) {
        const fallback = await wordpressAPI.getStores(lat, lng, 30, undefined, cep);
        if (fallback && fallback.stores.length > 0) {
          result = fallback;
        }
      }

      if (!result) {
        setState('error');
        setErrorMessage('Erro ao buscar lojas. Tente novamente.');
        return;
      }

      setStores(result.stores);
      setTotal(result.total);

      if (result.stores.length === 0) {
        setState('no-results');
      } else {
        setState('results');
        // Auto-select first store
        setSelectedStore(result.stores[0]);
      }
    } catch (error) {
      console.error('Store search error:', error);
      setState('error');
      setErrorMessage('Ocorreu um erro inesperado. Tente novamente.');
    }
  }, []);

  const selectStore = useCallback((store: Store) => {
    setSelectedStore(store);
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setStores([]);
    setTotal(0);
    setCenter(null);
    setSelectedStore(null);
    setErrorMessage(null);
  }, []);

  return {
    state,
    stores,
    total,
    center,
    selectedStore,
    errorMessage,
    search,
    selectStore,
    reset,
  };
}

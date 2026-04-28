'use client';

import React, { useState } from 'react';
import { Store } from '@/app/types/store-types';
import StoreCard from './StoreCard';

interface StoreListProps {
  stores: Store[];
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
  total: number;
  hideHeader?: boolean;
}

const INITIAL_VISIBLE = 6;
const LOAD_MORE_COUNT = 6;

export default function StoreList({
  stores,
  selectedStore,
  onSelectStore,
  total,
  hideHeader = false
}: StoreListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const visibleStores = stores.slice(0, visibleCount);
  const hasMore = visibleCount < stores.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, stores.length));
  };

  return (
    <div className="flex flex-col">
      {/* Header - optional */}
      {!hideHeader && (
        <div className="mb-4">
          <p className="text-dark-blue font-medium text-base">
            <span className="text-red">{total}</span>{' '}
            {total === 1 ? 'loja encontrada' : 'lojas encontradas'}
          </p>
        </div>
      )}

      {/* Store cards */}
      <div className="flex flex-col bg-white border border-[#E5E7EB] rounded-lg overflow-hidden max-h-[450px] overflow-y-auto custom-scrollbar">
        {visibleStores.map((store, index) => (
          <StoreCard
            key={store.id}
            store={store}
            isSelected={selectedStore?.id === store.id}
            onSelect={onSelectStore}
            isLast={index === visibleStores.length - 1}
          />
        ))}
      </div>

      {/* Load more button - Outlined style */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="w-full max-w-[280px] py-3 px-6 border border-dark-blue text-dark-blue font-medium text-sm rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            Ver Mais
          </button>
        </div>
      )}
    </div>
  );
}

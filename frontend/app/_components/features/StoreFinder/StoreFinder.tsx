'use client';

import React from 'react';
import { Store } from '@/app/types/store-types';
import { useStoreSearch } from './useStoreSearch';
import StoreSearchForm from './StoreSearchForm';
import StoreList from './StoreList';
import StoreCard from './StoreCard';
import StoreMap from './StoreMap';
import StoreEmptyState from './StoreEmptyState';

function SelectedStoreCard({ store }: { store: Store }) {
  const displayName = store.fantasyName || store.name;
  const fullAddress = [store.address, store.city, store.state].filter(Boolean).join(' - ');
  const hasCoords = store.lat != null && store.lng != null && store.lat !== 0 && store.lng !== 0;
  const directionsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 mt-3">
      <h4 className="text-dark-blue font-semibold text-sm md:text-base mb-2">{displayName}</h4>
      {fullAddress && (
        <p className="text-medium-gray text-xs md:text-sm mb-1">{fullAddress}</p>
      )}
      {store.phone && (
        <p className="text-medium-gray text-xs md:text-sm mb-3">{store.phone}</p>
      )}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-red text-white text-sm font-medium rounded hover:bg-red/90 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" fill="currentColor" />
        </svg>
        Como chegar
      </a>
    </div>
  );
}

export default function StoreFinder() {
  const {
    state,
    stores,
    total,
    center,
    selectedStore,
    errorMessage,
    search,
    selectStore,
  } = useStoreSearch();

  const handleSearch = async (cep: string, vehicleType: string) => {
    await search(cep, vehicleType);
  };

  const hasResults = state === 'results' && stores.length > 0;
  const displayTotal = state === 'no-results' ? 0 : total;

  const selectedIndex = selectedStore ? stores.findIndex(s => s.id === selectedStore.id) : 0;
  const firstStore = stores[selectedIndex] || stores[0];
  const otherStores = stores.filter((_, i) => i !== selectedIndex);

  return (
    <section className="py-10 md:py-15 lg:py-20 bg-neutral">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="mb-6 md:mb-10">
          <h2 className="text-xl md:text-2xl lg:text-[2rem] leading-[1.4] lg:leading-[40px] font-semibold text-dark-blue mb-2">
            Encontre uma loja na sua região
          </h2>
          <p className="text-base md:text-lg lg:text-xl leading-snug text-low-dark-blue max-w-[800px]">
            Estamos presentes no Brasil inteiro, busque pela loja mais próxima de você.
          </p>
        </div>

        {/* Filter Card */}
        <div className="bg-neutral border border-dark-blue rounded-lg p-6 mb-6 md:mb-10 flex flex-col gap-4">
          <p className="text-lg md:text-xl font-semibold text-dark-blue">
            Filtros
          </p>
          <StoreSearchForm
            onSearch={handleSearch}
            isLoading={state === 'loading'}
          />
        </div>

        {/* Results Counter */}
        {state !== 'idle' && (
          <p className="text-dark-blue font-medium text-sm md:text-base mb-4">
            {state === 'loading' ? (
              <span className="text-medium-gray">Buscando...</span>
            ) : (
              <>
                <span className="text-red">{displayTotal}</span>{' '}
                {displayTotal === 1 ? 'loja encontrada' : 'lojas encontradas'}
              </>
            )}
          </p>
        )}

        {/* Results Area */}
        {hasResults ? (
          <>
            {/* Desktop Layout: Side by side */}
            <div className="hidden lg:grid lg:grid-cols-[2fr_3fr] lg:gap-6">
              {/* Left: Store List */}
              <div>
                <StoreList
                  stores={stores}
                  total={total}
                  selectedStore={selectedStore}
                  onSelectStore={selectStore}
                  hideHeader
                />
              </div>

              {/* Right: Map + Selected store */}
              <div>
                {center && (
                  <StoreMap
                    stores={stores}
                    center={center}
                    selectedStore={selectedStore}
                    onSelectStore={selectStore}
                  />
                )}
                {selectedStore && <SelectedStoreCard store={selectedStore} />}
              </div>
            </div>

            {/* Mobile Layout: First card, then map, then rest of cards */}
            <div className="lg:hidden">
              {/* First/Selected Store Card */}
              {firstStore && (
                <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden mb-4">
                  <StoreCard
                    store={firstStore}
                    isSelected={true}
                    onSelect={selectStore}
                  />
                </div>
              )}

              {/* Map + Como chegar */}
              {center && (
                <div className="mb-4">
                  <StoreMap
                    stores={stores}
                    center={center}
                    selectedStore={selectedStore}
                    onSelectStore={selectStore}
                  />
                  {selectedStore && <SelectedStoreCard store={selectedStore} />}
                </div>
              )}

              {/* Remaining Store Cards */}
              {otherStores.length > 0 && (
                <MobileStoreList
                  stores={otherStores}
                  selectedStore={selectedStore}
                  onSelectStore={selectStore}
                />
              )}
            </div>
          </>
        ) : (
          <StoreEmptyState
            type={state === 'no-results' ? 'no-results' : state === 'error' ? 'error' : 'idle'}
            errorMessage={errorMessage || undefined}
          />
        )}
      </div>
    </section>
  );
}

function MobileStoreList({
  stores,
  selectedStore,
  onSelectStore
}: {
  stores: Store[];
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
}) {
  const [visibleCount, setVisibleCount] = React.useState(5);
  const visibleStores = stores.slice(0, visibleCount);
  const hasMore = visibleCount < stores.length;

  return (
    <div>
      <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
        {visibleStores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            isSelected={selectedStore?.id === store.id}
            onSelect={onSelectStore}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setVisibleCount(prev => prev + 5)}
            className="w-full max-w-[280px] py-3 px-6 border border-dark-blue text-dark-blue font-medium text-sm rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            Ver Mais
          </button>
        </div>
      )}
    </div>
  );
}

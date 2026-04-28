'use client';

import React, { useState, useCallback } from 'react';
import { BRAZILIAN_STATES } from '@/app/types/store-types';
import { useDistributorSearch, AcfDistributor } from './useDistributorSearch';
import DistributorCard from './DistributorCard';
import Link from 'next/link';

interface FindDistributorProps {
  title?: string;
  description?: string;
  distributors?: AcfDistributor[];
}

export default function FindDistributor({ title, description, distributors = [] }: FindDistributorProps) {
  const {
    searchState,
    filteredDistributors,
    total,
    selectedState,
    search,
  } = useDistributorSearch(distributors);

  const [visibleCount, setVisibleCount] = useState(6);

  const handleStateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const uf = e.target.value;
    setVisibleCount(6);
    search(uf);
  }, [search]);

  const displayTitle = title || 'Encontre um distribuidor na sua região';
  const displayDescription = description || 'Selecione seu estado para ver os distribuidores autorizados Mobil™ que atendem a sua região.';

  const hasResults = searchState === 'results' && filteredDistributors.length > 0;
  const visibleDistributors = filteredDistributors.slice(0, visibleCount);
  const hasMore = visibleCount < filteredDistributors.length;

  return (
    <section className="py-8 md:py-10 lg:py-12 bg-neutral-2">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl lg:text-[28px] font-semibold text-dark-blue mb-1 md:mb-2">
            {displayTitle}
          </h2>
          <p className="text-sm md:text-base text-medium-gray">
            {displayDescription}
          </p>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-lg shadow-search-bar border border-[#E5E7EB] p-4 md:p-5 mb-4 md:mb-6">
          <p className="text-sm md:text-base font-semibold text-dark-blue mb-3 md:mb-4">
            Filtros
          </p>
          <div className="relative w-full md:max-w-[320px]">
            <select
              value={selectedState}
              onChange={handleStateChange}
              className={`
                w-full appearance-none px-3 py-2.5 h-[42px] border border-[#E5E7EB] rounded
                text-sm bg-white cursor-pointer
                focus:outline-none focus:ring-1 focus:ring-dark-blue focus:border-dark-blue
                ${selectedState ? 'text-dark-blue' : 'text-[#9CA3AF]'}
              `}
            >
              {BRAZILIAN_STATES.map((option) => (
                <option key={option.value} value={option.value} className="text-dark-blue">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
              <svg className="w-4 h-4 text-[#9CA3AF]" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        {searchState !== 'idle' && (
          <p className="text-dark-blue font-medium text-sm md:text-base mb-4">
            <span className="text-red">{total}</span>{' '}
            {total === 1 ? 'distribuidor encontrado' : 'distribuidores encontrados'}
          </p>
        )}

        {/* Results */}
        {hasResults && (
          <div>
            <div className={`grid gap-4 ${
              filteredDistributors.length === 1
                ? 'grid-cols-1 max-w-[600px]'
                : filteredDistributors.length === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {visibleDistributors.map((distributor, index) => (
                <div
                  key={`${distributor.name}-${index}`}
                  className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden"
                >
                  <DistributorCard distributor={distributor} />
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="w-full max-w-[280px] py-3 px-6 border border-dark-blue text-dark-blue font-medium text-sm rounded-lg hover:bg-white transition-colors cursor-pointer"
                >
                  Ver Mais
                </button>
              </div>
            )}
          </div>
        )}

        {/* Idle State */}
        {searchState === 'idle' && (
          <EmptyState
            icon="pin"
            title="Selecione o seu estado"
            text="Para ver os distribuidores autorizados na sua região, selecione o estado no filtro acima"
          />
        )}

        {/* No Results */}
        {searchState === 'no-results' && (
          <EmptyState
            icon="clipboard"
            title="Nenhum distribuidor encontrado"
            text="Não encontramos distribuidores neste estado. Se preferir, entre em contato conosco."
            showCta
          />
        )}
      </div>
    </section>
  );
}

function EmptyState({ icon, title, text, showCta }: { icon: 'pin' | 'clipboard'; title: string; text: string; showCta?: boolean }) {
  return (
    <div className="relative w-full min-h-[250px] md:min-h-[300px] bg-[#F9FAFB] rounded-lg overflow-hidden border border-[#E5E7EB]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(to right, #E5E7EB 1px, transparent 1px), linear-gradient(to bottom, #E5E7EB 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="relative flex flex-col items-center justify-center h-full min-h-[250px] md:min-h-[300px] p-6">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
          {icon === 'pin' ? (
            <svg className="w-8 h-8 text-dark-blue" viewBox="0 0 32 32" fill="none">
              <path d="M16 2C10.48 2 6 6.48 6 12C6 19.5 16 30 16 30C16 30 26 19.5 26 12C26 6.48 21.52 2 16 2ZM16 15C14.34 15 13 13.66 13 12C13 10.34 14.34 9 16 9C17.66 9 19 10.34 19 12C19 13.66 17.66 15 16 15Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-[#9CA3AF]" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="4" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M12 4V3C12 2.45 12.45 2 13 2H19C19.55 2 20 2.45 20 3V4" stroke="currentColor" strokeWidth="1.5" />
              <line x1="10" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="10" y1="17" x2="22" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="10" y1="22" x2="17" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <p className="mt-4 text-base md:text-lg text-dark-blue font-semibold text-center">{title}</p>
        <p className="mt-2 text-sm text-medium-gray text-center max-w-sm leading-relaxed">{text}</p>
        {showCta && (
          <Link
            href="/fale-conosco"
            className="mt-6 inline-flex items-center justify-center px-8 py-3 bg-red text-white text-sm font-medium rounded hover:bg-red/90 transition-colors"
          >
            Fale conosco
          </Link>
        )}
      </div>
    </div>
  );
}

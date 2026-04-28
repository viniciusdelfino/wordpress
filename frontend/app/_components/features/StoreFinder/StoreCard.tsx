'use client';

import React from 'react';
import { Store } from '@/app/types/store-types';

interface StoreCardProps {
  store: Store;
  isSelected?: boolean;
  onSelect?: (store: Store) => void;
  isLast?: boolean;
}

export default function StoreCard({ store, isSelected, onSelect, isLast }: StoreCardProps) {
  const displayName = store.fantasyName || store.name;
  const fullAddress = [store.address, store.city, store.state]
    .filter(Boolean)
    .join(' - ');

  const hasCoords = store.lat != null && store.lng != null && store.lat !== 0 && store.lng !== 0;
  const directionsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <div
      className={`
        relative py-4 px-4 bg-white cursor-pointer transition-all
        ${!isLast ? 'border-b border-[#E5E7EB]' : ''}
        ${isSelected ? 'border-l-[3px] border-l-dark-blue bg-neutral-2' : 'border-l-[3px] border-l-transparent'}
        hover:bg-neutral-2
      `}
      onClick={() => onSelect?.(store)}
    >
      {/* Header: Name + Distance badge */}
      <div className="flex items-start justify-between mb-2 gap-3">
        <h3 className="text-dark-blue font-semibold text-sm md:text-base leading-tight flex-1">
          {displayName}
        </h3>

        <div className="flex items-center gap-2 shrink-0">
          {/* Distance badge */}
          {store.distance_km !== null && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F3F4F6] rounded-full text-xs font-medium text-dark-blue">
              {store.distance_km}km
            </span>
          )}

          {/* Directions icon */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-medium-gray hover:text-dark-blue transition-colors"
            title="Como chegar"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1L14.5 14.5L8 11L1.5 14.5L8 1Z"
                fill="currentColor"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* Address with location icon */}
      <div className="flex items-start gap-2 mb-1.5">
        <svg className="w-4 h-4 text-medium-gray shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 1C5.24 1 3 3.24 3 6C3 9.75 8 15 8 15C8 15 13 9.75 13 6C13 3.24 10.76 1 8 1ZM8 7.5C7.17 7.5 6.5 6.83 6.5 6C6.5 5.17 7.17 4.5 8 4.5C8.83 4.5 9.5 5.17 9.5 6C9.5 6.83 8.83 7.5 8 7.5Z"
            fill="currentColor"
          />
        </svg>
        <p className="text-medium-gray text-xs md:text-sm leading-relaxed">
          {fullAddress}
        </p>
      </div>

      {/* Phone with phone icon */}
      {store.phone && (
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-medium-gray shrink-0" viewBox="0 0 16 16" fill="none">
            <path
              d="M4.41 7.19C5.37 9.08 6.92 10.62 8.81 11.59L10.27 10.13C10.45 9.95 10.71 9.89 10.94 9.97C11.69 10.21 12.5 10.35 13.33 10.35C13.7 10.35 14 10.65 14 11.02V13.33C14 13.7 13.7 14 13.33 14C6.72 14 1.33 8.61 1.33 2C1.33 1.63 1.63 1.33 2 1.33H4.33C4.7 1.33 5 1.63 5 2C5 2.84 5.14 3.64 5.38 4.39C5.45 4.62 5.4 4.87 5.21 5.06L4.41 7.19Z"
              fill="currentColor"
            />
          </svg>
          <p className="text-medium-gray text-xs md:text-sm">
            {store.phone}
          </p>
        </div>
      )}
    </div>
  );
}

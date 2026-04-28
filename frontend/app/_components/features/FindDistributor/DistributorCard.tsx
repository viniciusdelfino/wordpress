'use client';

import React from 'react';
import { AcfDistributor } from './useDistributorSearch';

interface DistributorCardProps {
  distributor: AcfDistributor;
}

export default function DistributorCard({ distributor }: DistributorCardProps) {
  const fullAddress = [distributor.address, distributor.city, distributor.state]
    .filter(Boolean)
    .join(' - ');

  return (
    <div className="py-4 px-5 bg-white">
      <h3 className="text-dark-blue font-semibold text-sm md:text-base leading-tight mb-2">
        {distributor.name}
      </h3>

      {fullAddress && (
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
      )}

      {distributor.phone && (
        <div className="flex items-center gap-2 mb-1.5">
          <svg className="w-4 h-4 text-medium-gray shrink-0" viewBox="0 0 16 16" fill="none">
            <path
              d="M4.41 7.19C5.37 9.08 6.92 10.62 8.81 11.59L10.27 10.13C10.45 9.95 10.71 9.89 10.94 9.97C11.69 10.21 12.5 10.35 13.33 10.35C13.7 10.35 14 10.65 14 11.02V13.33C14 13.7 13.7 14 13.33 14C6.72 14 1.33 8.61 1.33 2C1.33 1.63 1.63 1.33 2 1.33H4.33C4.7 1.33 5 1.63 5 2C5 2.84 5.14 3.64 5.38 4.39C5.45 4.62 5.4 4.87 5.21 5.06L4.41 7.19Z"
              fill="currentColor"
            />
          </svg>
          <p className="text-medium-gray text-xs md:text-sm">
            {distributor.phone}
          </p>
        </div>
      )}

      {distributor.email && (
        <div className="flex items-center gap-2 mb-1.5">
          <svg className="w-4 h-4 text-medium-gray shrink-0" viewBox="0 0 16 16" fill="none">
            <path
              d="M14 3H2C1.45 3 1 3.45 1 4V12C1 12.55 1.45 13 2 13H14C14.55 13 15 12.55 15 12V4C15 3.45 14.55 3 14 3ZM14 5L8 8.5L2 5V4L8 7.5L14 4V5Z"
              fill="currentColor"
            />
          </svg>
          <p className="text-medium-gray text-xs md:text-sm">
            {distributor.email}
          </p>
        </div>
      )}

      {distributor.coverage_area && (
        <div className="flex items-start gap-2 mt-3 pt-3 border-t border-[#E5E7EB]">
          <svg className="w-4 h-4 text-blue shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
            <path d="M8 1C4.13 1 1 4.13 1 8C1 11.87 4.13 15 8 15C11.87 15 15 11.87 15 8C15 4.13 11.87 1 8 1ZM8 13.5C4.97 13.5 2.5 11.03 2.5 8C2.5 4.97 4.97 2.5 8 2.5C11.03 2.5 13.5 4.97 13.5 8C13.5 11.03 11.03 13.5 8 13.5Z" fill="currentColor" />
            <circle cx="8" cy="8" r="3" fill="currentColor" opacity="0.3" />
          </svg>
          <div>
            <p className="text-xs font-medium text-dark-blue mb-0.5">Área de cobertura</p>
            <p className="text-medium-gray text-xs leading-relaxed">
              {distributor.coverage_area}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

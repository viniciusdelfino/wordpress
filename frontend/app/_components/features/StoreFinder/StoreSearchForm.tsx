'use client';

import React, { useState, useCallback } from 'react';
import { formatCep, validateCep } from './cep-utils';
import { VEHICLE_TYPE_OPTIONS } from '@/app/types/store-types';

interface StoreSearchFormProps {
  onSearch: (cep: string, vehicleType: string) => void;
  isLoading: boolean;
}

export default function StoreSearchForm({ onSearch, isLoading }: StoreSearchFormProps) {
  const [cep, setCep] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCepChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setCep(formatted);
    setError(null);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!validateCep(cep)) {
      setError('Digite um CEP válido (8 dígitos)');
      return;
    }

    setError(null);
    onSearch(cep, vehicleType);
  }, [cep, vehicleType, onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // Auto-search when vehicle type changes (if CEP is valid)
  const handleVehicleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVehicleType = e.target.value;
    setVehicleType(newVehicleType);

    // Auto-search if CEP is valid
    if (validateCep(cep)) {
      onSearch(cep, newVehicleType);
    }
  }, [cep, onSearch]);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        {/* CEP Input */}
        <div className="flex-1 md:flex-[2]">
          <div className="relative">
            <input
              id="cep"
              type="text"
              value={cep}
              onChange={handleCepChange}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (validateCep(cep)) {
                  handleSubmit();
                }
              }}
              placeholder="Insira seu CEP"
              maxLength={9}
              className={`
                w-full px-3 py-2.5 h-[42px] border rounded text-sm text-dark-blue
                placeholder:text-[#9CA3AF] bg-white
                focus:outline-none focus:ring-1 focus:ring-dark-blue focus:border-dark-blue
                ${error ? 'border-red' : 'border-[#E5E7EB]'}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              disabled={isLoading}
            />
          </div>
          {error && (
            <p className="mt-1 text-xs text-red">{error}</p>
          )}
        </div>

        {/* Search Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`
              h-[42px] px-5 bg-red text-white text-sm font-medium rounded
              hover:bg-red/90 transition-colors
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Vehicle Type Select */}
        <div className="flex-1 md:flex-[1]">
          <div className="relative">
            <select
              id="vehicleType"
              value={vehicleType}
              onChange={handleVehicleTypeChange}
              className={`
                w-full appearance-none px-3 py-2.5 h-[42px] border border-[#E5E7EB] rounded
                text-sm bg-white cursor-pointer
                focus:outline-none focus:ring-1 focus:ring-dark-blue focus:border-dark-blue
                ${vehicleType ? 'text-dark-blue' : 'text-[#9CA3AF]'}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              disabled={isLoading}
            >
              {VEHICLE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="text-dark-blue">
                  {option.label}
                </option>
              ))}
            </select>
            {/* Chevron icon */}
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
      </div>
    </div>
  );
}

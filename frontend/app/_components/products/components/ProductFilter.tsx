'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useTransition } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { GRAXAS_ID, isSpecialSegment } from '@/app/lib/filter-config-truck';

interface FilterOption {
  label?: string;
  value: string;
  count: number;
}

interface FilterGroup {
  viscosidade: FilterOption[];
  tecnologia: FilterOption[];
  aplicacao: FilterOption[];
  ponto_lubrificacao?: FilterOption[];
  espessante?: FilterOption[];
}

interface Props {
  filters: FilterGroup;
  segmentName?: string;
  segmentSlug?: string;
  onPendingChange?: (pending: boolean) => void;
}

export default function ProductFilter({ filters, segmentName, segmentSlug, onPendingChange }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const scrollPositionRef = useRef(0);
  const isFilterNavigationRef = useRef(false);

  const normalizeSegment = (value?: string) => {
    if (!value) return '';
    const normalized = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[_\s]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (normalized === 'equipamentos-agricolas') return 'maquinas-agricolas';
    if (normalized === 'agricola') return 'maquinas-agricolas';
    return normalized;
  };

  const toTaxonomySlug = (value: string) => {
    const normalized = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Mantém compatibilidade com termo existente no WP para junta universal
    if (normalized === 'juntas-universais' || normalized === 'junta-universal') {
      return 'junta-universal-cruzeta';
    }

    return normalized;
  };

  const segmentFromPath = pathname.split('/').filter(Boolean)[0] || '';
  const currentSegment = normalizeSegment(segmentSlug || segmentName || segmentFromPath);
  const filterOptions: Record<string, FilterOption[]> = {
    aplicacao: filters?.aplicacao || [],
    tecnologia: filters?.tecnologia || [],
    viscosidade: filters?.viscosidade || [],
    ponto_lubrificacao: filters?.ponto_lubrificacao || [],
    espessante: filters?.espessante || [],
  };

  const activeApps = searchParams.get('aplicacao')?.split(',').filter(Boolean) || [];
  const activeTechs = searchParams.get('tecnologia')?.split(',').filter(Boolean) || [];
  const activeViscs = searchParams.get('viscosidade')?.split(',').filter(Boolean) || [];
  const activePontoLub = searchParams.get('ponto_lubrificacao')?.split(',').filter(Boolean) || [];
  const activeEspessante = searchParams.get('espessante')?.split(',').filter(Boolean) || [];

  const isGraxasActive = isSpecialSegment(currentSegment) && activeApps.includes(GRAXAS_ID);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useLayoutEffect(() => {
    if (isFilterNavigationRef.current) {
      window.scrollTo(0, scrollPositionRef.current);
      isFilterNavigationRef.current = false;
    }
  }, [searchParams]);

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  const handleFilterChange = (type: string, value: string) => {
    scrollPositionRef.current = window.scrollY;
    isFilterNavigationRef.current = true;
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    const currentValues = current.get(type)?.split(',') || [];
    const wasGraxasActive = current.get('aplicacao')?.split(',').includes(GRAXAS_ID) || false;
    const isRemoving = currentValues.includes(value);

    let newValues = isRemoving ? currentValues.filter(v => v !== value) : [...currentValues, value];

    if (newValues.length > 0) current.set(type, newValues.join(','));
    else current.delete(type);

    if (type === 'aplicacao' && isSpecialSegment(currentSegment)) {
      const isGraxasActiveNow = newValues.includes(GRAXAS_ID);

      // Only reset dependent filters when switching between Graxas and non-Graxas modes.
      if (wasGraxasActive !== isGraxasActiveNow) {
        if (isGraxasActiveNow) {
          current.delete('tecnologia');
          current.delete('viscosidade');
        } else {
          current.delete('ponto_lubrificacao');
          current.delete('espessante');
        }
      }
    } 

    if (type === 'tecnologia') current.delete('viscosidade');
    current.delete('page');
    
    const queryString = current.toString();
    startTransition(() => {
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    });
  };

  const removeFilter = (type: string, value: string) => handleFilterChange(type, value);
  const clearFilters = () => {
    scrollPositionRef.current = window.scrollY;
    isFilterNavigationRef.current = true;
    startTransition(() => router.push(pathname, { scroll: false }));
  };

  const isChecked = (type: string, value: string) => {
    const vals = searchParams.get(type)?.split(',') || [];
    return vals.includes(value);
  };

  const getOptionLabel = (type: string, value: string) => {
    const option = filterOptions[type]?.find((item) => item.value === value);
    return option?.label || option?.value || value;
  };

  const renderDropdown = (type: string, label: string, options: FilterOption[], extraClasses: string = "w-[326px] md:w-full lg:w-[393px]") => {
    const isOpen = openDropdown === type;
    const hasOptions = (options?.length || 0) > 0;
    const isDisabled = !hasOptions;

    return (
      <div className={`relative ${extraClasses}`}>
        <button
          type="button"
          onClick={() => !isDisabled && setOpenDropdown(isOpen ? null : type)}
          disabled={isDisabled}
          className={`w-full h-[40px] px-[12px] rounded-[0.25rem] border border-gray text-[#5A5A5A] bg-white flex items-center justify-between outline-none focus:border-dark-blue transition-colors cursor-pointer ${isOpen ? 'border-dark-blue' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
        >
          <span className="truncate">
            {label}
          </span>
          <svg 
            className={`w-3 h-1.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            viewBox="0 0 12 8" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1.41 0.589996L6 5.17L10.59 0.589996L12 2L6 8L0 2L1.41 0.589996Z" fill="currentColor"/>
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto p-2">
            {options?.map((opt) => (
              <label key={opt.value} className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input 
                  type="checkbox" 
                  checked={!!isChecked(type, opt.value)}
                  onChange={() => handleFilterChange(type, opt.value)} 
                  className="mt-1 h-4 w-4" 
                />
                <span className="text-sm text-gray-700 leading-tight">{opt.label || opt.value}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  const hasActiveFilters = activeApps.length > 0 || activeTechs.length > 0 || activeViscs.length > 0 || activePontoLub.length > 0 || activeEspessante.length > 0;

  return (
    <div ref={dropdownRef} className="grid grid-cols-12 bg-neutral rounded-lg p-4 lg:p-6 gap-y-[0.875rem] border border-dark-blue mb-8">
      <div className="col-span-12 flex items-center gap-2">
        <h3 className="text-dark-blue font-semibold text-lg md:text-xl lg:text-2xl">
          Filtros
        </h3>
        {isPending && (
          <span className="text-sm text-medium-gray animate-pulse">Aplicando...</span>
        )}
      </div>

      <div className="col-span-12 flex flex-wrap md:grid md:grid-cols-[300px_300px] lg:flex lg:flex-nowrap gap-4">
        {renderDropdown('aplicacao', 'Aplicação', filterOptions.aplicacao)}

        {isGraxasActive ? (
          <>
            {renderDropdown(
              'ponto_lubrificacao',
              'Pontos de lubrificação',
              filterOptions.ponto_lubrificacao,
            )}
            {renderDropdown(
              'espessante',
              'Espessante',
              filterOptions.espessante,
              "w-[326px] md:col-span-2 md:w-full lg:w-[393px]",
            )}
          </>
        ) : (
          <>
            {renderDropdown('tecnologia', 'Tecnologia', filterOptions.tecnologia)}
            {renderDropdown('viscosidade', 'Viscosidade', filterOptions.viscosidade, "w-[326px] md:col-span-2 md:w-full lg:w-[393px]")}
          </>
        )}
      </div>

      {hasActiveFilters && (
        <div className="col-span-12 mt-2">
          <h4 className="text-dark-blue text-xs md:text-sm mb-2">Filtros aplicados</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'aplicacao', list: activeApps },
              { id: 'tecnologia', list: activeTechs },
              { id: 'viscosidade', list: activeViscs },
              { id: 'ponto_lubrificacao', list: activePontoLub },
              { id: 'espessante', list: activeEspessante },
            ].map(group => group.list.map(val => (
              <span key={`${group.id}-${val}`} className="inline-flex items-center p-[0.4rem] rounded-sm text-white text-xs bg-dark-blue">
                {getOptionLabel(group.id, val)} <button onClick={() => removeFilter(group.id, val)} className="ml-2"><Image src="/icons/x.svg" alt="X" width={8} height={8} className="w-[8px] h-[8px] brightness-0 invert" /></button>
              </span>
            )))}
            <button onClick={clearFilters} className="text-dark-blue text-xs underline ml-2">Limpar tudo</button>
          </div>
        </div>
      )}
    </div>
  );
}
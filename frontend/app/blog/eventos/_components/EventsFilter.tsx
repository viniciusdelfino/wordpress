"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";

export type PeriodOption = "todos" | "proximos" | "passados";
export type SortOption = "recente" | "antigo";

export interface EventFilters {
  period: PeriodOption;
  sortBy: SortOption;
}

interface EventsFilterProps {
  onFilterChange: (filters: EventFilters) => void;
}

const periodOptions: Array<{ value: PeriodOption; label: string }> = [
  { value: "todos", label: "Período do evento" },
  { value: "proximos", label: "Próximos" },
  { value: "passados", label: "Passados" },
];

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: "recente", label: "Mais Recente" },
  { value: "antigo", label: "Mais Antigo" },
];

export default function EventsFilter({ onFilterChange }: EventsFilterProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodOption>("todos");
  const [sortBy, setSortBy] = useState<SortOption>("recente");

  const emit = useCallback(
    (nextPeriod: PeriodOption, nextSort: SortOption) => {
      onFilterChange({ period: nextPeriod, sortBy: nextSort });
    },
    [onFilterChange],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderDropdown = <T extends string>(
    key: string,
    label: string,
    value: T,
    options: Array<{ value: T; label: string }>,
    onChange: (v: T) => void,
  ) => {
    const isOpen = openDropdown === key;
    const selectedLabel = options.find((o) => o.value === value)?.label ?? label;

    return (
      <div className="relative w-full flex flex-col md:flex-row justify-between">
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : key)}
          className={`w-full h-[40px] px-[12px] rounded-[0.25rem] border bg-white flex items-center justify-between outline-none transition-colors cursor-pointer text-[#5A5A5A] ${isOpen ? "border-dark-blue" : "border-gray"}`}
        >
          <span className="truncate text-sm">{selectedLabel}</span>
          <svg
            className={`w-3 h-1.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            viewBox="0 0 12 8"
            fill="none"
          >
            <path d="M1.41 0.589996L6 5.17L10.59 0.589996L12 2L6 8L0 2L1.41 0.589996Z" fill="currentColor" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpenDropdown(null);
                  }}
                  className="flex w-full items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded text-left"
                >
                  <span
                    className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-dark-blue" : "border-gray"}`}
                  >
                    {isSelected && <span className="h-2 w-2 rounded-full bg-dark-blue" />}
                  </span>
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const activeFilters = [
    period !== "todos"
      ? {
          id: "period",
          label: periodOptions.find((o) => o.value === period)?.label ?? period,
          onRemove: () => { setPeriod("todos"); emit("todos", sortBy); },
        }
      : null,
    sortBy !== "recente"
      ? {
          id: "sortBy",
          label: sortOptions.find((o) => o.value === sortBy)?.label ?? sortBy,
          onRemove: () => { setSortBy("recente"); emit(period, "recente"); },
        }
      : null,
  ].filter(Boolean) as Array<{ id: string; label: string; onRemove: () => void }>;

  return (
    <div
      ref={dropdownRef}
      className="posts-filter mb-8 grid grid-cols-12 gap-y-[0.875rem] rounded-lg border border-dark-blue bg-neutral p-4 lg:mb-12 lg:p-6"
    >
      <h3 className="col-span-12 text-base font-semibold text-dark-blue md:text-lg lg:text-xl">
        Filtros
      </h3>

      <div className="col-span-12 flex flex-wrap gap-y-2 gap-x-4 lg:flex-nowrap">
        {renderDropdown("period", "Período", period, periodOptions, (v) => {
          setPeriod(v);
          emit(v, sortBy);
        })}
        {renderDropdown("sortBy", "Ordenar Por", sortBy, sortOptions, (v) => {
          setSortBy(v);
          emit(period, v);
        })}
      </div>

      {activeFilters.length > 0 && (
        <div className="col-span-12 mt-2">
          <h4 className="mb-2 text-xs text-dark-blue md:text-sm">Filtros aplicados</h4>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <span
                key={filter.id}
                className="inline-flex items-center rounded-sm bg-dark-blue p-[0.4rem] text-xs text-white"
              >
                {filter.label}
                <button type="button" onClick={filter.onRemove} className="ml-2">
                  <Image
                    src="/icons/x.svg"
                    alt="Remover filtro"
                    width={8}
                    height={8}
                    className="brightness-0 invert"
                  />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => { setPeriod("todos"); setSortBy("recente"); emit("todos", "recente"); }}
              className="ml-2 text-xs text-dark-blue underline"
            >
              Limpar tudo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

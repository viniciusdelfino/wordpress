"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import type {
  SortOption,
  ContentTypeOption,
  FilterStrategyConfig,
} from "../utils/postsFiltering";

interface PostsFilterProps {
  subjects?: string[];
  filterStrategy: FilterStrategyConfig;
  onFilterChange: (filters: {
    subject: string;
    contentType: ContentTypeOption;
    sortBy: SortOption;
  }) => void;
}

export default function PostsFilter({
  subjects = [],
  filterStrategy,
  onFilterChange,
}: PostsFilterProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [subject, setSubject] = useState("todos");
  const [contentType, setContentType] = useState<ContentTypeOption>("todos");
  const [sortBy, setSortBy] = useState<SortOption>("recente");

  const emitFilters = useCallback(
    (
      nextSubject: string,
      nextContentType: ContentTypeOption,
      nextSortBy: SortOption,
    ) => {
      onFilterChange({
        subject: nextSubject,
        contentType: nextContentType,
        sortBy: nextSortBy,
      });
    },
    [onFilterChange],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const subjectOptions = [
    { value: "todos", label: "Todos os assuntos" },
    ...subjects.map((item) => ({ value: item, label: item })),
  ];

  const subjectLabel = "Assunto";

  const contentTypeOptions: Array<{ value: ContentTypeOption; label: string }> = [
    { value: "todos", label: "Todos" },
    { value: "artigo", label: "Artigo" },
    { value: "ebook", label: "Ebook" },
  ];

  const sortOptions: Array<{ value: SortOption; label: string }> = [
    { value: "recente", label: "Mais Recente" },
    { value: "antigo", label: "Mais Antigo" },
    { value: "a-z", label: "A - Z (Título)" },
  ];

  const activeFilters = [
    subject !== "todos"
      ? {
          id: "subject",
          label: subjectOptions.find((item) => item.value === subject)?.label || subject,
          onRemove: () => {
            setSubject("todos");
            emitFilters("todos", contentType, sortBy);
          },
        }
      : null,
    contentType !== "todos"
      ? {
          id: "contentType",
          label:
            contentTypeOptions.find((item) => item.value === contentType)?.label || contentType,
          onRemove: () => {
            setContentType("todos");
            emitFilters(subject, "todos", sortBy);
          },
        }
      : null,
    sortBy !== "recente"
      ? {
          id: "sortBy",
          label: sortOptions.find((item) => item.value === sortBy)?.label || sortBy,
          onRemove: () => {
            setSortBy("recente");
            emitFilters(subject, contentType, "recente");
          },
        }
      : null,
  ].filter(Boolean);

  const clearFilters = () => {
    setSubject("todos");
    setContentType("todos");
    setSortBy("recente");
    emitFilters("todos", "todos", "recente");
  };

  const renderDropdown = <T extends string>(
    type: string,
    label: string,
    value: T,
    options: Array<{ value: T; label: string }>,
    onChange: (nextValue: T) => void,
    extraClasses: string = "w-[326px] md:w-full lg:w-[393px]",
  ) => {
    const isOpen = openDropdown === type;

    return (
      <div className={`relative ${extraClasses}`}>
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : type)}
          className={`w-full h-[40px] px-[12px] rounded-[0.25rem] border border-gray text-[#5A5A5A] bg-white flex items-center justify-between outline-none focus:border-dark-blue transition-colors cursor-pointer ${isOpen ? "border-dark-blue" : ""}`}
        >
          <span className="truncate">{label}</span>
          <svg
            className={`w-3 h-1.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1.41 0.589996L6 5.17L10.59 0.589996L12 2L6 8L0 2L1.41 0.589996Z" fill="currentColor" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto p-2">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpenDropdown(null);
                  }}
                  className="flex w-full items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded text-left"
                >
                  <span className={`mt-[2px] h-4 w-4 rounded-full border flex items-center justify-center ${isSelected ? "border-dark-blue" : "border-gray"}`}>
                    {isSelected && <span className="h-2 w-2 rounded-full bg-dark-blue" />}
                  </span>
                  <span className="text-sm text-gray-700 leading-tight">{option.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={dropdownRef}
      className="posts-filter mb-8 grid grid-cols-12 gap-y-[0.875rem] rounded-lg border border-dark-blue bg-neutral p-4 lg:mb-12 lg:p-6"
    >
      <h3 className="col-span-12 text-base font-semibold text-dark-blue md:text-lg lg:text-xl">
        Filtros
      </h3>

      <div className="col-span-12 flex flex-wrap gap-4 md:grid md:grid-cols-[300px_300px] lg:flex lg:flex-nowrap">
        {renderDropdown("subject", subjectLabel, subject, subjectOptions, (nextSubject) => {
          setSubject(nextSubject);
          emitFilters(nextSubject, contentType, sortBy);
        })}

        {renderDropdown(
          "contentType",
          "Tipo de Conteúdo",
          contentType,
          contentTypeOptions,
          (nextType) => {
            setContentType(nextType);
            emitFilters(subject, nextType, sortBy);
          },
        )}

        {renderDropdown(
          "sortBy",
          "Ordenar Por",
          sortBy,
          sortOptions,
          (nextSort) => {
            setSortBy(nextSort);
            emitFilters(subject, contentType, nextSort);
          },
          "w-[326px] md:col-span-2 md:w-full lg:w-[393px]",
        )}
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
                    className="h-[8px] w-[8px] brightness-0 invert"
                  />
                </button>
              </span>
            ))}
            <button type="button" onClick={clearFilters} className="ml-2 text-xs text-dark-blue underline">
              Limpar tudo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

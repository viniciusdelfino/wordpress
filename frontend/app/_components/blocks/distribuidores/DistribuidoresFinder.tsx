"use client";

import React, { useState } from "react";
import DistribuidorCard from "./DistribuidorCard";
import { DistribuidoresFinderProps, DistributorEntry } from "./types";

const EMPTY_DISTRIBUTORS: DistributorEntry[] = [];

function ChevronDownIcon() {
  return (
    <svg
      className="w-3 h-1.5 text-dark-blue pointer-events-none"
      viewBox="0 0 12 6"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 1L6 5L11 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function buildStateOptions(list: DistributorEntry[]): [string, string][] {
  const map = new Map<string, string>();
  for (const d of list) {
    if (d.state_code && !map.has(d.state_code)) {
      map.set(d.state_code, d.state_label || d.state_code);
    }
  }
  return Array.from(map.entries()).sort((a, b) =>
    a[1].localeCompare(b[1], "pt-BR"),
  );
}

export default function DistribuidoresFinder({
  title,
  description,
  state_select_label,
  distributors,
}: DistribuidoresFinderProps) {
  const list = Array.isArray(distributors) ? distributors : EMPTY_DISTRIBUTORS;
  const states = buildStateOptions(list);

  const [selectedState, setSelectedState] = useState<string>(
    states[0]?.[0] ?? "",
  );

  const filtered = list.filter((d) => d.state_code === selectedState);

  return (
    <section className="w-full bg-neutral py-10 md:py-15 lg:py-20">
      <div className="container mx-auto flex flex-col gap-10 items-center">
        <div className="w-full flex flex-col gap-2">
          {title && (
            <h2 className="text-[28px] md:text-[32px] font-semibold text-dark-blue leading-[40px]">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-base md:text-xl text-low-dark-blue leading-normal max-w-[800px]">
              {description}
            </p>
          )}
        </div>

        <div className="w-full bg-neutral border border-dark-blue rounded-lg p-6 flex flex-col gap-4">
          <label
            htmlFor="distribuidores-finder-state"
            className="block text-xl font-semibold text-dark-blue leading-normal"
          >
            {state_select_label || "Selecione um estado"}
          </label>
          <div className="relative w-full">
            <select
              id="distribuidores-finder-state"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full appearance-none bg-white border border-gray rounded-[4px] h-10 pl-3 pr-10 text-base font-semibold text-dark-blue focus:outline-none focus:ring-1 focus:ring-dark-blue cursor-pointer"
            >
              {states.length === 0 ? (
                <option value="">Nenhum estado disponível</option>
              ) : (
                states.map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))
              )}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <ChevronDownIcon />
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-4">
          {states.length > 0 && (
            <p className="text-[15px] text-low-dark-blue leading-[22.5px] tracking-[-0.23px]">
              <span className="font-semibold">{filtered.length}</span>{" "}
              {filtered.length === 1
                ? "distribuidor encontrado"
                : "distribuidores encontrados"}
            </p>
          )}

          {filtered.length > 0 ? (
            <div className="flex flex-wrap gap-6 items-start justify-center">
              {filtered.map((distributor, index) => (
                <DistribuidorCard key={index} distributor={distributor} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-light-gray rounded-lg p-6 text-center">
              <p className="text-sm md:text-base text-medium-gray">
                Nenhum distribuidor cadastrado para este estado.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

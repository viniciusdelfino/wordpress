"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { TrocaProcessStepsProps } from "./types";

export default function TrocaProcessSteps({
  title,
  description,
  steps,
}: TrocaProcessStepsProps) {
  const stepItems = Array.isArray(steps) ? steps : [];
  const [expandedIndex, setExpandedIndex] = useState(0);

  const toggleStep = (index: number) => {
    setExpandedIndex(index);
  };

  return (
    <section className="w-full py-10 md:py-14 lg:py-15 bg-white">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-10 lg:mb-12">
          {title && (
            <h2 className="text-2xl md:text-[1.75rem] lg:text-[2rem] font-semibold text-dark-blue leading-tight mb-2">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm md:text-base lg:text-lg text-low-dark-blue leading-relaxed max-w-[800px]">
              {description}
            </p>
          )}
        </div>

        {/* Steps accordion cards */}
        {stepItems.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4 md:gap-5 md:items-start">
            {stepItems.map((step, index) => {
              const isExpanded = expandedIndex === index;

              return (
                <div
                  key={index}
                  className={`rounded-xl overflow-hidden border border-light-gray bg-white transition-all duration-500 ease-in-out cursor-pointer ${
                    isExpanded
                      ? "md:flex-[2] flex-none"
                      : "md:flex-1 flex-none"
                  }`}
                  onClick={() => toggleStep(index)}
                >
                  {/* Image */}
                  {step.image?.url && (
                    <div
                      className={`relative w-full overflow-hidden transition-all duration-500 ease-in-out ${
                        isExpanded
                          ? "h-[240px] md:h-[300px] lg:h-[360px]"
                          : "h-[200px] md:h-[250px] lg:h-[300px]"
                      }`}
                    >
                      <Image
                        src={step.image.url}
                        alt={step.image.alt || step.label || ""}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}

                  {/* Label + toggle + description */}
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      {step.label && (
                        <h3 className="text-lg lg:text-xl font-semibold text-dark-blue leading-[1.4] tracking-[-0.3px]">
                          {step.label}
                        </h3>
                      )}
                      <button
                        className="size-10 shrink-0 rounded-full border border-dark-blue flex items-center justify-center transition-transform duration-300"
                        aria-label={isExpanded ? "Recolher" : "Expandir"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStep(index);
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-dark-blue"
                        >
                          {isExpanded ? (
                            <path
                              d="M3 8h10"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          ) : (
                            <path
                              d="M8 3v10M3 8h10"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          )}
                        </svg>
                      </button>
                    </div>

                    {/* Expandable description */}
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        isExpanded
                          ? "max-h-[200px] opacity-100 mt-3"
                          : "max-h-0 opacity-0 mt-0"
                      }`}
                    >
                      {step.description && (
                        <p className="text-sm text-medium-gray leading-[1.5]">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

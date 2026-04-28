import React from "react";
import Image from "next/image";
import type { TrocaPillarsProps } from "./types";

export default function TrocaPillars({
  title,
  description,
  pillars,
}: TrocaPillarsProps) {
  const pillarItems = Array.isArray(pillars) ? pillars : [];

  return (
    <section className="w-full py-10 md:py-14 lg:py-10 bg-white">
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

        {/* Pillars - flex wrap */}
        {pillarItems.length > 0 && (
          <div className="flex flex-col md:flex-row flex-wrap gap-5">
            {pillarItems.map((pillar, index) => {
              const stats = Array.isArray(pillar.stats) ? pillar.stats : [];

              return (
                <div
                  key={index}
                  className="flex-1 min-w-[280px] lg:min-w-[396px] bg-white border border-dark-blue rounded-lg p-[17px] flex flex-col gap-4"
                >
                  {/* Icon + Name */}
                  <div className="flex items-center gap-4">
                    {pillar.icon?.url && (
                      <div className="size-12 shrink-0 rounded-lg border border-dark-blue/10 flex items-center justify-center">
                        <Image
                          src={pillar.icon.url}
                          alt={pillar.icon.alt || ""}
                          width={28}
                          height={28}
                        />
                      </div>
                    )}
                    {pillar.name && (
                      <h3 className="text-[17px] font-semibold text-dark-blue leading-[22px] tracking-[-0.43px]">
                        {pillar.name}
                      </h3>
                    )}
                  </div>

                  {/* Description */}
                  {pillar.description && (
                    <p className="text-base text-medium-gray leading-[21px] tracking-[-0.15px]">
                      {pillar.description}
                    </p>
                  )}

                  {/* Stats row with border-top */}
                  {stats.length > 0 && (
                    <div className="border-t border-gray pt-5 flex gap-6 mt-auto">
                      {stats.map((stat, statIndex) => (
                        <div key={statIndex} className="flex flex-col gap-[5px]">
                          {stat.number && (
                            <p className="text-2xl font-semibold text-dark-blue leading-[24px] tracking-[0.07px]">
                              {stat.number}
                            </p>
                          )}
                          {stat.label && (
                            <p className="text-sm text-low-dark-blue leading-[19.5px] tracking-[-0.08px] whitespace-nowrap">
                              {stat.label}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

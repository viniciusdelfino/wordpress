import React from "react";
import Image from "next/image";
import type { TrocaTechFeaturesProps } from "./types";

export default function TrocaTechFeatures({
  title,
  description,
  cards,
}: TrocaTechFeaturesProps) {
  const cardItems = Array.isArray(cards) ? cards : [];

  return (
    <section className="w-full py-10 md:py-14 lg:py-10 bg-neutral-2">
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

        {/* Cards - 3-column grid */}
        {cardItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cardItems.map((card, index) => (
              <div
                key={index}
                className="bg-white border border-light-gray rounded-xl p-5 flex flex-col gap-3"
              >
                {/* Icon + Title row */}
                <div className="flex items-center gap-4">
                  {card.icon?.url && (
                    <div className="size-12 shrink-0 rounded-lg border border-dark-blue/10 flex items-center justify-center">
                      <Image
                        src={card.icon.url}
                        alt={card.icon.alt || ""}
                        width={28}
                        height={28}
                      />
                    </div>
                  )}
                  {card.title && (
                    <h3 className="flex-1 text-[17px] font-semibold text-dark-blue leading-[22px] tracking-[-0.43px]">
                      {card.title}
                    </h3>
                  )}
                </div>

                {/* Description */}
                {card.description && (
                  <p className="text-sm text-medium-gray leading-[21px] tracking-[-0.15px]">
                    {card.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

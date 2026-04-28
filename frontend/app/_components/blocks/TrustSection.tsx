import React from "react";
import Image from "next/image";

interface TrustCard {
  icon?: {
    url: string;
    alt?: string;
  };
  title?: string;
  description?: string;
}

interface TrustSectionProps {
  title?: string;
  subtitle?: string;
  cards?: TrustCard[];
}

export default function TrustSection({
  title,
  subtitle,
  cards: rawCards,
}: TrustSectionProps) {
  const cards = Array.isArray(rawCards) ? rawCards : [];

  return (
    <section className="w-full py-10 md:py-16 lg:py-[60px] bg-white">
      <div className="container mx-auto px-4 lg:px-[90px]">
        <div className="mb-8 md:mb-10">
          {title && (
            <div
              className="text-2xl md:text-3xl lg:text-[2rem] font-normal text-dark-blue leading-normal mb-2 [&>strong]:font-semibold [&>b]:font-semibold"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          )}
          {subtitle && (
            <p className="text-sm md:text-base lg:text-xl text-low-dark-blue leading-[1.45] max-w-[800px]">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className="flex-1 border border-[#9ca3af] rounded-lg p-4 bg-white flex flex-col gap-6"
            >
              <div className="flex items-center gap-2">
                {card.icon?.url && (
                  <div className="size-12 shrink-0 bg-neutral rounded-[6.4px] flex items-center justify-center">
                    <Image
                      src={card.icon.url}
                      alt={card.icon.alt || ""}
                      width={24}
                      height={24}
                    />
                  </div>
                )}
                {card.title && (
                  <h3 className="text-base md:text-xl font-semibold text-dark-blue leading-7">
                    {card.title}
                  </h3>
                )}
              </div>
              {card.description && (
                <p className="text-sm md:text-base text-[#6d7280] leading-6">
                  {card.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

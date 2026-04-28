"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Stat {
  number?: string;
  label?: string;
}

interface PartnershipCard {
  image?: { url: string; alt?: string };
  title?: string;
  description?: string;
  back_description?: string;
  stats?: Stat[];
  button_text?: string;
  button_url?: string;
}

interface PartnershipCardsProps {
  title?: string;
  subtitle?: string;
  cards?: PartnershipCard[];
}

export default function PartnershipCards({
  title,
  subtitle,
  cards,
}: PartnershipCardsProps) {
  const safeCards = Array.isArray(cards) ? cards : [];
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (!title && safeCards.length === 0) return null;

  return (
    <section className="w-full py-6 md:py-8 lg:py-[60px] bg-white">
      <div className="container mx-auto px-4 lg:px-[90px]">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          {title && (
            <h2 className="text-2xl md:text-[28px] lg:text-[32px] font-semibold text-dark-blue leading-normal mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-base lg:text-xl text-low-dark-blue leading-normal lg:leading-[1.45] max-w-[800px]">
              {subtitle}
            </p>
          )}
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {safeCards.map((card, index) => (
            <FlipCard
              key={index}
              card={card}
              index={index}
              isFlipped={flippedCards[index] || false}
              onFlip={toggleFlip}
            />
          ))}
        </div>

        {/* Mobile Swiper */}
        <div className="lg:hidden">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={16}
            slidesPerView={1.15}
            onSwiper={setSwiperInstance}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            breakpoints={{
              768: { slidesPerView: 2 },
            }}
            className="w-full"
          >
            {safeCards.map((card, index) => (
              <SwiperSlide key={index} className="!h-auto">
                <FlipCard
                  card={card}
                  index={index}
                  isFlipped={flippedCards[index] || false}
                  onFlip={toggleFlip}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Mobile Navigation */}
          {safeCards.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-x-4">
              <button
                onClick={() => swiperInstance?.slidePrev()}
                className="w-10 h-10 flex items-center justify-center border border-[#5a5a5a] rounded-[6px] text-dark-blue hover:bg-dark-blue hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <div className="flex items-center gap-x-1">
                {safeCards.map((_, index) => (
                  <div
                    key={index}
                    className={`h-[2px] rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? "w-[66.5px] bg-[#686D71]"
                        : "w-[18px] bg-[#BFC2C4]"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => swiperInstance?.slideNext()}
                className="w-10 h-10 flex items-center justify-center border border-[#5a5a5a] rounded-[6px] text-dark-blue hover:bg-dark-blue hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FlipCard({
  card,
  index,
  isFlipped,
  onFlip,
}: {
  card: PartnershipCard;
  index: number;
  isFlipped: boolean;
  onFlip: (index: number) => void;
}) {
  const safeStats = Array.isArray(card.stats) ? card.stats : [];

  return (
    <div
      className="flip-card w-full h-[430px] cursor-pointer"
      onClick={() => onFlip(index)}
    >
      <div
        className={`flip-card-inner ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
      >
        {/* Front */}
        <div className="flip-card-front absolute inset-0 rounded-lg overflow-hidden">
          {card.image?.url && (
            <Image
              src={card.image.url}
              alt={card.image.alt || card.title || ""}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-[rgba(7,11,18,0.4)]" />

          {/* Bottom info bar */}
          <div className="absolute bottom-0 left-0 w-full p-2">
            <div className="flex items-center justify-between bg-white/10 rounded-[12px] p-3 gap-3">
              <div className="flex flex-col gap-1">
                {card.title && (
                  <h3 className="text-[16px] font-semibold text-white tracking-[-0.45px]">
                    {card.title}
                  </h3>
                )}
                {card.description && (
                  <p className="text-[14px] text-white leading-[1.4] tracking-[-0.3px] line-clamp-2">
                    {card.description}
                  </p>
                )}
              </div>
              <div className="shrink-0 w-8 h-8 rounded-full border border-white/40 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="flip-card-back absolute inset-0 bg-white border border-[#6d7280] rounded-lg overflow-hidden flex flex-col">
          {/* Blurred top image */}
          {card.image?.url && (
            <div className="relative w-full h-[108px] shrink-0">
              <Image
                src={card.image.url}
                alt={card.title || ""}
                fill
                className="object-cover brightness-75 blur-[1px]"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
            {card.title && (
              <h3 className="text-[20px] font-semibold text-dark-blue tracking-[-0.45px]">
                {card.title}
              </h3>
            )}
            {card.back_description && (
              <p className="text-[14px] text-[#333] leading-[1.4] tracking-[-0.3px]">
                {card.back_description}
              </p>
            )}

            {safeStats.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {safeStats.map((stat, sIndex) => (
                  <div
                    key={sIndex}
                    className="bg-neutral rounded px-2 py-[10px] min-w-[100px] flex-1"
                  >
                    {stat.number && (
                      <span className="block text-[28px] font-semibold text-dark-blue tracking-[0.38px] leading-[28px]">
                        {stat.number}
                      </span>
                    )}
                    {stat.label && (
                      <span className="block text-[13px] text-dark-blue tracking-[-0.08px] leading-[19.5px] mt-[5px]">
                        {stat.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {card.button_text && card.button_url && (
              <Link
                href={card.button_url}
                className="mt-auto bg-red text-white rounded px-4 py-[10px] text-[16px] font-semibold text-center w-full hover:opacity-90 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                {card.button_text}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

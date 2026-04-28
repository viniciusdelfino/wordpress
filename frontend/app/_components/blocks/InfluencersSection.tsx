"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface InfluencerCard {
  image?: { url: string; alt?: string };
  badge?: string;
  name?: string;
  handle?: string;
  description?: string;
}

interface Ambassador {
  image?: { url: string; alt?: string };
  tag?: string;
  name?: string;
  description?: string;
  badge_text?: string;
  handle?: string;
}

interface InfluencersSectionProps {
  title?: string;
  subtitle?: string;
  ambassador?: Ambassador;
  cards?: InfluencerCard[];
}

export default function InfluencersSection({
  title,
  subtitle,
  ambassador,
  cards,
}: InfluencersSectionProps) {
  const safeCards = Array.isArray(cards) ? cards : [];
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!title && safeCards.length === 0) return null;

  const totalSlides = safeCards.length;

  return (
    <section className="w-full py-6 md:py-10 lg:py-[80px] bg-white">
      <div className="container mx-auto px-4 lg:px-[90px]">
        {/* Header */}
        <div className="mb-4 md:mb-8 lg:mb-12">
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

        {/* Ambassador Card - Mobile only */}
        {ambassador?.name && (
          <div className="block lg:hidden mb-6">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(269.76deg, #001450 0%, #000410 100%)",
              }}
            >
              {ambassador.image?.url && (
                <div className="relative w-full h-[320px] md:h-[375px]">
                  <Image
                    src={ambassador.image.url}
                    alt={ambassador.image.alt || ambassador.name || ""}
                    fill
                    className="object-cover object-top"
                  />
                </div>
              )}
              <div className="p-5 flex flex-col gap-3">
                {ambassador.tag && (
                  <div className="flex items-center gap-2">
                    <div className="w-[30px] h-[2px] bg-red" />
                    <span className="text-[13px] text-white">
                      {ambassador.tag}
                    </span>
                  </div>
                )}
                {ambassador.name && (
                  <h3 className="text-2xl font-semibold text-white leading-[1.4]">
                    {ambassador.name}
                  </h3>
                )}
                {ambassador.description && (
                  <p className="text-sm text-white italic leading-[1.6]">
                    {ambassador.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  {ambassador.badge_text && (
                    <span className="bg-white rounded-full px-3 py-1 text-sm text-dark-blue font-medium">
                      {ambassador.badge_text}
                    </span>
                  )}
                  {ambassador.handle && (
                    <span className="text-sm text-white">
                      {ambassador.handle}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-2 xl:grid-cols-4 gap-3">
          {safeCards.map((card, index) => (
            <InfluencerCardItem key={index} card={card} />
          ))}
        </div>

        {/* Mobile Swiper */}
        <div className="lg:hidden">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={12}
            slidesPerView={1.15}
            onSwiper={setSwiperInstance}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            breakpoints={{
              768: { slidesPerView: 2.2 },
            }}
            className="w-full"
          >
            {safeCards.map((card, index) => (
              <SwiperSlide key={index} className="!h-auto">
                <InfluencerCardItem card={card} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Mobile Navigation */}
          {totalSlides > 1 && (
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

function InfluencerCardItem({ card }: { card: InfluencerCard }) {
  return (
    <div className="w-[306px] lg:w-full h-[383px] rounded-lg border border-[#e5e7eb] overflow-hidden flex flex-col bg-white">
      {/* Image area */}
      <div className="relative flex-1 min-h-0 flex flex-col items-center justify-end overflow-hidden">
        {card.image?.url && (
          <Image
            src={card.image.url}
            alt={card.image.alt || card.name || ""}
            fill
            className="object-cover"
          />
        )}
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)",
          }}
        />
        {/* Badge pill */}
        {card.badge && (
          <div className="relative z-10 w-full px-3 pb-[14px]">
            <span className="flex items-center justify-center w-full bg-white/90 rounded-full px-[10px] py-[3px] text-[12px] font-semibold text-dark-blue whitespace-nowrap">
              {card.badge}
            </span>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="h-[181px] p-3 flex flex-col gap-[10px]">
        {card.name && (
          <h3 className="text-[18px] font-semibold text-dark-blue tracking-[-0.44px] leading-[23.4px]">
            {card.name}
          </h3>
        )}
        {card.handle && (
          <span className="text-[14px] text-[#9ca3af] tracking-[-0.15px] leading-[21px]">
            {card.handle}
          </span>
        )}
        {card.description && (
          <p className="text-[14px] text-[#6d7280] tracking-[-0.15px] leading-[21px] line-clamp-4">
            {card.description}
          </p>
        )}
      </div>
    </div>
  );
}

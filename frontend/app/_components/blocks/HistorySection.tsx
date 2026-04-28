"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

interface HistoryItem {
  year?: string;
  title?: string;
  description?: string;
  image?: {
    url: string;
    alt?: string;
  };
}

interface HistorySectionProps {
  title?: string;
  subtitle?: string;
  items?: HistoryItem[];
}

export default function HistorySection({
  title,
  subtitle,
  items,
}: HistorySectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const activeItem = items[activeIndex];

  return (
    <section className="w-full py-10 md:py-16 lg:py-20 bg-white history-section">
      <div className="container mx-auto px-4">
        <div className="mb-8 md:mb-12">
          {title && (
            <h2 className="text-2xl md:text-3xl lg:text-[2rem] font-semibold text-dark-blue leading-tight mb-3">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm md:text-base lg:text-lg text-low-dark-blue leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Desktop layout */}
        <div className="hidden md:flex gap-8 lg:gap-10">
          <div className="w-full lg:w-[598px] shrink-0">
            <div className="flex flex-col">
              {items.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`text-left transition-all duration-300 py-4 pl-5 border-l-[3px] ${
                      isActive
                        ? "border-red opacity-100"
                        : "border-transparent opacity-50 hover:opacity-75"
                    }`}
                  >
                    <span
                      className={`block text-lg md:text-xl font-semibold text-dark-blue ${
                        isActive ? "mb-1" : ""
                      }`}
                    >
                      {item.year}
                    </span>
                    {item.title && (
                      <span className="block text-sm md:text-base font-semibold text-dark-blue">
                        {item.title}
                      </span>
                    )}
                    {isActive && item.description && (
                      <p className="mt-2 text-sm md:text-base text-low-dark-blue leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Progress dots */}
            <div className="flex gap-2 mt-6 pl-5">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-1 rounded-sm transition-all duration-300 ${
                    index === activeIndex
                      ? "w-12 bg-red"
                      : "w-3 bg-gray"
                  }`}
                  aria-label={`Ir para item ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex-1">
            <div className="relative w-full aspect-[598/440] rounded-xl overflow-hidden">
              {activeItem?.image?.url && (
                <Image
                  src={activeItem.image.url}
                  alt={activeItem.image.alt || activeItem.title || ""}
                  fill
                  className="object-cover transition-opacity duration-300"
                />
              )}
            </div>
          </div>
        </div>

        {/* Mobile layout - Swiper */}
        <div className="md:hidden relative pb-12">
          <Swiper
            modules={[Pagination]}
            spaceBetween={16}
            slidesPerView={1.15}
            centeredSlides={true}
            pagination={{
              clickable: true,
              el: ".swiper-pagination-history",
              type: "bullets",
              renderBullet: function (index: number, className: string) {
                return '<span class="' + className + ' custom-bullet-red"></span>';
              },
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            className="w-full"
          >
            {items.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="bg-white rounded-lg border border-gray overflow-hidden">
                  {item.image?.url && (
                    <div className="relative w-full aspect-video">
                      <Image
                        src={item.image.url}
                        alt={item.image.alt || item.title || ""}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="block text-lg font-semibold text-dark-blue mb-1">
                      {item.year}
                    </span>
                    {item.title && (
                      <span className="block text-base font-semibold text-dark-blue mb-2">
                        {item.title}
                      </span>
                    )}
                    {item.description && (
                      <p className="text-sm text-low-dark-blue leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="swiper-pagination-history !static flex justify-center gap-x-2 mt-4"></div>
        </div>
      </div>
    </section>
  );
}

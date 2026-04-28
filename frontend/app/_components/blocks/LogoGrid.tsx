"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

interface LogoItem {
  logo?: { url: string; alt?: string };
}

interface LogoGridProps {
  title?: string;
  subtitle?: string;
  logos?: LogoItem[];
}

export default function LogoGrid({ title, subtitle, logos }: LogoGridProps) {
  const safeLogos = Array.isArray(logos) ? logos : [];

  if (!title && safeLogos.length === 0) return null;

  // Duplicate logos to ensure enough slides for seamless infinite loop
  const minSlides = 15;
  const extendedLogos = [...safeLogos];
  while (extendedLogos.length > 0 && extendedLogos.length < minSlides) {
    extendedLogos.push(...safeLogos);
  }

  return (
    <section className="w-full py-6 md:py-10 lg:py-[80px] bg-neutral">
      <div className="container mx-auto px-4">
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

        {/* Logo carousel - clipped within container */}
        <div className="w-full overflow-hidden">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={12}
            slidesPerView="auto"
            loop={true}
            speed={3000}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            className="w-full linear-swiper"
            allowTouchMove={false}
          >
            {extendedLogos.map((item, index) => (
              <SwiperSlide key={index} className="!w-[194px]">
                <div className="w-full h-[125px] bg-white rounded-[10.8px] p-2 border-[1.8px] border-[#E5E7EB] flex flex-col items-start shrink-0">
                  <div className="w-full flex-1 bg-neutral-2 rounded-[7.2px] border-[1.35px] border-[#E5E7EB] flex items-center justify-center px-[14.4px] py-4">
                    {item.logo?.url && (
                      <div className="relative w-full h-[80px]">
                        <Image
                          src={item.logo.url}
                          alt={item.logo.alt || ""}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

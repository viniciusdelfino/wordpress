"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

interface AcfImage {
  url: string;
  alt?: string;
  [key: string]: any;
}

interface WhatWeDoCard {
  icon?: AcfImage;
  titulo?: string;
  title?: string;
  subtitulo?: string;
  description?: string;
  imagem_de_fundo?: AcfImage;
  image?: AcfImage;
}

interface WhatWeDoProps {
  title?: string;
  subtitle?: string;
  cards?: WhatWeDoCard[];
}

function Card({
  card,
  index,
}: {
  card: WhatWeDoCard;
  index: number;
}) {
  const number = String(index + 1).padStart(2, "0");
  const bgImage = card.imagem_de_fundo || card.image;
  const cardTitle = card.titulo || card.title;
  const cardSubtitle = card.subtitulo || card.description;

  return (
    <div className="group relative flex flex-col h-[420px] rounded-lg overflow-hidden px-6 py-8">
      {/* Background image — zoomed in by default, zooms out on hover */}
      {bgImage?.url && (
        <Image
          src={bgImage.url}
          alt={bgImage.alt || cardTitle || ""}
          fill
          className="object-cover z-0 scale-110 transition-transform duration-500 ease-out group-hover:scale-100"
        />
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-[1] rounded-lg"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(0, 20, 80, 0) 0%, rgba(0, 20, 80, 0.9) 100%), linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.3) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-[2] flex flex-col justify-between flex-1">
        <span className="text-white text-base font-semibold leading-6">
          {number}
        </span>

        <div className="flex flex-col gap-2">
          {card.icon?.url && (
            <div className="w-12 h-12">
              <Image
                src={card.icon.url}
                alt={card.icon.alt || ""}
                width={48}
                height={48}
              />
            </div>
          )}
          {cardTitle && (
            <h3 className="text-white text-xl md:text-2xl font-semibold leading-normal">
              {cardTitle}
            </h3>
          )}
          {/* Subtitle — hidden by default, fades in on hover */}
          {cardSubtitle && (
            <p className="text-white/80 text-sm leading-relaxed max-h-0 opacity-0 overflow-hidden transition-all duration-500 ease-out group-hover:max-h-24 group-hover:opacity-100 group-hover:mt-1">
              {cardSubtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WhatWeDo({
  title,
  subtitle,
  cards,
}: WhatWeDoProps) {
  if (!cards || cards.length === 0) return null;

  return (
    <section className="w-full py-10 md:py-16 lg:py-20 bg-white what-we-do">
      <div className="container mx-auto px-4 lg:px-[90px]">
        <div className="mb-8 md:mb-10">
          {title && (
            <h2 className="text-2xl md:text-3xl lg:text-[2rem] font-semibold text-dark-blue leading-tight mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-base md:text-lg lg:text-xl text-low-dark-blue leading-normal max-w-[800px]">
              {subtitle}
            </p>
          )}
        </div>

        {/* Desktop: 4 cards grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <Card key={index} card={card} index={index} />
          ))}
        </div>

        {/* Mobile: Swiper */}
        <div className="md:hidden relative pb-10">
          <Swiper
            modules={[Pagination]}
            spaceBetween={16}
            slidesPerView={1.15}
            pagination={{
              clickable: true,
              el: ".swiper-pagination-whatwedo",
              type: "bullets",
              renderBullet: function (index: number, className: string) {
                return (
                  '<span class="' +
                  className +
                  ' custom-bullet"></span>'
                );
              },
            }}
            className="w-full"
          >
            {cards.map((card, index) => (
              <SwiperSlide key={index}>
                <Card card={card} index={index} />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="swiper-pagination-whatwedo !static flex justify-center gap-x-2 mt-4"></div>
        </div>
      </div>
    </section>
  );
}

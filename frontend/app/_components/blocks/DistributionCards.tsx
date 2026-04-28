"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

interface DistributionCard {
  icon?: {
    url: string;
    alt?: string;
  };
  title?: string;
  description?: string;
  image?: {
    url: string;
    alt?: string;
  };
  button_text?: string;
  button_url?: string;
  button_style?: "primary" | "link";
}

interface DistributionCardsProps {
  title?: string;
  subtitle?: string;
  cards?: DistributionCard[];
}

function PlusIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <circle cx="16" cy="16" r="15.5" stroke="#001450" />
      <path
        d="M16 10V22"
        stroke="#001450"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 16H22"
        stroke="#001450"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DistributionCards({
  title,
  subtitle,
  cards,
}: DistributionCardsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!cards || cards.length === 0) return null;

  return (
    <section className="w-full py-10 md:py-16 lg:py-20 bg-white distribution-cards">
      <div className="container mx-auto px-4">
        <div className="mb-8 md:mb-12">
          {title && (
            <h2 className="text-2xl md:text-3xl lg:text-[2rem] font-semibold text-dark-blue leading-tight mb-3">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm md:text-base lg:text-xl text-low-dark-blue leading-relaxed max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:flex gap-6 h-[400px]">
          {cards.map((card, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={index}
                onMouseEnter={() => setActiveIndex(index)}
                style={{
                  flexGrow: isActive ? 2.2 : 1,
                  flexShrink: 0,
                  flexBasis: "0%",
                  transition: "flex-grow 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className="relative bg-neutral-2 rounded-lg p-5 cursor-pointer min-w-0 overflow-hidden"
              >
                <div className="flex gap-4 h-full">
                  {/* Text content */}
                  <div className="flex-1 flex flex-col justify-between h-full min-w-0">
                    <div className="flex flex-col gap-4">
                      {card.icon?.url && (
                        <div className="size-[50px] shrink-0">
                          <Image
                            src={card.icon.url}
                            alt={card.icon.alt || ""}
                            width={50}
                            height={50}
                          />
                        </div>
                      )}
                      {card.title && (
                        <h3 className="text-[20px] font-semibold text-dark-blue leading-[1.4] tracking-[-0.3px] whitespace-nowrap">
                          {card.title}
                        </h3>
                      )}
                      {/* Description — fade in after card settles, hide instantly */}
                      <div
                        className="overflow-hidden"
                        style={
                          isActive
                            ? {
                                maxHeight: "10rem",
                                opacity: 1,
                                transition:
                                  "max-height 300ms ease 400ms, opacity 300ms ease 400ms",
                              }
                            : {
                                maxHeight: 0,
                                opacity: 0,
                                transition:
                                  "max-height 0ms ease 0ms, opacity 0ms ease 0ms",
                              }
                        }
                      >
                        {card.description && (
                          <p className="text-[14px] text-[#686d71] leading-[1.4] max-w-[234px]">
                            {card.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* CTA button — fade in after card settles, hide instantly */}
                    <div
                      style={
                        isActive
                          ? {
                              opacity: 1,
                              visibility: "visible" as const,
                              transition:
                                "opacity 300ms ease 400ms, visibility 0ms ease 0ms",
                            }
                          : {
                              opacity: 0,
                              visibility: "hidden" as const,
                              transition:
                                "opacity 0ms ease 0ms, visibility 0ms ease 0ms",
                            }
                      }
                    >
                      {card.button_url && card.button_text && (
                        <Link
                          href={card.button_url}
                          className="flex items-center justify-center bg-red text-white text-base px-4 py-3 rounded hover:bg-[#b00008] transition-colors w-full"
                        >
                          {card.button_text}
                        </Link>
                      )}
                    </div>
                    {/* "Saiba mais" — visible when collapsed, hide instantly when expanding */}
                    <div
                      className="absolute bottom-5 left-5 right-5"
                      style={
                        isActive
                          ? {
                              opacity: 0,
                              visibility: "hidden" as const,
                              transition:
                                "opacity 0ms ease 0ms, visibility 0ms ease 0ms",
                            }
                          : {
                              opacity: 1,
                              visibility: "visible" as const,
                              transition:
                                "opacity 300ms ease 400ms, visibility 0ms ease 400ms",
                            }
                      }
                    >
                      {card.button_url && (
                        <Link
                          href={card.button_url}
                          className="flex items-center justify-between py-[10px] w-full"
                        >
                          <span className="text-base font-semibold text-low-dark-blue">
                            Saiba mais
                          </span>
                          <PlusIcon />
                        </Link>
                      )}
                    </div>
                  </div>
                  {/* Image — width transitions with card, opacity fades in after */}
                  {card.image?.url && (
                    <div
                      className="relative shrink-0 h-full rounded-lg overflow-hidden"
                      style={
                        isActive
                          ? {
                              width: "252px",
                              opacity: 1,
                              transition:
                                "width 500ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, opacity 300ms ease 400ms",
                            }
                          : {
                              width: "0px",
                              opacity: 0,
                              transition:
                                "width 500ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, opacity 0ms ease 0ms",
                            }
                      }
                    >
                      <Image
                        src={card.image.url}
                        alt={card.image.alt || ""}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile + Tablet layout - Swiper */}
        <div className="lg:hidden relative pb-12">
          <Swiper
            modules={[Pagination]}
            spaceBetween={16}
            slidesPerView={1.15}
            centeredSlides={true}
            breakpoints={{
              768: {
                slidesPerView: 2.2,
                centeredSlides: false,
              },
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination-distribution",
              type: "bullets",
              renderBullet: function (index: number, className: string) {
                return '<span class="' + className + ' custom-bullet"></span>';
              },
            }}
            className="w-full"
          >
            {cards.map((card, index) => (
              <SwiperSlide key={index}>
                <div className="border border-gray rounded-lg overflow-hidden bg-white">
                  {index === 0 && card.image?.url && (
                    <div className="relative w-full aspect-video">
                      <Image
                        src={card.image.url}
                        alt={card.image.alt || ""}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 flex flex-col">
                    {card.icon?.url && (
                      <div className="mb-3">
                        <Image
                          src={card.icon.url}
                          alt={card.icon.alt || ""}
                          width={40}
                          height={40}
                        />
                      </div>
                    )}
                    {card.title && (
                      <h3 className="text-base font-semibold text-dark-blue mb-2">
                        {card.title}
                      </h3>
                    )}
                    {card.description && (
                      <p className="text-sm text-low-dark-blue leading-relaxed mb-4">
                        {card.description}
                      </p>
                    )}
                    {card.button_url && card.button_text && (
                      <Link
                        href={card.button_url}
                        className="flex items-center justify-center bg-red text-white text-sm font-medium px-4 py-3 rounded hover:bg-[#b00008] transition-colors w-full"
                      >
                        {card.button_text}
                      </Link>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="swiper-pagination-distribution !static flex justify-center gap-x-2 mt-4"></div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface RaceCard {
  image: {
    url: string;
    alt: string;
  };
  title: string;
  subtitle: string;
  description: string;
  numbers: {
    number: string;
    label: string;
  }[]
  button: {
    title: string;
    url: string;
    target: string;
  }
}

interface RaceCardsProps {
  desc?: string;
  dark_theme?: boolean;
  list?: RaceCard[];
}

export default function RaceCards({
  desc,
  list,
  dark_theme = false,
  ...rest
}: RaceCardsProps & Record<string, any>) {
  // Fallback: ACF may send "lsit" (typo) instead of "list"
  const resolvedList = list || rest.lsit;
  const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLElement | null>(null);
  const [paginationEl, setPaginationEl] = useState<HTMLElement | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section className={`highlighted-products race-cards pt-10 md:pt-[3.75rem] lg:pt-12 ${dark_theme ? "bg-[#010101] pb-15" : "bg-white"}`}>
      <div className="container">
        <div className="grid grid-cols-12 gap-y-6 lg:gap-y-0 items-end">
          <div className="col-span-12 lg:col-span-9">
            {desc && (
              <div
                className={`prose-headings:text-2xl prose-headings:md:text-[1.75rem] prose-headings:lg:text-[2rem] prose-headings:font-bold  prose-p:text-base lg:prose-p:text-lg  leading-tight ${dark_theme ? "prose-headings:text-white prose-p:text-neutral-2" : "prose-headings:text-dark-blue prose-p:text-low-dark-blue"}`}
                dangerouslySetInnerHTML={{ __html: desc }}
              />
            )}
          </div>
        </div>

        {resolvedList && resolvedList.length > 0 && (
          <div className="mt-10 lg:mt-12 pb-20 relative">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={1.15}
              navigation={{ prevEl, nextEl }}
              pagination={{
                el: paginationEl,
                clickable: true,
                renderBullet: (index, className) => {
                  return `<span class="${className} custom-bullet"></span>`;
                },
              }}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="products-swiper"
            >
              {resolvedList.map((item: RaceCard, index: number) => {
                const isFlipped = flippedCards[index] || false;

                return (
                  <SwiperSlide key={index} className="!h-auto">
                    <div
                      className="group relative w-full h-[26.875rem] [perspective:1000px] cursor-pointer"
                      onClick={() => toggleFlip(index)}
                    >
                      <div
                        className={`relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] grid grid-cols-1 group-hover:[transform:rotateY(180deg)] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
                      >
                        {/* --- FRONT --- */}
                        <div className="relative col-start-1 row-start-1 w-[314px] h-[430px] lg:w-full lg:h-full min-h-[26.875rem] xl:min-h-0 [backface-visibility:hidden] rounded-lg overflow-hidden">
                          <Image
                            src={item.image.url}
                            alt={item.image.alt}
                            fill
                            className="object-cover"
                          />

                          <div
                            className="absolute inset-0 pointer-events-none"
                            aria-hidden
                            style={{ background: 'linear-gradient(0deg, rgba(7, 11, 18, 0.8), rgba(7, 11, 18, 0.8))' }}
                          />


                          <div className="absolute bottom-0 left-0 w-full p-2">
                            <div className="flex items-center justify-between backdrop-blur-[2px] bg-white/7 border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-3 text-white min-h-[4.25rem]">
                              <div className="flex flex-col gap-1 pr-2">
                                <h3 className="uppercase font-semibold text-sm md:text-base">
                                  {item.title}
                                </h3>
                                <div className="text-xs md:text-sm" dangerouslySetInnerHTML={{ __html: item.subtitle }} />
                              </div>
                              <div className="shrink-0">
                                <img
                                  src="/icons/plus.svg"
                                  alt="Ver mais"
                                  className="w-8 h-8"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* --- BACK --- */}
                        <div className="relative col-start-1 row-start-1 w-[314px] h-[430px] lg:w-full lg:h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white rounded-lg overflow-hidden border border-[#6D7280] flex flex-col">
                          <div className="">
                            <div className="relative h-[108px]">
                              <Image
                                src={item.image.url}
                                alt={item.image.alt}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1280px) 100vw, 261px"
                                unoptimized={true}
                              />
                            </div>
                            <div className="p-6">
                              <h3 className="text-dark-blue font-semibold text-base xl:text-lg mb-4">
                                {item.title}
                              </h3>
                              <p
                                className="text-xs md:text-sm text-[#333333] mb-5 line-clamp-3"
                                dangerouslySetInnerHTML={{
                                  __html: item.description,
                                }}
                              />
                              <div className="grid grid-cols-2 gap-2">
                                {item.numbers.map((number, index) => (
                                  <div key={index} className="bg-[#F3F4F6] rounded-b-sm px-4 py-[10px] flex flex-col gap-1">
                                    <span className="text-dark-blue text-[28px] font-semibold">
                                      {number.number}
                                    </span>
                                    <span className="text-dark-blue text-[13px] leading-[19.5px]">
                                      {number.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {
                                item.button && (
                                  <Link
                                    href={item.button.url}
                                    target={item.button.target}
                                    className="flex items-center justify-center bg-red text-white text-base px-4 py-3 mt-6 rounded hover:bg-[#b00008] transition-colors w-full font-semibold"
                                  >
                                    {item.button.title}
                                  </Link>
                                )
                              }

                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                )
              })}
            </Swiper>
            <div className="absolute bottom-0 left-0 w-full flex justify-center items-center gap-x-4 z-10 pointer-events-none">
              <button
                ref={setPrevEl}
                className={`swiper-button-prev-custom w-10 h-10 flex items-center justify-center border ${dark_theme ? "border-white text-white hover:bg-white" : "border-dark-blue/30 text-dark-blue hover:bg-dark-blue"} rounded-md  hover:text-white transition-colors pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed prose-span:bg-[#686D71] bg-transparent!`}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6"></path>
                </svg>
              </button>

              <div
                ref={setPaginationEl}
                className="swiper-pagination-cat  !static !w-auto flex gap-x-2 pointer-events-auto"
              ></div>

              <button
                ref={setNextEl}
                className={`swiper-button-next-custom w-10 h-10 flex items-center justify-center border ${dark_theme ? "border-white text-white hover:bg-white" : "border-dark-blue/30 text-dark-blue hover:bg-dark-blue"} rounded-md  hover:text-white transition-colors pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed prose-span:bg-[#686D71] bg-transparent!`}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6"></path>
                </svg>
              </button>
            </div>
          </div>
        )
        }
      </div >
    </section >
  );
}

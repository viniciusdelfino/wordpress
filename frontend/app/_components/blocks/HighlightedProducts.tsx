"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface HighlightedProductsProps {
  desc?: string;
  button?: {
    title: string;
    url: string;
    target: string;
  };
  dark_theme?: boolean;
  list?: any[];
}

export default function HighlightedProducts({
  desc,
  button,
  list,
  dark_theme = false,
}: HighlightedProductsProps) {
  const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLElement | null>(null);
  const [paginationEl, setPaginationEl] = useState<HTMLElement | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section className={`highlighted-products ${dark_theme ? "dark-theme" : ""} pt-10 md:pt-[3.75rem] lg:pt-12 ${dark_theme ? "bg-[#010101] pb-15" : "bg-white"}`}>
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

          <div className="col-span-12 lg:col-start-10 lg:col-span-3 flex justify-start lg:justify-end">
            {button && (
              <Link
                href={button.url}
                target={button.target}
                className="inline-flex items-center justify-center gap-x-2 bg-dark-blue text-white text-sm md:text-base py-2 rounded-sm w-full md:min-w-[18.875rem] h-10"
              >
                {button.title}
              </Link>
            )}
          </div>
        </div>

        {/* Carrossel de Produtos */}
        {list && list.length > 0 && (
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
                1024: { slidesPerView: 2 },
              }}
              className="products-swiper"
            >
              {list.map((item: any, index: number) => {
                const { post_title: title, post_name: slug } = item;
                const { acf = {}, sf = {} } = item.extended_data || {};
                const isFlipped = flippedCards[index] || false;

                const sku = sf.StockKeepingUnit || 'unknown';
                const description = sf.Description || '';
                const viscosity = sf.Viscosity__c || "N/A";
                const application = sf.ProductApplication__c || "N/A";
                const technology = sf.IndustryClassifications__c || "N/A";
                const imageUrl = sf.DisplayUrl || "/images/image-12.png";

                const highlightDescription = (text: string, term: string) => {
                  if (!text) return "";
                  if (!term) return text || "";

                  const escapedTerm = term.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&",
                  );
                  const exactRegex = new RegExp(`(${escapedTerm})`, "gi");

                  return text.replace(exactRegex, "<strong>$1</strong>");
                };

                return (
                  <SwiperSlide key={item.ID || index} className="!h-auto">
                    <div
                      className={`group relative w-full h-[26.875rem] [perspective:1000px] cursor-pointer product-sku-${sku}`}
                      onClick={() => toggleFlip(index)}
                    >
                      <div
                        className={`relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] grid grid-cols-1 group-hover:[transform:rotateY(180deg)] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
                      >
                        {/* --- FRONT --- */}
                        <div className="relative col-start-1 row-start-1 w-[314px] h-[430px] lg:w-full lg:h-full min-h-[26.875rem] xl:min-h-0 [backface-visibility:hidden] rounded-lg overflow-hidden">
                          <Image
                            src={
                              acf.thumb_products?.url || "/images/FlipCard.jpg"
                            }
                            alt={title}
                            fill
                            className="object-cover"
                          />

                          <div className="absolute bottom-0 left-0 w-full p-2">
                            <div className="flex items-center justify-between backdrop-blur-[2px] bg-white/7 border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-3 text-white min-h-[4.25rem]">
                              <div className="flex flex-col gap-1 pr-2">
                                <h3 className="uppercase font-semibold text-sm md:text-base">
                                  {title}
                                </h3>
                                {acf.shortdesc_products && (
                                  <div
                                    className="text-xs md:text-sm"
                                    dangerouslySetInnerHTML={{
                                      __html: acf.shortdesc_products,
                                    }}
                                  />
                                )}
                              </div>
                              <div className="shrink-0">
                                <Image
                                  src="/icons/plus.svg"
                                  alt="Ver mais"
                                  width={32}
                                  height={32}
                                  className="w-8 h-8"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* --- BACK --- */}
                        <div className="relative col-start-1 row-start-1 w-[314px] h-[430px] lg:w-full lg:h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white rounded-lg overflow-hidden border border-[#6D7280] flex flex-col p-6">
                          <div className="flex flex-col xl:flex-row flex-1 gap-6 min-h-0">
                            <div className="relative w-full h-[10rem] xl:w-[16.3125rem] xl:h-[20.375rem] shrink-0 hidden lg:block">
                              <Image
                                src={imageUrl}
                                alt={title}
                                fill
                                className="object-contain"
                                sizes="(max-width: 1280px) 100vw, 261px"
                                unoptimized={true}
                              />
                            </div>
                            <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
                              <h3 className="text-dark-blue font-semibold text-base xl:text-lg uppercase mb-4">
                                {title}
                              </h3>
                              <p
                                className="text-xs md:text-sm text-[#333333] mb-5 line-clamp-3"
                                dangerouslySetInnerHTML={{
                                  __html: highlightDescription(
                                    description,
                                    title,
                                  ),
                                }}
                              />

                              <div className="grid grid-cols-2 gap-2 mb-5">
                                <div className="rounded-[0.625rem] bg-[#F6F6F6] px-2 py-2">
                                  <span className="block text-dark-blue text-sm md:text-base">
                                    Aplicação
                                  </span>
                                  <span className="block text-low-dark-blue text-xs md:text-sm">
                                    {application}
                                  </span>
                                </div>
                                <div className="rounded-[0.625rem] bg-[#F6F6F6] px-2 py-2">
                                  <span className="block text-dark-blue text-sm md:text-base">
                                    Tecnologia
                                  </span>
                                  <span className="block text-low-dark-blue text-xs md:text-sm">
                                    {technology}
                                  </span>
                                </div>
                                <div className="col-span-1 xl:col-span-2 rounded-[0.625rem] bg-[#F6F6F6] px-2 py-2">
                                  <span className="block text-dark-blue text-sm md:text-base">
                                    Viscosidade
                                  </span>
                                  <span className="block text-low-dark-blue text-xs md:text-sm">
                                    {viscosity}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col gap-3 mt-auto">
                                <div className="flex flex-row gap-4 text-xs md:text-sm font-medium underline text-dark-blue">
                                  <Link
                                    href="#"
                                    className="flex gap-x-[0.25rem] items-center"
                                  >
                                    <Image
                                      src="/icons/download.svg"
                                      width={16}
                                      height={16}
                                      alt="Download"
                                    />
                                    Ficha Técnica
                                  </Link>
                                  <Link
                                    href="#"
                                    className="flex gap-x-[0.25rem] items-center"
                                  >
                                    <Image
                                      src="/icons/download.svg"
                                      width={16}
                                      height={16}
                                      alt="Download"
                                    />
                                    Ficha de Segurança
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 w-full shrink-0">
                            <Link
                              href={`/${sf.category_slug || 'product'}/${slug}`}
                              className="flex items-center justify-center bg-red text-white text-sm md:text-base font-semibold py-[0.625rem] px-4 rounded-sm w-full h-[2.3125rem] md:h-[2.5rem]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Ver detalhes
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
            <div className="absolute bottom-0 left-0 w-full flex justify-center items-center gap-x-4 z-10 pointer-events-none">
              <button
                ref={setPrevEl}
                className={`swiper-button-prev-custom w-10 h-10 flex items-center justify-center border ${dark_theme ? "border-white text-white hover:bg-white" : "border-dark-blue/30 text-dark-blue hover:bg-dark-blue"} rounded-md  hover:text-white transition-colors pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed prose-span:bg-[#686D71]`}
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
                className={`swiper-button-next-custom w-10 h-10 flex items-center justify-center border ${dark_theme ? "border-white text-white hover:bg-white" : "border-dark-blue/30 text-dark-blue hover:bg-dark-blue"} rounded-md  hover:text-white transition-colors pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed prose-span:bg-[#686D71]`}
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
        )}
      </div>
    </section>
  );
}

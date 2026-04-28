"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination, Navigation } from "swiper/modules";

interface ToolItem {
  image: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  title: string;
  desc: string;
  list_2?: { text: string }[];
  button?: {
    title: string;
    url: string;
    target?: string;
  };
}

interface KnowOurToolsProps {
  desc?: string;
  list?: ToolItem[];
}

function ToolCard({ item, mobileMode = false }: { item: ToolItem; mobileMode?: boolean }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    if (mobileMode) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div
      className={`${mobileMode ? "[perspective:1000px]" : "flip-card"} h-[21.875rem] w-full cursor-pointer group`}
      onClick={handleClick}
    >
      <div className={`flip-card-inner w-full h-full relative ${mobileMode && isFlipped ? "[transform:rotateY(180deg)]" : ""}`}>
        {/* Frente */}
        <div className="flip-card-front absolute w-full h-full bg-white rounded-xl overflow-hidden shadow-lg border border-gray">
          <div className="relative w-full h-full">
            {item.image && (
              <Image
                src={item.image.url}
                alt={item.image.alt || item.title}
                fill
                className="object-cover z-1"
              />
            )}
            <Image
              src="/images/bg-blue.png"
              alt=""
              fill
              className="object-cover"
            />

            <div className="absolute bottom-0 left-0 w-full flex items-center justify-between p-4 bg-gradient-to-t from-black/80 to-transparent z-20" style={{ transform: "translateZ(20px)" }}>
              <h3 className="text-white text-lg">
                {item.title}
              </h3>
              <Image
                src="/icons/plus.svg"
                width={32}
                height={32}
                alt="Ver mais"
                className="rounded-full flex items-center justify-center"
              />
            </div>
          </div>
        </div>

        {/* Verso */}
        <div className="flip-card-back absolute w-full h-full bg-dark-blue rounded-xl overflow-hidden p-4 flex flex-col shadow-lg text-white">
          <div
            className="prose prose-invert mb-4 text-sm prose-headings:text-base prose-headings:mb-2 md:prose-headings:text-lg lg:prose-headings:text-xl leading-snug prose-headings:font-normal md:prose-p:text-sm prose-p:mb-1 prose-p:text-xs prose-p:font-light prose-p:text-white line-clamp-6 lg:prose-headings:mb-4"
            dangerouslySetInnerHTML={{ __html: item.desc }}
          />

          {item.list_2 && (
            <ul className="flex flex-col gap-y-4 md:gap-y-[10px] lg:grid lg:grid-cols-3 lg:gap-y-4">
              {item.list_2.map((li, i) => (
                <li key={i} className="flex items-start gap-x-2 text-xs font-normal">
                  <Image
                    src="/icons/check_border_white.svg"
                    width={12}
                    height={12}
                    alt=""
                    className="mt-1 shrink-0 lg:w-[0.875rem] lg:h-[0.875rem]"
                  />
                  <span className="md:text-sm">{li.text}</span>
                </li>
              ))}
            </ul>
          )}

          {item.button && (
            <Link
              href={item.button.url}
              target={item.button.target}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center mt-auto block w-full border border-white text-white text-center h-[1.8125rem] lg:h-8 rounded-sm text-sm lg:text-base"
            >
              {item.button.title}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KnowOurTools({ desc, list }: KnowOurToolsProps) {
  return (
    <section className="know-our-tools container py-10 md:py-15 lg:py-20">
      {desc && (
        <div
          className="prose-headings:text-dark-blue prose-headings:font-semibold prose-headings:text-2xl prose-headings:mb-2 md:prose-headings:text-[1.75rem] lg:prose-headings:text-[2rem] prose-p:text-base md:prose-headings:text-lg prose-p:text-low-dark-blue mb-6 md:mb-8 lg:mb-10"
          dangerouslySetInnerHTML={{ __html: desc }}
        />
      )}

      {/* Desktop Grid */}
      <div className={`hidden lg:grid gap-4 ${list && list.length % 3 === 0 ? "grid-cols-3" : "grid-cols-2"}`}>
        {list?.map((item, index) => (
          <ToolCard key={index} item={item} />
        ))}
      </div>

      {/* Mobile Swiper */}
      <div className="block lg:hidden">
        <Swiper
          modules={[Pagination, Navigation]}
          navigation={{
            nextEl: ".swiper-button-next-tool",
            prevEl: ".swiper-button-prev-tool",
          }}
          spaceBetween={16}
          slidesPerView={1.2}
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
          }}
          pagination={{
            clickable: true,
            el: ".swiper-pagination-tools",
            type: "bullets",
            renderBullet: function (index, className) {
              return '<span class="' + className + ' custom-bullet"></span>';
            },
          }}
          className="w-full"
        >
          {list?.map((item, index) => (
            <SwiperSlide key={index}>
              <ToolCard item={item} mobileMode={true} />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="flex w-full items-center justify-center pt-8 gap-x-4 order-1 md:order-2">
          <button className="swiper-button-prev-tool w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="swiper-pagination-tools !static !w-auto flex gap-x-2"></div>
          <button className="swiper-button-next-tool w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

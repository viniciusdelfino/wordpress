"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ArrowIcon = () => (
  <Image
    src="/icons/arrow-right-gray-circle.svg"
    alt="Ícone de seta"
    width={32}
    height={32}
  />
);

interface CardData {
  image: {
    url: string;
    alt: string;
  };
  title_desc: string;
  link: {
    title: string;
    url: string;
    target: string;
  };
}

interface InfoCardsFourProps {
  card: CardData[];
}

function getDesktopSpanClass(totalCards: number): string {
  if (totalCards === 2) return "lg:col-span-6";
  if (totalCards === 4) return "lg:col-span-3";
  if (totalCards === 1) return "lg:col-span-12";
  if (totalCards === 3) return "lg:col-span-4";
  return "lg:col-span-3";
}

function getCardHeightClass(totalCards: number): string {
  if (totalCards === 2) return "h-[270px] min-h-[270px] max-h-[270px]";
  if (totalCards === 4) return "h-[213px] min-h-[213px] max-h-[213px]";
  return "h-[213px] min-h-[213px] max-h-[213px]";
}

export default function InfoCardsFour({ card }: InfoCardsFourProps) {
  const desktopSpanClass = getDesktopSpanClass(card?.length || 0);
  const cardHeightClass = getCardHeightClass(card?.length || 0);

  return (
    <section className="w-full py-10 md:py-15 lg:py-20 info-cards-four">
      <div className="container mx-auto px-4">
        <div className="md:hidden relative pb-16">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={16}
            slidesPerView={1.15}
            centeredSlides={true}
            navigation={{
              nextEl: ".swiper-button-next-info",
              prevEl: ".swiper-button-prev-info",
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination-info",
              type: "bullets",
              renderBullet: function (index, className) {
                return '<span class="' + className + ' custom-bullet"></span>';
              },
            }}
            className="w-full"
          >
            {card?.map((item, index) => (
              <SwiperSlide key={index}>
                <CardItem item={item} index={index} cardHeightClass={cardHeightClass} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute bottom-0 left-0 w-full flex justify-center items-center gap-x-4">
            <button className="swiper-button-prev-info w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
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
            <div className="swiper-pagination-info !static !w-auto flex gap-x-2"></div>
            <button className="swiper-button-next-info w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
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

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-12 md:gap-6">
          {card?.map((item, index) => (
            <div key={index} className={`w-full h-full ${desktopSpanClass}`}>
              <CardItem item={item} index={index} cardHeightClass={cardHeightClass} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface CardItemProps {
  item: CardData;
  index: number;
  cardHeightClass: string;
}

const CardItem = ({ item, index, cardHeightClass }: CardItemProps) => {
  const { image: cardImage, title_desc, link } = item;
  const pathD =
    "M8.00024 0.5C3.85813 0.500001 0.500281 3.8579 0.500244 8V204C0.500287 208.142 3.85813 211.5 8.00024 211.5H297C301.142 211.5 304.5 208.142 304.5 204V59.7295L269.675 29.8799L269.672 29.8779L235.813 0.5H8.00024Z";
  
    const svgMask = `data:image/svg+xml,${encodeURIComponent(
    `<svg viewBox="0 0 303 212" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="${pathD}" fill="black"/></svg>`
  )}`;
  return (
    <div className="relative group cursor-pointer h-full w-full">
      <div className={`relative w-full ${cardHeightClass}`}>
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            maskImage: `url("${svgMask}")`,
            WebkitMaskImage: `url("${svgMask}")`,
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
          }}
        >
          <Image
            src={cardImage?.url}
            alt={cardImage?.alt || "Imagem do card"}
            fill
            className="object-cover object-center"
          />
          <Image
            src="/images/degrade-cards-ajuda.png"
            alt=""
            fill
            className="object-cover object-center pointer-events-none"
            aria-hidden="true"
          />
        </div>
        <svg
          viewBox="0 0 303 212"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >          
          <path d={pathD} stroke="white" strokeOpacity="0.2" fill="none" />
        </svg>

        <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">
          <div
            className="[&>h3]:text-sm [&>h3]:md:text-base [&>h3]:lg:text-xl [&>h3]:font-semibold [&>h3]:mb-2 [&>h3]:leading-tight [&>p]:text-sm [&>p]:text-gray-200 [&>p]:line-clamp-2 pr-8"
            dangerouslySetInnerHTML={{ __html: title_desc }}
          />
          <div className="absolute bottom-6 right-6 transition-transform duration-300 group-hover:-rotate-45">
            <ArrowIcon />
          </div>
        </div>
      </div>

      <Link
        href={link?.url || "#"}
        target={link?.target}
        className="absolute inset-0 z-20"
        aria-label={`Ir para ${link?.title || "Saiba mais"}`}
      />
    </div>
  );
};

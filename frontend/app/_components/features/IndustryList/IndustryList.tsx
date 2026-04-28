"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { wordpressAPI } from "@/app/lib/wordpress-api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface Industry {
  id: string | number;
  slug: string;
  title: string;
  featured_image?: string;
  excerpt: string;
}

interface IndustryListProps {
  content?: string;
}

function IndustryCard({ industry }: { industry: Industry }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        if (window.innerWidth < 1024) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      if (!isExpanded) setIsExpanded(true);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`relative block border border-gray rounded-[0.75rem] min-h-[23.9375rem] md:min-h-[22.25rem] lg:min-h-[25.9375rem] bg-white transition-all duration-300 group overflow-hidden cursor-pointer ${isExpanded ? 'py-10 px-4' : 'p-4'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <Link
        href={`/industria/${industry.slug}`}
        className="hidden lg:block absolute inset-0 z-10"
        aria-label={industry.title}
      />
      {isExpanded && (
        <Link
          href={`/industria/${industry.slug}`}
          className="lg:hidden absolute inset-0 z-10"
          aria-label={industry.title}
        />
      )}

      <div
        className={`relative w-full rounded-lg overflow-hidden transition-all duration-500 ease-in-out ${isExpanded
          ? "h-0"
          : "h-[17.625rem] md:h-[15.375rem] lg:h-[20.4375rem]"
          }`}
      >
        {industry.featured_image && (
          <Image
            src={industry.featured_image}
            alt={industry.title}
            fill
            className="object-cover"
          />
        )}
      </div>

      <div
        className={`border-t border-gray transition-all duration-500 ease-in-out ${isExpanded
          ? "lg:mt-4 mb-4 opacity-100"
          : "lg:mt-0 mb-0 opacity-0 h-0 border-none"
          }`}
      />

      <div
        className={`flex flex-row justify-between items-center ${isExpanded ? "" : "mt-6 lg:mt-4"
          } transition-all duration-300`}
      >
        <h2 className={`text-base md:text-lg lg:text-xl text-dark-blue ${isExpanded && 'text-xl md:text-[1.375rem] lg:text-2xl'}`}>
          {industry.title}
        </h2>
        <div className="relative w-10 h-10 flex items-center justify-center shrink-0 text-dark-blue">
          {isExpanded ? (
            <Image
              src="/icons/minus-blue.svg"
              alt="Expandir"
              width={40}
              height={40}
            />
          ) : (
            <Image
              src="/icons/plus-blue.svg"
              alt="Expandir"
              width={40}
              height={40}
            />
          )}
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out absolute left-4 right-4 ${isExpanded
          ? "bottom-10 opacity-100"
          : "bottom-0 opacity-0 pointer-events-none"
          }`}
      >
        <div
          className={`text-xs md:text-sm text-low-dark-blue line-clamp-7 ${isExpanded && 'text-sm '}`}
          dangerouslySetInnerHTML={{ __html: industry.excerpt }}
        />
      </div>
    </div>
  );
}

const INITIAL_VISIBLE = 6;

export default function IndustryList({ content }: IndustryListProps) {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const data = await wordpressAPI.getIndustries();
        if (Array.isArray(data)) {
          setIndustries(data);
        }
      } catch (error) {
        console.error("Erro ao carregar indústrias:", error);
      }
    };
    fetchIndustries();
  }, []);

  const industriesWithImage = industries.filter((i) => i.featured_image);
  const displayedIndustries = showAll
    ? industriesWithImage
    : industriesWithImage.slice(0, INITIAL_VISIBLE);
  const hasMore = industriesWithImage.length >= 7;

  return (
    <section className="container industry-list mb-10 md:mb-15 lg:mb-20">
      {content && (
        <div
          className="prose-headings:text-dark-blue prose-headings:font-semibold prose-headings:text-2xl md:prose-headings:text-[1.75rem] lg:prose-headings:text-[2rem] mb-6 md:mb-8 lg:mb-10 prose-p:text-low-dark-blue lg:prose-p:text-lg"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
      {/* Desktop View */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4">
        {displayedIndustries.map((industry) => (
          <div key={industry.id} className="lg:col-span-4 h-full">
            <IndustryCard industry={industry} />
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="hidden lg:flex justify-center mt-8">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="border border-dark-blue text-dark-blue rounded-sm px-6 py-[0.625rem] min-h-[2.3125rem] md:min-h[2.5rem] lg:w-[18.75rem]"
          >
            {showAll ? "Ver menos" : "Ver Todos"}
          </button>
        </div>
      )}

      {/* Mobile & Tablet View (Swiper) */}
      <div className="block lg:hidden relative">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          pagination={{
            el: ".swiper-pagination-contents",
            clickable: true,
            renderBullet: (index, className) => {
              return `<span class="${className} custom-bullet"></span>`;
            },
          }}
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
          }}
          navigation={{
            prevEl,
            nextEl,
          }}
        >
          {industriesWithImage.map((industry) => (
            <SwiperSlide key={industry.id} className="h-auto">
              <IndustryCard industry={industry} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center md:justify-between mt-6 gap-6">
          <Link
            href="/industria"
            className="text-dark-blue text-sm md:text-base border border-dark-blue rounded-sm px-6 py-[0.625rem] hover:bg-dark-blue hover:text-white transition-colors order-2 md:order-1 w-full md:w-[20rem] text-center"
          >
            Ver todos
          </Link>

          <div className="flex items-center gap-x-4 order-1 md:order-2">
            <button
              ref={(node) => setPrevEl(node)}
              className="industry-prev swiper-button-prev-content w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Anterior"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M15 18l-6-6 6-6"></path>
              </svg>
            </button>

            <div className="industry-pagination swiper-pagination-contents !static !w-auto flex gap-x-2"></div>

            <button
              ref={(node) => setNextEl(node)}
              className="industry-next swiper-button-next-content w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Próximo"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 18l6-6-6-6"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

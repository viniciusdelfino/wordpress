"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { wordpressAPI } from "@/app/lib/wordpress-api";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface BrowserByTopicProps {
  name?: string;
  desc?: string;
}

interface EditorialTerm {
  id: number;
  name: string;
  description?: string;
  slug: string;
  parent?: number;
  ordem?: number | string | null;
  _links?: {
    up?: Array<{ href: string }>;
  };
  image?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
}

const PARENT_EDITORIAL_SLUGS = [
  "guia-do-oleo",
  "mobil-frotas",
  "mobil-industria",
];

export default function BrowserByTopic({ name, desc }: BrowserByTopicProps) {
  const [editorials, setEditorials] = useState<EditorialTerm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEditorialTerms = async () => {
      try {
        const data = await wordpressAPI.getEditorialTerms();
        if (Array.isArray(data)) {
          setEditorials(data);
        }
      } catch (error) {
        console.error("Error fetching editorial terms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEditorialTerms();
  }, []);

  const parentEditorials = editorials.filter((term) => {
    // Primary rule: WP terms with parent=0 are root terms.
    if (typeof term.parent === "number") {
      return term.parent === 0;
    }

    // Fallback: some responses expose hierarchy only through _links.up.
    if (term._links?.up) {
      return term._links.up.length === 0;
    }

    // Final fallback: keep only known top-level categories.
    return PARENT_EDITORIAL_SLUGS.includes(term.slug);
  });

  const sortedEditorials = [...parentEditorials].sort((a, b) => {
    const orderA =
      a.ordem !== null && a.ordem !== undefined && a.ordem !== ""
        ? Number(a.ordem)
        : 999;
    const orderB =
      b.ordem !== null && b.ordem !== undefined && b.ordem !== ""
        ? Number(b.ordem)
        : 999;
    return orderA - orderB;
  });

  const Card = ({ editorial }: { editorial: EditorialTerm }) => (
    <article className="relative w-full h-[280px] md:h-[340px] rounded-2xl overflow-hidden bg-dark-blue">
      {/* Background image */}
      {editorial.image?.url && (
        <Image
          src={editorial.image.url}
          alt={editorial.image.alt || editorial.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      )}

      <Image
        src="/images/gradient-blue-01.png"
        alt=""
        fill
        className="object-cover"
      />

      {/* Content at the bottom */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 flex flex-col gap-y-2">
        {editorial.name && (
          <h3 className="text-white text-base md:text-lg lg:text-xl leading-snug">
            {editorial.name}
          </h3>
        )}

        {editorial.description && (
          <p className="text-white text-xs md:text-sm font-light leading-relaxed line-clamp-2">
            {editorial.description}
          </p>
        )}

        <Link
          href={`/blog/${editorial.slug}`}
          className="mt-1 text-white text-sm md:text-base border border-whhite text-center rounded-sm flex items-center justify-center hover:opacity-80 transition-opacity min-h-[2rem] px-4 rounded-sm"
        >
          Ver conteúdos
        </Link>
      </div>
    </article>
  );

  return (
    <section className="browser-by-topic py-10 lg:py-11">
      <div className="container">
        {desc && (
          <div dangerouslySetInnerHTML={{ __html: desc }} className="prose-headings:text-dark-blue prose-p:text-low-dark-blue prose-headings:font-semibold prose-headings:text-2xl md:prose-headings:text-[1.75rem] lg:prose-headings:text-[2rem] prose-headings:mb-2 prose-p:text-base lg:prose-p:text-lg mb-6 md:mb-8 lg:mb-10" />
        )}

        {!loading && sortedEditorials.length > 0 && (
          <>
            {/* Mobile / Tablet: Swiper */}
            <div className="lg:hidden relative pb-16">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={"auto"}
                breakpoints={{
                  768: { slidesPerView: 2 },
                }}
                navigation={{
                  nextEl: ".swiper-button-next-bbt",
                  prevEl: ".swiper-button-prev-bbt",
                }}
                pagination={{
                  clickable: true,
                  el: ".swiper-pagination-bbt",
                  type: "bullets",
                  renderBullet: function (index, className) {
                    return (
                      '<span class="' + className + ' custom-bullet"></span>'
                    );
                  },
                }}
                className="w-full"
              >
                {sortedEditorials.map((editorial) => (
                  <SwiperSlide key={editorial.id}>
                    <Card editorial={editorial} />
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="absolute bottom-0 left-0 w-full flex justify-center items-center gap-x-[0.875rem]">
                <button className="swiper-button-prev-bbt w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
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
                <div className="swiper-pagination-bbt !static !w-auto flex gap-x-2"></div>
                <button className="swiper-button-next-bbt w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
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

            {/* Desktop: grid */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-[1.25rem]">
              {sortedEditorials.map((editorial) => (
                <Card key={editorial.id} editorial={editorial} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

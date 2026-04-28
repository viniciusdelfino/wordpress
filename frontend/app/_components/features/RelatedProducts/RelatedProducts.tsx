'use client';

import React, { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import ProductCard from "../../products/ProductCard";
import { wordpressAPI } from "@/app/lib/wordpress-api";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface RelatedProductsProps {
  products?: any[];
  use_industries_segment_term_products?: boolean;
  use_current_industries_segment_term?: boolean;
  industries_segment_term?: any;
  current_industries_segment_term?: any;
  desc?: string;
}

function getTermIds(value: any): number[] {
  if (!value) return [];

  const values = Array.isArray(value) ? value : [value];

  const ids = values
    .flatMap((item: any) => {
      if (!item) return [];

      if (typeof item === "number") {
        return [item];
      }

      if (typeof item === "string") {
        return item
          .split(",")
          .map((entry) => Number(entry.trim()))
          .filter((entry) => Number.isFinite(entry) && entry > 0);
      }

      if (typeof item === "object") {
        const rawId = item.id || item.term_id || item.value;
        const numericId = Number(rawId);
        return Number.isFinite(numericId) && numericId > 0 ? [numericId] : [];
      }

      return [];
    })
    .filter((entry) => Number.isFinite(entry) && entry > 0);

  return Array.from(new Set(ids));
}

export default function RelatedProducts({
  products = [],
  use_industries_segment_term_products = false,
  use_current_industries_segment_term = false,
  industries_segment_term,
  current_industries_segment_term,
  desc,
}: RelatedProductsProps) {
  const [resolvedProducts, setResolvedProducts] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const targetTermIds = useMemo(() => {
    if (use_current_industries_segment_term) {
      const currentTermIds = getTermIds(current_industries_segment_term);
      if (currentTermIds.length > 0) {
        return currentTermIds;
      }
    }

    return getTermIds(industries_segment_term);
  }, [use_current_industries_segment_term, current_industries_segment_term, industries_segment_term]);

  const shouldResolveByAcfTerm = use_industries_segment_term_products && targetTermIds.length > 0;

  useEffect(() => {
    let active = true;

    async function fetchProductsByIndustrialTerm() {
      if (!shouldResolveByAcfTerm) {
        setResolvedProducts(null);
        return;
      }

      setIsLoading(true);
      try {
        const termProducts = await wordpressAPI.getProductsByIndustriesSegmentTerm(targetTermIds);
        if (active) {
          setResolvedProducts(termProducts);
        }
      } catch {
        if (active) {
          setResolvedProducts([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchProductsByIndustrialTerm();

    return () => {
      active = false;
    };
  }, [shouldResolveByAcfTerm, targetTermIds]);

  const finalProducts = shouldResolveByAcfTerm
    ? (resolvedProducts || [])
    : products;

  if (isLoading) {
    return null;
  }

  if (!finalProducts || !finalProducts.length) {
    return null;
  }

  return (
    <section className="py-10 md:py-[3.75rem] lg:py-20 related-products">
      <div className="container">

        {desc && (
          <div dangerouslySetInnerHTML={{ __html: desc }} className="prose-headings:text-2xl md:prose-headings:text-[1.75rem] lg:prose-headings:text-[2rem] prose-headings:font-semibold text-dark-blue mb-6 md:mb-8 lg:mb-10" />
        )}

        <div className="relative pb-16">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1.2}
            navigation={{
              nextEl: ".swiper-button-next-related",
              prevEl: ".swiper-button-prev-related",
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination-related",
              type: "bullets",
              renderBullet: function (index, className) {
                return '<span class="' + className + ' custom-bullet"></span>';
              },
            }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="related-products-swiper"
          >
            {finalProducts.map((product, index) => (
              <SwiperSlide key={product.id || product.Id || index} className="!h-auto">
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute bottom-0 left-0 w-full flex justify-center items-center gap-x-4">
            <button className="swiper-button-prev-related w-10 h-10 flex items-center justify-center border border-[#5A5A5A] rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="swiper-pagination-related !static !w-auto flex gap-x-2"></div>
            <button className="swiper-button-next-related w-10 h-10 flex items-center justify-center border border-[#5A5A5A] rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
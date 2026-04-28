'use client';

import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import ProductCard from "../../_components/products/ProductCard";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface MentionedMobilProductsProps {
  /** Pre-enriched products — fetching is handled server-side in BlogAcfBlockRenderer. */
  products?: any[];
}

export default function MentionedMobilProducts({
  products = [],
}: MentionedMobilProductsProps) {
  const productsList = Array.isArray(products) ? products.filter(Boolean) : [];

  if (productsList.length === 0) {
    return null;
  }

  return (
    <section className="mentioned-mobil-products-block py-10 md:py-[3.75rem] lg:py-20">
      <div className="container">
        <h2 className="mb-8 text-2xl font-semibold text-dark-blue md:mb-10 md:text-[1.75rem] lg:mb-12 lg:text-[2rem]">
          Produtos Mobil mencionados neste conteúdo
        </h2>

        <div className="relative pb-16">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1.2}
            navigation={{
              nextEl: ".swiper-button-next-mentioned",
              prevEl: ".swiper-button-prev-mentioned",
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination-mentioned",
              type: "bullets",
              renderBullet: function (index, className) {
                return '<span class="' + className + ' custom-bullet"></span>';
              },
            }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="mentioned-mobil-products-swiper"
          >
            {productsList.map((product, index) => (
              <SwiperSlide key={product.ID || product.id || index} className="!h-auto">
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute bottom-0 left-0 w-full flex justify-center items-center gap-x-4">
            <button className="swiper-button-prev-mentioned w-10 h-10 flex items-center justify-center border border-[#5A5A5A] rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="swiper-pagination-mentioned !static !w-auto flex gap-x-2"></div>
            <button className="swiper-button-next-mentioned w-10 h-10 flex items-center justify-center border border-[#5A5A5A] rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
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

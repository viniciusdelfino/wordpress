'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import ProductCard from '../products/ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const WP_API_BASE = (process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '').replace(/\/$/, '');

interface ProductSegmentCarouselProps {
  desc?: string;
  segment?: { slug: string; taxonomy: string } | string;
  itens_number?: string | number;
  products?: any[];
}

export default function ProductSegmentCarousel({
  desc,
  segment,
  itens_number,
  products: initialProducts = [],
}: ProductSegmentCarouselProps) {
  const segSlug = typeof segment === 'object' ? segment?.slug : segment;
  const perPage = parseInt(String(itens_number ?? 8), 10) || 8;

  const [products, setProducts] = useState<any[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(initialProducts.length > 0);

  useEffect(() => {
    if (fetched || !segSlug) return;

    setLoading(true);
    fetch(`${WP_API_BASE}/moove/v1/products/by-segment/${encodeURIComponent(segSlug)}?per_page=${perPage}`)
      .then((res) => res.json())
      .then((json) => {
        const fetched = json?.data?.products;
        if (Array.isArray(fetched)) {
          setProducts(fetched);
        }
      })
      .catch(() => {
        // silencia erro — renderiza vazio
      })
      .finally(() => {
        setLoading(false);
        setFetched(true);
      });
  }, [segSlug, perPage, fetched]);

  if (loading) {
    return (
      <section className="py-10 md:py-[3.75rem] lg:py-20 product-segment-carousel">
        <div className="container">
          {desc && (
            <div
              dangerouslySetInnerHTML={{ __html: desc }}
              className="prose-headings:text-2xl md:prose-headings:text-[1.75rem] lg:prose-headings:text-[2rem] prose-headings:font-semibold text-dark-blue mb-6 md:mb-8 lg:mb-10"
            />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: Math.min(perPage, 3) }).map((_, i) => (
              <div key={i} className="h-64 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <section className="product-segment-carousel py-6 border-2 border-dashed border-yellow-400 bg-yellow-50">
          <div className="container text-sm text-yellow-700 space-y-1">
            <p className="font-bold">⚠ product_segment_carousel — sem produtos</p>
            <p>segment: <code>{segSlug || '(não definido)'}</code> | per_page: <code>{perPage}</code></p>
            <p>Endpoint: <code>/moove/v1/products/by-segment/{segSlug}?per_page={perPage}</code></p>
            <p>Causas: (1) Nenhum produto com taxonomy <code>segmento</code> = <code>{segSlug}</code>; (2) NEXT_PUBLIC_WORDPRESS_API_URL não configurado; (3) slug incorreto.</p>
            {desc && <div dangerouslySetInnerHTML={{ __html: desc }} className="mt-2 opacity-50" />}
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <section className="py-10 md:py-[3.75rem] lg:py-20 product-segment-carousel">
      <div className="container">

        {desc && (
          <div
            dangerouslySetInnerHTML={{ __html: desc }}
            className="prose-headings:text-2xl md:prose-headings:text-[1.75rem] lg:prose-headings:text-[2rem] prose-headings:font-semibold text-dark-blue mb-6 md:mb-8 lg:mb-10"
          />
        )}

        <div className="relative pb-16">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1.2}
            navigation={{
              nextEl: '.swiper-button-next-seg-carousel',
              prevEl: '.swiper-button-prev-seg-carousel',
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination-seg-carousel',
              type: 'bullets',
              renderBullet: (_index: number, className: string) =>
                `<span class="${className} custom-bullet"></span>`,
            }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="related-products-swiper"
          >
            {products.map((product, index) => (
              <SwiperSlide key={product.id || index} className="!h-auto">
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute bottom-0 left-0 w-full flex justify-center items-center gap-x-4">
            <button className="swiper-button-prev-seg-carousel w-10 h-10 flex items-center justify-center border border-[#5A5A5A] rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="swiper-pagination-seg-carousel !static !w-auto flex gap-x-2"></div>
            <button className="swiper-button-next-seg-carousel w-10 h-10 flex items-center justify-center border border-[#5A5A5A] rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
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

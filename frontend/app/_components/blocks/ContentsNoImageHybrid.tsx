"use client";

import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

export interface ContentsNoImageHybridPost {
  acf_fields?: any;
  acf?: any;
  id: number;
  title: string;
  excerpt: string;
  featured_image?: string;
  category?: string;
  reading_time?: string;
  link?: string;
  date?: string;
  content_type?: boolean | number | string;
  file?: any;
  file_url?: string;
}

export interface ContentsButtonLink {
  href: string;
  target: string;
  title: string;
}

interface ContentsNoImageHybridProps {
  posts: ContentsNoImageHybridPost[];
  buttonLink: ContentsButtonLink;
  btnBase: string;
  btnStyle: string;
  renderPostCard: (post: ContentsNoImageHybridPost) => React.ReactNode;
  slideClassName?: string;
}

export default function ContentsNoImageHybrid({
  posts,
  buttonLink,
  btnBase,
  btnStyle,
  renderPostCard,
  slideClassName,
}: ContentsNoImageHybridProps) {
  return (
    <div className="contents-no-image-hybrid">
      <div className="block">
        <Swiper
          modules={[Pagination, Navigation]}
          navigation={{
            nextEl: ".swiper-button-next-content",
            prevEl: ".swiper-button-prev-content",
          }}
          spaceBetween={16}
          slidesPerView={1.5}
          breakpoints={{
            768: {
              slidesPerView: 2.5,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
          }}
          pagination={{
            clickable: true,
            el: ".swiper-pagination-contents",
            type: "bullets",
            renderBullet: function (index, className) {
              return '<span class="' + className + ' custom-bullet"></span>';
            },
          }}
          className="w-full [&_.swiper-wrapper]:items-stretch"
        >
          {posts.map((post) => (
            <SwiperSlide key={post.id} className={`!h-auto flex ${slideClassName ?? ""}`}>
              {renderPostCard(post)}
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="mt-[0.875rem] md:mt-4 flex flex-col md:flex-row items-center justify-center md:justify-between lg:justify-center gap-[0.875rem] md:gap-4">
          <Link
            href={buttonLink.href}
            target={buttonLink.target}
            className={`order-2 md:order-1 ${btnBase} ${btnStyle} text-center min-w-[17.125rem] w-full md:w-fit`}
          >
            {buttonLink.title}
          </Link>
          <div className="flex items-center gap-x-4 order-1 md:order-2">
            <button className="swiper-button-prev-content w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
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
            <div className="swiper-pagination-contents !static !w-auto flex gap-x-2"></div>
            <button className="swiper-button-next-content w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
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
      </div>
    </div>
  );
}

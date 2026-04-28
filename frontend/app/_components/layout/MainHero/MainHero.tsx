'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface HeroImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

interface HeroButton {
  title: string;
  url: string;
  target: string;
}

interface Slide {
  image?: HeroImage;
  image_mobile?: HeroImage;
  tag?: string;
  title?: string;
  description?: string;
  butto_find_oil?: HeroButton;
  button_know_tech?: HeroButton;
}

interface MainHeroProps {
  image?: HeroImage;
  image_mobile?: HeroImage;
  tag?: string;
  title?: string;
  description?: string;
  butto_find_oil?: HeroButton;
  button_know_tech?: HeroButton;

  slides?: Slide[];
}

export default function MainHero(props: MainHeroProps) {
  const sourceSlides = props.slides && props.slides.length > 0 ? props.slides : (props.title ? [props] : []);

  const slides = sourceSlides.map(slide => {
    const cleanedHtml = (slide.title || "").replace(/<p>(\s|&nbsp;)*<\/p>/g, '');

    return {
      title: cleanedHtml,
      subtitle: slide.tag || "",
      description: slide.description || "",
      bg_image_desktop: slide.image?.url || "",
      bg_image_mobile: slide.image_mobile?.url || slide.image?.url || "",
      cta_primary: { text: slide.butto_find_oil?.title || "Saiba mais", url: slide.butto_find_oil?.url || "#" },
      cta_secondary: { text: slide.button_know_tech?.title || "Saiba mais", url: slide.button_know_tech?.url || "#" }
    };
  });

  if (slides.length === 0) return null;

  return (
    <section className="main-hero relative w-full bg-dark-blue text-white overflow-hidden group h-[509px] md:h-[549px]">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        pagination={{
          clickable: true,
          el: '.swiper-pagination-custom',
          type: 'bullets',
          renderBullet: function (_index: any, className: string) {
            return '<span class="' + className + ' custom-bullet-red"></span>';
          },
        }}
        autoplay={{ delay: 5000 }}
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className='h-full'>
            <div className="absolute inset-0 z-0">

              {/* Mobile Image */}
              <Image
                src={slide.bg_image_mobile || slide.bg_image_desktop || "/images/banner-home.jpg"}
                alt="Background Mobile"
                fill
                className="object-cover lg:hidden"
                priority={index === 0}
              />

              {/* Desktop Image */}
              <Image
                src={slide.bg_image_desktop || "/images/banner-home.jpg"}
                alt="Background Desktop"
                fill
                className="object-cover hidden lg:block"
                priority={index === 0}
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(270deg, rgba(15, 19, 28, 0) 0%, #0F131C 100%)' }}
              />
            </div>

            <div className="container relative z-10 h-full flex items-start md:items-center py-11 md:py-32">
              <div className="grid grid-cols-12 w-full">
                <div className="col-span-12 xxl:col-span-7 xxl:grid xxl:grid-cols-7 gap-4">

                  <div className="flex items-center gap-x-2 xxl:col-span-7">
                    <div className="w-8 border-t-2 border-red"></div>
                    <span className="text-base text-white font-normal">{slide.subtitle}</span>
                  </div>

                  <div
                    className="prose-headings:text-[2.5rem] md:prose-headings:text-5xl lg:prose-headings:text-6xl prose-strong:text-red leading-tight mb-[1.125rem] text-light-gray xxl:col-span-7 prose-headings:line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: slide.title }}
                  />

                  <p className="text-base md:text-lg lg:text-xl text-white mb-6 md:mb-[2.375rem] xxl:col-span-7">
                    {slide.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-6 lg:col-span-6 gap-4">
                    <Link
                      href={slide.cta_primary.url}
                      className="bg-white text-dark-blue hover:bg-gray-100 transition-colors rounded-[0.25rem] px-6 py-3 flex items-center justify-center gap-x-2 text-sm h-[2.75rem] md:text-base md:col-span-3"
                    >
                      {slide.cta_primary.text}
                      <Image src="/icons/arrow-right-b.svg" width={16} height={16} alt="Encontre o �leo ideal" />
                    </Link>

                    <Link
                      href={slide.cta_secondary.url}
                      className="bg-transparent border border-white text-white hover:bg-white/10 transition-colors rounded-sm px-6 py-3 flex items-center justify-center gap-x-2 text-sm md:text-base md:col-span-3 h-[2.75rem]"
                    >
                      <Image src="/icons/play.svg" width={16} height={16} alt="Conheça a tecnologia Mobil" />
                      {slide.cta_secondary.text}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Navigation and Pagination Controls */}
        <div className="absolute bottom-4 md:bottom-8 left-0 w-full z-20 flex justify-center items-center gap-x-[2.375rem] md:inset-0 md:block md:pointer-events-none">

          {/* Wrapper for Arrows to control width on desktop */}
          <div className="contents md:block md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-[1372px] md:h-0">
            {/* Prev Button */}
            <button className="swiper-button-prev-custom order-1 w-10 h-10 flex items-center justify-center border border-white backdrop-blur-[8px] rounded-md bg-[#0014504D]/20 text-white hover:bg-black/40 transition-colors md:absolute md:left-4 min-[1340px]:md:left-0 md:-top-5 md:pointer-events-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>

            {/* Next Button */}
            <button className="swiper-button-next-custom order-3 w-10 h-10 flex items-center justify-center border border-white backdrop-blur-[8px] rounded-md bg-[#0014504D]/20 text-white hover:bg-black/40 transition-colors md:absolute md:right-4 min-[1340px]:md:right-0 md:-top-5 md:pointer-events-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>

          {/* Pagination */}
          <div className="swiper-pagination-custom order-2 !static !w-auto flex gap-x-2 md:!absolute md:!bottom-3 md:!left-1/2 md:!-translate-x-1/2 md:!transform md:pointer-events-auto"></div>
        </div>
      </Swiper>
    </section>
  );
}

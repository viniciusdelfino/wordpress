"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Image from "next/image";
import type { MobilEvent } from "@/app/_components/features/MobilEvents/MobilEvents";
import { MobilEventsCard } from "@/app/_components/features/MobilEvents/MobilEvents";
import EventModal from "./EventModal";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type ImageShape = { url: string; alt: string; width: number; height: number };

interface EventsHeroProps {
  events: MobilEvent[];
  image?: ImageShape | number;
  image_mobile?: ImageShape | number;
  desc?: string;
}

function resolveStatic(img: ImageShape | number | undefined): { url: string; alt: string } | null {
  if (!img || typeof img === "number") return null;
  return { url: img.url, alt: img.alt };
}

export default function EventsHero({ events, image, image_mobile, desc }: EventsHeroProps) {
  if (!events || !events.length) return null;

  const [selectedEvent, setSelectedEvent] = useState<MobilEvent | null>(null);

  const [bgImage, setBgImage] = useState<{ url: string; alt: string } | null>(
    () => resolveStatic(image),
  );
  const [bgImageMobile, setBgImageMobile] = useState<{ url: string; alt: string } | null>(
    () => resolveStatic(image_mobile),
  );

  const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLElement | null>(null);
  const [paginationEl, setPaginationEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof image !== "number") return;
    const base = (process.env.NEXT_PUBLIC_WORDPRESS_API_URL ?? "").replace(/\/$/, "");
    fetch(`${base}/wp/v2/media/${image}`)
      .then((r) => r.json())
      .then((d) => setBgImage({ url: d.source_url, alt: d.alt_text ?? "" }))
      .catch(() => {});
  }, [image]);

  useEffect(() => {
    if (typeof image_mobile !== "number") return;
    const base = (process.env.NEXT_PUBLIC_WORDPRESS_API_URL ?? "").replace(/\/$/, "");
    fetch(`${base}/wp/v2/media/${image_mobile}`)
      .then((r) => r.json())
      .then((d) => setBgImageMobile({ url: d.source_url, alt: d.alt_text ?? "" }))
      .catch(() => {});
  }, [image_mobile]);

  return (
    <>
      {/* Banner: fixed 444px height */}
      <section className="events-hero relative w-full bg-dark-blue h-[444px] overflow-hidden">
        {(bgImageMobile?.url || bgImage?.url) && (
          <Image
            src={bgImageMobile?.url || bgImage?.url || ""}
            alt={bgImageMobile?.alt || bgImage?.alt || ""}
            fill
            className="object-cover object-[70%_center] lg:hidden"
          />
        )}
        {bgImage?.url && (
          <Image
            src={bgImage.url}
            alt={bgImage.alt || ""}
            fill
            className="object-cover hidden lg:block"
          />
        )}

        {desc && (
          <div className="absolute inset-0 flex items-center pointer-events-none z-10">
            <div className="container">
              <div
                className="relative prose-headings:text-[46px] prose-headings:font-bold prose-p:text-sm lg:prose-headings:w-[35.4375rem] leading-tight text-white lg:max-w-[40%] prose-p:text-[1.375rem]"
                dangerouslySetInnerHTML={{ __html: desc }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Cards overlapping banner via negative margin */}
      <div className="events-hero-content relative z-20 -mt-[100px]">
        <div className="container pb-10">
          <Swiper
            modules={[Navigation, Pagination]}
            slidesPerView={1}
            centeredSlides
            spaceBetween={20}
            navigation={{ prevEl, nextEl }}
            pagination={{
              el: paginationEl,
              clickable: true,
              renderBullet: (index, className) =>
                `<span class="${className} custom-bullet"></span>`,
            }}
            breakpoints={{
              768: {
                slidesPerView: 2,
                centeredSlides: false,
                allowTouchMove: true,
              },
              1024: {
                slidesPerView: 3,
                centeredSlides: false,
                spaceBetween: 20,
                allowTouchMove: false,
              },
            }}
            className="w-full"
          >
            {events.map((event) => (
              <SwiperSlide key={event.id}>
                <MobilEventsCard event={event} onCardClick={setSelectedEvent} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Nav hidden on desktop (lg+), visible on tablet and mobile */}
          <div className="flex justify-center items-center gap-x-4 mt-5 lg:hidden">
            <button
              ref={setPrevEl}
              className="w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue bg-white hover:bg-dark-blue hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Anterior"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div
              ref={setPaginationEl}
              className="swiper-pagination-cat !static !w-auto flex gap-x-2"
            />

            <button
              ref={setNextEl}
              className="w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue bg-white hover:bg-dark-blue hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Próximo"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </>
  );
}

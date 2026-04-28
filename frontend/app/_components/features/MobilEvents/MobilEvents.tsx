"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { wordpressAPI } from "@/app/lib/wordpress-api";
import "swiper/css";
import "swiper/css/navigation";
import Link from "next/link";

export interface MobilEvent {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  featured_image: string | null;
  data_evento: string | null;
  is_past_event: boolean;
  local_evento: string | null;
  tipo_link: "inscricoes" | "replay" | null;
  link_evento: string | null;
  acf_fields?: Record<string, unknown> | null;
  
}

interface MobilEventsProps {
  desc?: string;
  btn?: {
    title: string;
    url: string;
    target: string;
  };
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function findFirstString(
  value: unknown,
  preferredKeys: string[] = [],
): string | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;

  for (const key of preferredKeys) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim())
      return candidate.trim();
  }

  for (const candidate of Object.values(record)) {
    if (typeof candidate === "string" && candidate.trim())
      return candidate.trim();
    if (candidate && typeof candidate === "object") {
      const nested = findFirstString(candidate, preferredKeys);
      if (nested) return nested;
    }
  }

  return null;
}

function getEventDate(event: MobilEvent): string | null {
  return findFirstString(event.acf_fields, ["date"]);
}

function getEventAddress(event: MobilEvent): string | null {
  return findFirstString(event.acf_fields, ["address"]);
}

function getEventLinkType(event: MobilEvent): "inscricoes" | "replay" | null {
  const raw = findFirstString(event.acf_fields, ["button"]);
  if (!raw) return null;

  const normalized = raw.toLowerCase().trim();
  if (normalized === "replay") return "replay";
  if (normalized === "open")
    return "inscricoes";
  return null;
}

function getEventLink(event: MobilEvent): string | null {
  return findFirstString(event.acf_fields, ["external_link"]);
}

function normalizeMonthName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isPastEventByDateLabel(dateLabel: string | null): boolean {
  if (!dateLabel) return false;

  const normalizedLabel = dateLabel.toLowerCase();

  // Aceita datas no formato ISO como fallback direto.
  const isoDate = new Date(dateLabel + "T23:59:59");
  if (!Number.isNaN(isoDate.getTime())) {
    return isoDate.getTime() < Date.now();
  }

  const monthMap: Record<string, number> = {
    janeiro: 0,
    fevereiro: 1,
    marco: 2,
    abril: 3,
    maio: 4,
    junho: 5,
    julho: 6,
    agosto: 7,
    setembro: 8,
    outubro: 9,
    novembro: 10,
    dezembro: 11,
  };

  const yearMatch = normalizedLabel.match(/(\d{4})(?!.*\d{4})/);
  const year = yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();

  const dateParts = Array.from(
    normalizedLabel.matchAll(/(\d{1,2})\s+de\s+([a-zA-Zà-úÀ-ÚçÇ]+)/g),
  );

  if (!dateParts.length) return false;

  const lastPart = dateParts[dateParts.length - 1];
  const day = Number(lastPart[1]);
  const monthRaw = normalizeMonthName(lastPart[2]);
  const month = monthMap[monthRaw];

  if (Number.isNaN(day) || month === undefined) return false;

  const endDate = new Date(year, month, day, 23, 59, 59);
  return endDate.getTime() < Date.now();
}

export function isEventPast(event: MobilEvent): boolean {
  if (event.is_past_event) return true;
  const dateLabel = getEventDate(event);
  return isPastEventByDateLabel(dateLabel);
}

function MobilEventsLinkBadge({ event }: { event: MobilEvent }) {
  const eventLink = getEventLink(event);
  const eventLinkType = getEventLinkType(event);
  const isPast = isEventPast(event);

  if (isPast) {
    return (
      <span className="event-badge event-badge--past flex flex-row gap-x-[0.4375rem] text-sm font-semibold text-gray-medium-2">
        <Image src="/icons/past-event.svg" alt="" width={16} height={16} />
        Evento passado
      </span>
    );
  }

  if (!eventLink) return null;

  if (eventLinkType === "replay") {
    return (
      <Link
        href={eventLink}
        target="_blank"
        rel="noopener noreferrer"
        className="event-badge event-badge--replay flex flex-row gap-x-[0.4375rem] text-sm font-semibold text-gray-medium-2"
      >
        <Image src="/icons/replay.svg" alt="" width={16} height={16} />
        Assista o Replay
      </Link>
    );
  }

  return (
    <a
      href={eventLink}
      target="_blank"
      rel="noopener noreferrer"
      className="event-badge event-badge--inscricoes flex flex-row gap-x-[0.4375rem] text-sm font-semibold text-gray-medium-2"
    >
      <Image src="/icons/inscricoes.svg" alt="" width={16} height={16} />
      Inscrições abertas
    </a>
  );
}

interface MobilEventsCardProps {
  event: MobilEvent;
  onCardClick?: (event: MobilEvent) => void;
}

export function MobilEventsCard({ event, onCardClick }: MobilEventsCardProps) {
  const dateLabel = getEventDate(event);
  const addressLabel = getEventAddress(event);
  const isModalCard = Boolean(onCardClick);

  const handleCardClick = () => {
    if (onCardClick) onCardClick(event);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!onCardClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onCardClick(event);
    }
  };

  return (
    <article
      className={`event-card relative border border-[#D2D5DA] rounded-[4px] ${isModalCard ? "cursor-pointer" : ""}`}
      onClick={isModalCard ? handleCardClick : undefined}
      onKeyDown={isModalCard ? handleCardKeyDown : undefined}
      role={isModalCard ? "button" : undefined}
      tabIndex={isModalCard ? 0 : undefined}
      aria-label={isModalCard ? `Abrir detalhes do evento ${event.title}` : undefined}
    >
      {event.featured_image && (
        <div className="event-card__image relative lg:h-[17.625rem] h-[15.125rem] w-full overflow-hidden rounded-t-[4px]">
          <Image
            src={event.featured_image}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 80vw, 33vw"
          />
        </div>
      )}

      <div className="event-card__body px-8 pt-[0.875rem] pb-[1.1875rem] relative">
        <h3 className="event-card__title text-[18px] font-semibold text-dark-blue">
          {/* Modal mode: title is plain text because entire card is clickable */}
          {onCardClick ? (
            <span>{event.title}</span>
          ) : (
            <Link
              href={`/blog/eventos/${event.slug}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {event.title}
            </Link>
          )}
        </h3>

        {dateLabel && (
          <p className="event-card__date mt-2 text-[14px] text-dark-blue flex items-center gap-[7px]">
            <Image src="/icons/calendar.svg" alt="" width={16} height={16} />
            <span>{formatEventDate(dateLabel)}</span>
          </p>
        )}

        {addressLabel && (
          <p className="event-card__local mt-5 text-[14px] text-gray-medium-2">
            {addressLabel}
          </p>
        )}
        <div className="absolute z-40 -left-3 top-0 -translate-y-[50%] w-6 h-6 bg-white rounded-full ring-1 ring-[#DBDBDB]"></div>
        <div className="absolute z-40 -right-3 top-0 -translate-y-[50%] w-6 h-6 bg-white rounded-full ring-1 ring-[#DBDBDB]"></div>
      </div>
      <div className="border-t border-[#DBDBDB] px-8 py-[0.875rem]">
        <MobilEventsLinkBadge event={event} />
      </div>
    </article>
  );
}

export default function MobilEvents({ desc, btn }: MobilEventsProps) {
  const [events, setEvents] = useState<MobilEvent[]>([]);

  useEffect(() => {
    wordpressAPI.getEvents().then((data) => {
      if (Array.isArray(data)) {
        setEvents(data);
      }
    });
  }, []);

  return (
    <section className="mobil-events pb-10">
      <div className="container">
        {desc && (
          <div
            className="max-w-none mb-6 md:mb-8 lg:mb-10 prose prose-headings:font-semibold prose-headings:text-dark-blue prose-headings:text-[24px] md:prose-headings:text-[28px] lg:prose-headings:text-[32px] prose-headings:mb-2 prose-p:text-low-dark-blue prose-p:text-[16px] lg:prose-p:text-[18px]"
            dangerouslySetInnerHTML={{ __html: desc }}
          />
        )}

        <div className="events-grid hidden gap-x-5 lg:grid lg:grid-cols-3 sm:pb-15">
          {events.slice(0, 3).map((event) => (
            <div key={event.id} className="overflow-hidden">
              <MobilEventsCard event={event} />
            </div>
          ))}
        </div>

        <div className="md:hidden">
          <Swiper
            modules={[Pagination, Navigation]}
            navigation={{
              nextEl: ".swiper-button-next-event",
              prevEl: ".swiper-button-prev-event",
            }}
            slidesPerView={1.2}
            spaceBetween={16}
            breakpoints={{
              768: { slidesPerView: 1.5, spaceBetween: 24 },
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination-events",
              type: "bullets",
              renderBullet: function (index, className) {
                return '<span class="' + className + ' custom-bullet"></span>';
              },
            }}
            className="w-full"
          >
            {events.slice(0, 3).map((event) => (
              <SwiperSlide key={event.id} className="overflow-hidden">
                <MobilEventsCard event={event} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="flex w-full pt-20 justify-center items-center">
          <div className="flex min-w-[215px] gap-x-4 order-1 md:order-2 md:hidden">
            <button className="swiper-button-prev-event w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
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
            <div className="swiper-pagination-events !static !w-auto items-center justify-center flex gap-x-2"></div>
            <button className="swiper-button-next-event w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
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
        {btn ? <div className="hidden md:flex w-full justify-center items-center md:pt-8 lg:pt-10">
          <Link href={btn?.url} target={btn?.target} className="w-[300px] h-10 border border-dark-blue rounded-sm transition duration-300 hover:bg-dark-blue hover:text-white">
            <p className="font-semibold text-base">{btn?.title}</p>
          </Link>
        </div> : null}
      </div>
    </section>
  );
}

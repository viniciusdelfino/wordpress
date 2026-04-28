"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { MobilEvent } from "@/app/_components/features/MobilEvents/MobilEvents";

interface EventModalProps {
  event: MobilEvent;
  onClose: () => void;
}

export default function EventModal({ event, onClose }: EventModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const acf = event.acf_fields as Record<string, unknown> | null | undefined;
  const date = acf?.date as string | null | undefined;
  const address = acf?.address as string | null | undefined;
  const desc = acf?.desc as string | null | undefined;
  const excerptFromEvent = typeof event.excerpt === "string" ? event.excerpt.trim() : "";
  const excerptFromDesc = desc
    ? desc
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";
  const excerpt = excerptFromEvent || excerptFromDesc;
  const externalLink = acf?.external_link as string | null | undefined;
  const button = acf?.button as string | null | undefined;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 20, 80, 0.5)" }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      aria-modal="true"
      role="dialog"
      aria-label={event.title}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-[4px] shadow-2xl">
        {/* Hero: image with text overlay */}
        <div className="relative w-full h-[21.875rem] lg:h-[19.875rem] rounded-t-[4px] overflow-hidden bg-dark-blue">
          <Image src="/images/event-bg-gradient.png" alt="" fill className="w-full h-full object-cover z-1" />
          {event.featured_image && (
            <Image
              src={event.featured_image}
              alt={event.title}
              fill
              className="object-cover rounded-t-[4px]"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          )}
      
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center"
            aria-label="Fechar"
          >
            <Image src="/icons/close-white.png" alt="Fechar o modal" width={36} height={36} />
          </button>

          {/* Title, excerpt, date and location overlaid on image */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 md:px-10 md:pb-[1.625rem] lg:px-[3.75rem]">
            <h2 className="text-[24px] md:text-[28px] lg:text-[32px] font-semibold text-white leading-tight">
              {event.title}
            </h2>

            {excerpt && (
              <p className="mt-1 text-base text-white line-clamp-2">
                {excerpt}
              </p>
            )}

            {(date || address) && (
              <div className="flex flex-col md:flex-row md:items-center md:gap-4 mt-4 gap-3">
                {date && (
                  <p className="flex items-center gap-[10px] text-white">
                    <Image
                      src="/icons/calendar.svg"
                      alt=""
                      width={32}
                      height={32}
                      className="w-[25px] h-[25px] md:w-8 md:h-8 invert brightness-0 invert"
                    />
                    <span className="text-[14px] md:text-[16px]">{date}</span>
                  </p>
                )}

                {address && (
                  <p className="flex items-center gap-[10px] text-white">
                    <Image
                      src="/icons/location.svg"
                      alt=""
                      width={25}
                      height={25}
                      className="w-[25px] h-[25px] invert brightness-0 invert"
                    />
                    <span className="text-[14px] md:text-[16px]">{address}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Body: full description */}
        {desc && (
          <div className="px-4 pt-10 pb-8">
            <div
              className="prose max-w-none prose-headings:text-dark-blue prose-headings:text-[1.25rem] prose-headings:font-semibold md:prose-headings:text-[1.375rem] lg:prose-headings:text-[1.5rem] prose-p:text-low-dark-blue prose-p:text-sm prose-headings:border-b prose-headings:border-[#F3F4F6] prose-headings:pb-4 prose-headings:mb-6"
              dangerouslySetInnerHTML={{ __html: desc }}
            />
          </div>
        )}

        {/* Footer: CTA + link to full page */}
        {externalLink && (
          <div className="border-t border-[#DBDBDB] px-8 py-[0.875rem] flex items-center justify-between gap-4">
            <a
              href={externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-dark-blue text-white text-sm font-semibold rounded-[4px] hover:opacity-90 transition-opacity"
            >
              {button === "replay" ? "Assista ao Replay" : "Fazer Inscrição"}
            </a>

            <a
              href={`/blog/eventos/${event.slug}`}
              className="text-[13px] text-gray-medium-2 hover:underline whitespace-nowrap"
            >
              Ver página completa
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

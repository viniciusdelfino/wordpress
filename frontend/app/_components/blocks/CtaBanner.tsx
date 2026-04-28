import React from "react";
import Image from "next/image";
import Link from "next/link";

interface CtaBannerProps {
  title?: string;
  text?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
  button?: { title: string; url: string; target?: string } | null;
  background_image?: { url: string; alt?: string };
}

export default function CtaBanner({
  title,
  text,
  description,
  button_text,
  button_url,
  button,
  background_image,
}: CtaBannerProps) {
  if (!title) return null;

  const displayText = text || description || '';
  const btnText = button_text || button?.title || '';
  const btnUrl = button_url || button?.url || '';

  return (
    <section className="w-full py-6 md:py-8 lg:py-[40px]">
      <div className="container mx-auto px-4">
        <div className="relative rounded-[16px] overflow-hidden h-[240px] md:h-[269px] flex items-center bg-dark-blue">
          {/* Background image */}
          {background_image?.url && (
            <Image
              src={background_image.url}
              alt={background_image.alt || ""}
              fill
              className="object-cover rounded-[16px]"
            />
          )}

          {/* Gradient overlays */}
          {background_image?.url && (
            <div
              className="absolute inset-0 rounded-[16px]"
              style={{
                background:
                  "linear-gradient(90deg, rgb(0,0,0) 0%, rgba(0,0,0,0) 100%), linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.4) 100%)",
              }}
            />
          )}

          {/* Content */}
          <div className="relative z-10 h-full px-6 md:px-8 lg:px-[40px] flex flex-col items-start justify-center gap-6 lg:gap-[24px]">
            <div className="flex flex-col gap-2">
              {title && (
                <h2 className="text-xl md:text-2xl font-semibold text-white leading-normal">
                  {title}
                </h2>
              )}
              {displayText && (
                <p className="text-sm md:text-base text-white leading-[1.5]">
                  {displayText}
                </p>
              )}
            </div>
            {btnText && btnUrl && (
              <Link
                href={btnUrl}
                target={button?.target || '_self'}
                className="inline-flex items-center justify-center gap-2 border border-white text-white rounded-[4px] px-6 py-[10px] text-sm md:text-base font-medium hover:bg-white/10 transition-colors"
              >
                {btnText}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

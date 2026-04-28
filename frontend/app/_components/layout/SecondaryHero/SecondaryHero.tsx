"use client";

import React from "react";
import Image from "next/image";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface SecondaryHeroProps {
  image?: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  image_mobile?: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  /** Legacy single-field HTML (used by pages like blog with `sec_hero`). */
  desc?: string;
  /** New schema: separate title field (used by `hero_distribuidores`). */
  title?: string;
  /** New schema: subtitle/description below the title. */
  description?: string;
}

export default function SecondaryHero({
  image,
  image_mobile,
  desc,
  title,
  description,
}: SecondaryHeroProps) {
  const hasNewSchema = Boolean(title || description);
  const hasLegacy = !hasNewSchema && Boolean(desc);

  let textContent: React.ReactNode = null;
  if (hasNewSchema) {
    textContent = (
      <div className="col-span-12 text-white">
        {title && (
          <h1 className="text-2xl md:text-3xl lg:text-[2.5rem] font-semibold leading-tight max-w-[21.5625rem] lg:max-w-[900px] mb-3 lg:mb-[1.125rem]">
            {title}
          </h1>
        )}
        {description && (
          <p className="text-sm md:text-base lg:text-xl leading-relaxed max-w-[21.5625rem] lg:max-w-[980px]">
            {description}
          </p>
        )}
      </div>
    );
  } else if (hasLegacy) {
    textContent = (
      <div className="col-span-12 lg:col-span-5">
        <div
          className="prose-headings:text-2xl  lg:prose-headings:text-[2.5rem] prose-headings:font-semibold prose-p:text-sm lg:prose-p:text-xl prose-headings:max-w-[21.5625rem] lg:prose-headings:w-[567px] leading-tight mb-[1.125rem] text-white"
          dangerouslySetInnerHTML={{ __html: desc! }}
        />
      </div>
    );
  }

  return (
    <section className="secondary-hero relative w-full bg-dark-blue text-white overflow-hidden group h-[335px] md:h-[22.625rem] lg:h-[26.25rem]">
      <div className="absolute inset-0 z-0">
        {/* Mobile Image */}
        {(image_mobile?.url || image?.url) && (
          <Image
            src={image_mobile?.url || image?.url || ""}
            alt={image_mobile?.alt || image?.alt || "Background Mobile"}
            fill
            className="object-cover object-[70%_center] lg:hidden"
          />
        )}

        {/* Desktop Image */}
        {image?.url && (
          <Image
            src={image.url}
            alt={image.alt || "Background Desktop"}
            fill
            className="object-cover hidden lg:block"
          />
        )}
      </div>
      {textContent && (
        <div className="container relative z-10 h-full flex items-center py-40 px-10 md:py-32">
          <div className="grid grid-cols-12 w-full">{textContent}</div>
        </div>
      )}
    </section>
  );
}

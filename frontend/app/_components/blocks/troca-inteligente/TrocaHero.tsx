"use client";

import React from "react";
import Image from "next/image";
import type { TrocaHeroProps } from "./types";

export default function TrocaHero({
  title,
  subtitle,
  background_image,
  background_image_mobile,
  tabs,
}: TrocaHeroProps) {
  const tabItems = Array.isArray(tabs) ? tabs : [];

  return (
    <section className="troca-hero relative w-full text-white overflow-hidden h-[500px] md:h-[549px] lg:h-[610px]">
      {/* Background images */}
      <div className="absolute inset-0 z-0">
        {(background_image_mobile?.url || background_image?.url) && (
          <Image
            src={background_image_mobile?.url || background_image?.url || ""}
            alt={background_image_mobile?.alt || background_image?.alt || ""}
            fill
            className="object-cover lg:hidden"
            priority
          />
        )}
        {background_image?.url && (
          <Image
            src={background_image.url}
            alt={background_image.alt || ""}
            fill
            className="object-cover hidden lg:block"
            priority
          />
        )}

        {/* Top-to-bottom darken gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(1,1,1,0.05) 12.8%, rgba(1,1,1,0.5) 92.3%)",
          }}
        />

        {/* Bottom navy gradient zone */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[100px] md:h-[130px] lg:h-[159px]"
          style={{
            background: "linear-gradient(to top, #01144e, rgba(1,20,78,0))",
          }}
        />
      </div>

      {/* Content - vertically centered */}
      <div className="container relative z-10 h-full flex items-end pb-12 md:pb-16 lg:pb-20">
        <div className="flex flex-col gap-6 lg:gap-8 w-full max-w-[759px]">
          {/* Title + Subtitle block */}
          <div className="flex flex-col gap-3 lg:gap-[18px]">
            {title && (
              <h1
                className="text-[2rem] md:text-[2.5rem] lg:text-[3.5rem] lg:leading-[60px] leading-tight tracking-[-1.8px] lg:max-w-[645px] [&>strong]:font-bold [&>b]:font-bold font-normal [&>p]:m-0"
                dangerouslySetInnerHTML={{ __html: title }}
              />
            )}
            {subtitle && (
              <p className="text-base md:text-lg lg:text-xl text-white leading-normal max-w-[640px]">
                {subtitle}
              </p>
            )}
          </div>

          {/* Tabs - simple icon + label row */}
          {tabItems.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-10">
              {tabItems.map((tab, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3"
                >
                  {tab.icon?.url && (
                    <div className="w-[44px] h-[45px] shrink-0 overflow-hidden">
                      <Image
                        src={tab.icon.url}
                        alt={tab.icon.alt || ""}
                        width={44}
                        height={45}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <span className="text-base lg:text-lg font-semibold text-white whitespace-nowrap">
                    {tab.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import Image from "next/image";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface ThridHeroProps {
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
  desc?: string;
}

export default function ThridHero({
  image,
  image_mobile,
  desc,
}: ThridHeroProps) {
  return (
    <section className="thrid-hero relative w-full bg-dark-blue text-white overflow-hidden group h-[260px]">
      <div className="absolute inset-0 z-0">
        {/* Mobile Image */}
        <Image
          src={image_mobile?.url || image?.url || ""}
          alt="Background Mobile"
          fill
          className="object-cover object-[70%_center] lg:hidden"
        />
 
        {/* Desktop Image */}
        <Image
          src={image?.url || ""}
          alt="Background Desktop"
          fill
          className="object-cover hidden lg:block"
        /> 
      </div>
      {desc && (
        <div className="container relative z-10 h-full flex items-center md:py-32">
          <div className="grid grid-cols-12 w-full">
            <div className="col-span-12 lg:col-span-7">
              <div
                className="prose-headings:text-2xlm md:prose-headings:text-[1.75rem]  lg:prose-headings:text-[32px] prose-headings:mb-4 prose-headings:font-semibold prose-p:text-base lg:prose-p:text-lg prose-p:max-w-[236px] md:prose-p:max-w-[328px] lg:prose-p:max-w-full leading-tight text-white"
                dangerouslySetInnerHTML={{ __html: desc }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

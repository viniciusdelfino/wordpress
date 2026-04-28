"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface Error404BlockProps {
  title?: string;
  subtitle?: string;
  button?: {
    title: string;
    url: string;
    target: string;
  };
  image?: {
    url: string;
    alt: string;
  };
}

export default function Error404Block({
  title,
  subtitle,
  button,
  image,
}: Error404BlockProps) {
  // Defaults para fallback quando não há dados do WordPress
  const displayTitle = title || "Desculpe, algo inesperado aconteceu...";
  const displaySubtitle = subtitle || "Mas não se preocupe! Temos um catálogo incrível de itens que podem te agradar. <strong>Que tal explorar mais?</strong>";
  const displayButton = button || { title: "Ir à home", url: "/", target: "_self" };
  const displayImage = image || { url: "/icons/404.png", alt: "Ilustração 404 - Pneu com bomba de ar" };

  return (
    <section className="w-full bg-gray">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-8 md:gap-10 lg:gap-6 py-12 md:py-16 lg:py-[100px]">
          {/* Left content */}
          <div className="w-full lg:w-[520px] flex flex-col">
            {/* Text group */}
            <div className="flex flex-col gap-4 md:gap-6">
              <h1 className="text-dark-blue font-semibold text-xl md:text-2xl lg:text-[28px] leading-[1.4]">
                {displayTitle}
              </h1>
              <div
                className="text-low-dark-blue text-base md:text-lg leading-[1.5] [&>strong]:font-bold"
                dangerouslySetInnerHTML={{ __html: displaySubtitle }}
              />
            </div>
            {/* Button */}
            <div className="mt-8 md:mt-10 lg:mt-11">
              <Link
                href={displayButton.url}
                target={displayButton.target}
                className="inline-flex items-center justify-center bg-red text-white font-semibold text-base py-2.5 px-14 rounded hover:opacity-90 transition-colors"
              >
                {displayButton.title}
              </Link>
            </div>
          </div>

          {/* Right illustration */}
          <div className="w-full md:w-[500px] lg:w-[580px] flex-shrink-0">
            <div className="relative w-full aspect-[580/175]">
              <Image
                src={displayImage.url}
                alt={displayImage.alt || "Ilustração 404"}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

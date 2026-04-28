import React from "react";
import Image from "next/image";
import { DistribuidoresIntroProps } from "./types";

export default function DistribuidoresIntro({
  eyebrow,
  title,
  description,
  image,
}: DistribuidoresIntroProps) {
  return (
    <section className="w-full bg-white py-10 md:py-15 lg:py-5">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
          <div className="flex-1 lg:max-w-[684px] flex flex-col gap-5">
            {eyebrow && (
              <span className="text-sm font-semibold uppercase tracking-wide text-red">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="text-[28px] md:text-[32px] font-semibold text-dark-blue leading-[1.3] tracking-[0.37px]">
                {title}
              </h2>
            )}
            {description && (
              <div
                className="flex flex-col gap-5 text-[16px] text-[#6b7280] leading-[27.2px] tracking-[-0.31px] [&_p]:m-0"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
          </div>

          {image?.url && (
            <div className="relative w-full lg:flex-1 h-[280px] md:h-[340px] rounded-lg overflow-hidden">
              <Image
                src={image.url}
                alt={image.alt || ""}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

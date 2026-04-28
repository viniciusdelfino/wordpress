import React from "react";
import Image from "next/image";
import type { TrocaImpactNumbersProps } from "./types";

export default function TrocaImpactNumbers({
  badge,
  badge_icon,
  image,
  title,
  subtitle,
  metrics,
}: TrocaImpactNumbersProps) {
  const metricItems = Array.isArray(metrics) ? metrics : [];
  const sideImage = image?.url ? image : badge_icon?.url ? badge_icon : null;

  return (
    <section className="w-full py-6 md:py-8 lg:py-10">
      <div className="container mx-auto">
        <div
          className="rounded-2xl overflow-hidden flex flex-col lg:flex-row items-stretch"
          style={{
            backgroundImage:
              "linear-gradient(248deg, #001450 7%, rgb(0,4,16) 141%)",
          }}
        >
          {/* Image - left side */}
          {sideImage?.url && (
            <div className="relative w-full lg:w-[512px] h-[280px] md:h-[360px] lg:h-auto shrink-0">
              <Image
                src={sideImage.url}
                alt={sideImage.alt || ""}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 512px"
              />
            </div>
          )}

          {/* Content - right side */}
          <div className="flex-1 px-6 py-8 md:px-8 md:py-10 lg:py-10 lg:pr-10 lg:pl-12">
            {/* Badge with red line */}
            {badge && (
              <div className="flex items-center gap-4 mb-6">
                <div className="w-[30px] h-px bg-red" />
                <span className="text-[13px] text-white leading-normal">
                  {badge}
                </span>
              </div>
            )}

            {/* Title + Subtitle */}
            <div className="flex flex-col gap-2 mb-6 md:mb-8">
              {title && (
                <h2 className="text-xl md:text-2xl lg:text-[2rem] font-bold text-white leading-[1.4]">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm md:text-base italic text-white/70 leading-[1.6]">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Metrics - 2x2 grid */}
            {metricItems.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {metricItems.map((metric, index) => (
                  <div
                    key={index}
                    className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-[18px] py-3 md:h-[109px] flex flex-col gap-[9px]"
                  >
                    {metric.number && (
                      <p className="text-xl md:text-2xl font-semibold text-white leading-[1.4] tracking-[0.07px]">
                        {metric.number}
                      </p>
                    )}
                    {metric.label && (
                      <p className="text-sm md:text-base text-neutral leading-[21px] tracking-[-0.15px]">
                        {metric.label}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import Image from "next/image";

interface Badge {
  icon?: { url: string; alt?: string };
  text?: string;
}

interface PartnersHeroProps {
  title?: string;
  subtitle?: string;
  background_image?: { url: string; alt?: string };
  car_image?: { url: string; alt?: string };
  badges?: Badge[];
}

export default function PartnersHero({
  title,
  subtitle,
  background_image,
  car_image,
  badges,
}: PartnersHeroProps) {
  if (!title && !background_image) return null;

  const safeBadges = Array.isArray(badges) ? badges : [];

  return (
    <section className="relative w-full h-[697px] md:h-[500px] lg:h-[610px] bg-dark-blue text-white overflow-hidden">
      {/* Background image */}
      {background_image?.url && (
        <Image
          src={background_image.url}
          alt={background_image.alt || ""}
          fill
          className="object-cover"
          priority
        />
      )}

      {/* Car image overlay */}
      {car_image?.url && (
        <div className="absolute inset-0 z-[1]">
          <Image
            src={car_image.url}
            alt={car_image.alt || ""}
            fill
            className="object-cover object-[center_70%]"
            priority
          />
        </div>
      )}

      {/* Gradient overlays */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(270deg, rgba(15, 19, 28, 0) 0%, rgba(15, 19, 28, 0.5) 100%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-full h-[100px] md:h-[159px] z-[2]"
        style={{
          background:
            "linear-gradient(to top, #001450 0%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-[759px] flex flex-col gap-4 md:gap-6 lg:gap-10">
            {title && (
              <h1
                className="text-[28px] md:text-[44px] lg:text-[56px] font-normal leading-[36px] md:leading-[1.07] lg:leading-[60px] tracking-[-1.8px] [&>b]:font-bold [&>strong]:font-bold"
                style={{
                  background:
                    "linear-gradient(158deg, white 5.7%, rgba(255,255,255,0.85) 88.2%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                dangerouslySetInnerHTML={{ __html: title }}
              />
            )}

            {subtitle && (
              <p className="text-[16px] md:text-[18px] lg:text-[20px] text-white leading-normal max-w-[759px]">
                {subtitle}
              </p>
            )}

            {safeBadges.length > 0 && (
              <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-2 md:gap-6">
                {safeBadges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 md:gap-3">
                    {badge.icon?.url && (
                      <div className="relative w-9 h-[33px] md:w-12 md:h-11 shrink-0">
                        <Image
                          src={badge.icon.url}
                          alt={badge.icon.alt || ""}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    {badge.text && (
                      <span className="text-[16px] md:text-[16px] lg:text-[18px] font-semibold text-white leading-[26px]">
                        {badge.text}
                      </span>
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

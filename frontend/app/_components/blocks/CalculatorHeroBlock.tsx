import React from "react";
import Image from "next/image";
import Link from "next/link";

interface Stat {
  icon?: { url: string; alt: string };
  value: string;
  label: string;
  sublabel?: string;
}

interface CalculatorHeroBlockProps {
  subtitle?: string;
  title?: string;
  description?: string;
  button?: { title: string; url: string; target: string };
  image?: { url: string; alt: string };
  image_mobile?: { url: string; alt: string };
  stats?: Stat[];
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function StatIcon({
  icon,
  size = "md",
}: {
  icon?: { url: string; alt: string };
  size?: "sm" | "md";
}) {
  const dimensions = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const iconSize = size === "sm" ? 14 : 18;
  const borderRadius = size === "sm" ? "rounded-full" : "rounded-full";

  return (
    <div
      className={`shrink-0 ${dimensions} bg-[#001450] ${borderRadius} flex items-center justify-center`}
    >
      {icon?.url ? (
        <Image
          src={icon.url}
          alt={icon.alt || ""}
          width={iconSize}
          height={iconSize}
          className="brightness-0 invert"
        />
      ) : (
        <CheckIcon size={iconSize} />
      )}
    </div>
  );
}

export default function CalculatorHeroBlock({
  subtitle,
  title,
  description,
  button,
  image,
  image_mobile,
  stats,
}: CalculatorHeroBlockProps) {
  const hasStats = false; //stats && stats.length > 0;

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[380px] md:min-h-[420px] lg:min-h-0">
        {/* Background Image (fullwidth) */}
        {image && (
          <Image
            src={image.url}
            alt={image.alt || ""}
            fill
            sizes="100vw"
            quality={88}
            className="object-cover object-center hidden md:block"
            priority
          />
        )}
        {(image_mobile || image) && (
          <Image
            src={image_mobile?.url || image?.url || ""}
            alt={image_mobile?.alt || image?.alt || ""}
            fill
            sizes="100vw"
            quality={88}
            className="object-cover object-[center_30%] md:hidden"
            priority
          />
        )}

        {/* Single lighter gradient (avoids stacked overlays darker than Figma) */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(0,13,43,0.18) 0%, rgba(0,13,43,0.32) 45%, rgba(0,13,43,0.48) 100%)",
          }}
        />

        {/* Hero Content */}
        <div
          className={`relative z-10 py-16 md:py-24 lg:py-[100px] ${hasStats ? "lg:pb-[140px]" : "pb-14 md:pb-20 lg:pb-[80px]"}`}
        >
          <div className="container">
            <div className="max-w-[662px] antialiased [text-rendering:optimizeLegibility]">
              {subtitle && (
                <div className="flex items-center gap-[17px] mb-2">
                  <span className="block w-[30px] h-[2px] bg-red" />
                  <span className="text-white text-base font-normal">{subtitle}</span>
                </div>
              )}

              {title && (
                <h1
                  className="text-white text-[40px] leading-[48px] md:text-[48px] md:leading-[60px] lg:text-[60px] lg:leading-[60px] tracking-[-1.8px] lg:tracking-tight mb-4 md:mb-[18px] prose-strong:text-[#fe000c] prose-strong:font-semibold"
                  dangerouslySetInnerHTML={{ __html: title }}
                />
              )}

              {description && (
                <p className="text-white text-lg md:text-[22px] leading-normal mb-6 md:mb-8 lg:mb-[38px] max-w-[602px] font-normal">
                  {description}
                </p>
              )}

              {button && (
                <Link
                  href={button.url}
                  target={button.target || "_self"}
                  className="flex md:w-[272px] lg:inline-flex items-center justify-center gap-2 bg-white text-dark-blue font-normal text-sm md:text-base px-[18px] py-3 rounded-[4px] hover:bg-white/90 transition-colors"
                >
                  {button.title}
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Card - Outside overflow-hidden, floats over hero bottom */}
      {hasStats && (
        <div className="relative z-10 -mt-[69px]">
          <div className="container flex justify-center">
            <div className="bg-white border border-[#f3f4f6] rounded-2xl shadow-[0px_20px_60px_0px_rgba(0,20,61,0.08),0px_1px_3px_0px_rgba(0,20,61,0.04)] py-6 w-[358px] md:w-[648px] lg:w-full px-4 md:px-0 lg:px-0">
              {/* Mobile: 2x2 grid, vertical stacked stats (icon on top, centered) */}
              <div className="flex flex-col gap-4 md:hidden">
                {Array.from(
                  { length: Math.ceil(stats!.length / 2) },
                  (_, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="flex gap-[50px] justify-center"
                    >
                      {stats!
                        .slice(rowIndex * 2, rowIndex * 2 + 2)
                        .map((stat, i) => (
                          <div
                            key={i}
                            className="flex flex-col items-center gap-4"
                          >
                            <StatIcon icon={stat.icon} size="sm" />
                            <div className="flex flex-col gap-[5px] items-center text-center w-[137px]">
                              <p className="text-dark-blue text-2xl font-semibold leading-8 tracking-[-1.344px]">
                                {stat.value}
                              </p>
                              <p className="text-dark-blue text-[13px] font-semibold leading-[15.6px]">
                                {stat.label}
                              </p>
                              {stat.sublabel && (
                                <p className="text-low-dark-blue text-[13px] leading-[17.28px] tracking-[0.23px]">
                                  {stat.sublabel}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ),
                )}
              </div>

              {/* Tablet: 2 rows of 2, horizontal layout (icon left, text right) with dividers */}
              <div className="hidden md:flex md:flex-col md:gap-[48px] md:items-center md:py-0 lg:hidden">
                {Array.from(
                  { length: Math.ceil(stats!.length / 2) },
                  (_, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="flex items-start justify-between w-[554px]"
                    >
                      {stats!
                        .slice(rowIndex * 2, rowIndex * 2 + 2)
                        .map((stat, i) => (
                          <React.Fragment key={i}>
                            {i === 1 && (
                              <div className="h-[40px] flex items-center justify-center shrink-0 w-px">
                                <div className="bg-[#f3f4f6] h-full w-px" />
                              </div>
                            )}
                            <div className="flex items-start gap-4">
                              <StatIcon icon={stat.icon} />
                              <div className="flex flex-col gap-[5px]">
                                <p className="text-dark-blue text-[2rem] font-semibold leading-8 tracking-[-1.344px]">
                                  {stat.value}
                                </p>
                                <p className="text-dark-blue text-sm font-semibold leading-[15.6px]">
                                  {stat.label}
                                </p>
                                {stat.sublabel && (
                                  <p className="text-low-dark-blue text-sm leading-[17.28px] tracking-[0.23px]">
                                    {stat.sublabel}
                                  </p>
                                )}
                              </div>
                            </div>
                          </React.Fragment>
                        ))}
                    </div>
                  ),
                )}
              </div>

              {/* Desktop: horizontal flex with dividers (single row) */}
              <div className="hidden lg:flex lg:gap-[48px] lg:items-center lg:justify-center">
                {stats!.map((stat, index) => (
                  <React.Fragment key={index}>
                    <div className="flex items-start gap-4">
                      <StatIcon icon={stat.icon} />
                      <div className="flex flex-col gap-[5px]">
                        <p className="text-dark-blue text-[2rem] font-semibold leading-8 tracking-[-1.344px]">
                          {stat.value}
                        </p>
                        <p className="text-dark-blue text-sm font-semibold leading-[15.6px]">
                          {stat.label}
                        </p>
                        {stat.sublabel && (
                          <p className="text-low-dark-blue text-sm leading-[17.28px] tracking-[0.23px]">
                            {stat.sublabel}
                          </p>
                        )}
                      </div>
                    </div>
                    {index < stats!.length - 1 && (
                      <div className="h-[40px] flex items-center justify-center shrink-0 w-px">
                        <div className="bg-[#f3f4f6] h-full w-px" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

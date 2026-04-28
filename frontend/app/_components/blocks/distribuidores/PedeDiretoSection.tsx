import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AcfLink, PedeDiretoSectionProps } from "./types";

function normalizeCta(cta: AcfLink | string | undefined): AcfLink | null {
  if (!cta) return null;
  if (typeof cta === "string") return { url: cta };
  return cta.url ? cta : null;
}

function ArrowRightIcon() {
  return (
    <svg
      className="size-[18px] shrink-0"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 9H15M15 9L9.5 3.5M15 9L9.5 14.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PedeDiretoSection({
  eyebrow,
  title,
  description,
  cta,
  image,
}: PedeDiretoSectionProps) {
  const ctaLink = normalizeCta(cta);

  return (
    <section className="w-full bg-white py-10 md:py-15 lg:py-20">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
          <div className="flex-1 lg:max-w-[684px] flex flex-col gap-5 items-start">
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
            {ctaLink?.url && (
              <Link
                href={ctaLink.url}
                target={ctaLink.target || undefined}
                rel={
                  ctaLink.target === "_blank" ? "noopener noreferrer" : undefined
                }
                className="inline-flex items-center justify-center gap-2 bg-red text-white text-[16px] px-4 py-2 rounded-[4px] hover:bg-[#b00008] transition-colors h-[43px] w-full sm:w-[338px] mt-2"
              >
                <ArrowRightIcon />
                <span>{ctaLink.title || "Acessar o Pede Direto"}</span>
              </Link>
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

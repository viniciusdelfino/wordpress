"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

/**
 * Bloco ACF sugerido: layout `ideal_oil_cards`
 * - title (text)
 * - subtitle (textarea / text)
 * - cards (repeater)
 *   - image (image, return array)
 *   - link (link, return array) — URL da página do óleo; alternativa: product_link (text)
 *   - brand_icons (repeater) — uma linha por marca
 *     - icon (image, return array)
 */
export interface IdealOilCardData {
    image?: {
        url?: string;
        alt?: string;
        width?: number;
        height?: number;
    };
    link: {
        title: string;
        url: string;
        target: string;
    } | string
    brand_icons?: {
        icon?: {
            url?: string;
            alt?: string;
            width?: number;
            height?: number;
        }
    }[];
}

export interface IdealOilCardsProps {
    title?: string;
    subtitle?: string;
    cards?: IdealOilCardData[];
}

function OilCard({ card }: { card: IdealOilCardData }) {
    const link = typeof card.link === 'object' && card.link ? card.link : { title: "", url: "", target: "" };

    return (
        <Link
            href={link.url}
            target={link.target}
            rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
            className="group flex flex-col overflow-hidden rounded-xl border border-light-gray bg-white shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-blue focus-visible:ring-offset-2"
            aria-label={link.title}
        >
            <div className="relative aspect-4/5 w-full shrink-0 overflow-hidden bg-neutral">
                {card.image?.url ? (
                    <Image
                        src={card.image.url}
                        alt={card.image.alt || ""}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 56vw, (max-width: 1200px) 33vw, 360px"
                    />
                ) : null}
            </div>
            <div className="flex min-h-[72px] items-center justify-center gap-3 border-t border-light-gray bg-neutral-2 p-3">
                {card.brand_icons?.map(({ icon }, i) => icon?.url ? (
                    <div
                        key={`${icon.url}-${i}`}
                        className="relative flex h-8 max-h-8 items-center justify-center"
                    >
                        {icon.width && icon.height ? (
                            <Image
                                src={icon.url}
                                alt={icon.alt || ""}
                                width={icon.width}
                                height={icon.height}
                                className="max-h-8 w-auto object-contain object-center"
                            />
                        ) : (
                            <Image
                                src={icon.url}
                                alt={icon.alt || ""}
                                width={64}
                                height={64}
                                className="max-h-8 w-auto object-contain object-center"
                            />
                        )}
                    </div>
                ) : null)}
            </div>
        </Link>
    );
}

export default function IdealOilCards({
    title,
    subtitle,
    cards,
}: IdealOilCardsProps) {
    if (!cards?.length) return null;

    return (
        <section
            className="ideal-oil-cards container"
        >
            {title && (
                <h2 className="font-semibold text-[24px] md:text-[32px] lg:text-[40px] text-dark-blue">
                    {title}
                </h2>
            )}
            {subtitle && (
                <div className="max-w-[640px] font-normal text-low-dark-blue text-base lg:text-[18px]" dangerouslySetInnerHTML={{ __html: subtitle }}>
                </div>
            )}

            <div className="relative pt-6 pb-16 md:pt-7 lg:hidden">
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={16}
                    slidesPerView={1.5}

                    navigation={{
                        nextEl: ".swiper-button-next-ideal-oil",
                        prevEl: ".swiper-button-prev-ideal-oil",
                    }}
                    pagination={{
                        clickable: true,
                        el: ".swiper-pagination-ideal-oil",
                        type: "bullets",
                        renderBullet(index, className) {
                            return `<span class="${className} custom-bullet"></span>`;
                        },
                    }}
                    className="w-full"
                >
                    {cards.map((card, i) => (
                        <SwiperSlide key={`${card}-${i}`}>
                            <OilCard card={card} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                <div className="absolute bottom-0 left-0 flex w-full items-center justify-center gap-x-4">
                    <button
                        type="button"
                        className="swiper-button-prev-ideal-oil flex h-10 w-10 items-center justify-center rounded-md border border-dark-blue/30 text-dark-blue transition-colors hover:bg-dark-blue hover:text-white"
                        aria-label="Slide anterior"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden
                        >
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <div className="swiper-pagination-ideal-oil static! flex! w-auto! gap-x-2" />
                    <button
                        type="button"
                        className="swiper-button-next-ideal-oil flex h-10 w-10 items-center justify-center rounded-md border border-dark-blue/30 text-dark-blue transition-colors hover:bg-dark-blue hover:text-white"
                        aria-label="Próximo slide"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden
                        >
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="hidden grid-cols-3 gap-6 pt-8 lg:grid">
                {cards.map((card, i) => (
                    <OilCard key={`${card}-${i}`} card={card} />
                ))}
            </div>
        </section>
    );
}

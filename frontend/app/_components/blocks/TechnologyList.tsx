"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface TechnologyListItem {
    title: string;
    text?: string;
    image: {
        url: string;
        alt: string;
        width: number;
        height: number;
    }
    icon?: {
        url: string;
        alt: string;
        width: number;
        height: number;
    }
}

interface TechnologyListProps {
    title: string;
    subtitle?: string;
    list: TechnologyListItem[]
    dark_theme: boolean;
}

export default function TechnologyList({ dark_theme, title, subtitle, list }: TechnologyListProps) {

    const isSliderOnDesktop = list.length > 4;

    const Card = ({ item, index }: { item: TechnologyListItem; index: number }) => {
        const cardImage = item?.image || (item as any)?.imagem_de_fundo;
        return (
        <div className="w-full h-[420px] cursor-pointer group">
            <div className="w-full h-full relative">
                <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden">
                    {cardImage && (
                        <Image
                            src={cardImage.url}
                            alt={cardImage.alt}
                            fill
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    )}
                    <div
                        className="absolute inset-0 pointer-events-none rounded-xl"
                        aria-hidden
                        style={{
                            background: `${dark_theme ? 'linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.9) 100%)' : 'linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), linear-gradient(180deg, rgba(0, 20, 80, 0) 0%, rgba(0, 20, 80, 0.9) 100%)'}`,
                        }}
                    />

                    <span className="absolute top-8 left-6 z-10 text-[14px] leading-[24px] text-white">
                        {String(index).padStart(2, "0")}
                    </span>

                    <div className="absolute bottom-8 left-6 right-6 z-10 flex flex-col gap-2">
                        {item.icon && (
                            <Image
                                src={item.icon.url}
                                alt={item.icon.alt}
                                width={item.icon.width}
                                height={item.icon.height}
                            />
                        )}
                        {item.title && (
                            <h3 className="font-semibold text-[20px] md:text-[22px] lg:text-[24px] text-white">
                                {item.title}
                            </h3>
                        )}
                        {item.text && (
                            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr] motion-reduce:transition-none">
                                <div className="min-h-0 overflow-hidden">
                                    <p className="text-base text-white translate-y-4 opacity-0 transition-[transform,opacity] duration-300 ease-out motion-reduce:duration-0 group-hover:translate-y-0 group-hover:opacity-100">
                                        {item.text}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
    }

    return (
        <div className="technology-list container py-10 md:py-15 lg:py-20">
            <h3 className="font-semibold text-[28px] md:text-[32px] lg:text-[40px] leading-[40px] text-dark-blue mb-2">{title}</h3>
            {
                subtitle && (
                    <h4 className="max-w-[541px] font-normal text-base lg:text-[18px] text-low-dark-blue">{subtitle}</h4>
                )}

            <div className="lg:hidden relative pt-6 md:pt-7 pb-16">
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={8}
                    slidesPerView={1.5}
                    breakpoints={{
                        640: { slidesPerView: 2.5 },
                    }}
                    navigation={{
                        nextEl: ".swiper-button-next-technology-list",
                        prevEl: ".swiper-button-prev-technology-list",
                    }}
                    pagination={{
                        clickable: true,
                        el: ".swiper-pagination-technology-list",
                        type: "bullets",
                        renderBullet(index, className) {
                            return `<span class="${className} custom-bullet"></span>`;
                        },
                    }}
                    className="w-full"
                >
                    {list.map((item, i) => (
                        <SwiperSlide key={item.title}>
                            <Card item={item} index={i + 1} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                <div className="absolute bottom-0 left-0 w-full flex justify-center items-center gap-x-4">
                    <button
                        type="button"
                        className="swiper-button-prev-technology-list flex h-10 w-10 items-center justify-center rounded-md border border-dark-blue/30 text-dark-blue transition-colors hover:bg-dark-blue hover:text-white"
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
                    <div className="swiper-pagination-technology-list static! flex! w-auto! gap-x-2" />
                    <button
                        type="button"
                        className="swiper-button-next-technology-list flex h-10 w-10 items-center justify-center rounded-md border border-dark-blue/30 text-dark-blue transition-colors hover:bg-dark-blue hover:text-white"
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

            <div className="hidden lg:block pt-8">
                {isSliderOnDesktop ? (
                    <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={24}
                        slidesPerView={4}
                        className="w-full"
                    >
                        {list.map((item, i) => (
                            <SwiperSlide key={item.title}>
                                <Card item={item} index={i + 1} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-center">
                        {list.map((item, i) => (
                            <div key={item.title}>
                                {" "}
                                <Card item={item} index={i + 1} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
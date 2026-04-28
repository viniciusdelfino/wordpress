"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface AcfImage {
    url?: string;
    alt?: string;
}

interface YoutubeVideoItem {
    video_id?: string;
}

interface MobilYoutubeProps {
    bg_image?: AcfImage;
    desc?: string;
    video_youtube?: YoutubeVideoItem[];
}

export default function MobilYoutube({
    bg_image,
    desc,
    video_youtube,
}: MobilYoutubeProps) {
    const videos = (video_youtube || []).filter((item) => item?.video_id);

    if (!desc && videos.length === 0) {
        return null;
    }

    return (
        <section className="mobil-youtube relative overflow-hidden py-[4.0625rem] md:pt-15 md:pb-[3.75rem] lg:pb-[4.375rem] h-[32.125rem]">
            {bg_image?.url && (
                <div className="absolute inset-0">
                    <Image
                        src={bg_image.url}
                        alt={bg_image.alt || "Mobil no Youtube"}
                        fill
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-dark-blue/65" />
                </div>
            )}

            <div className="container relative z-10">
                {desc && (
                    <div
                        className="prose prose-invert max-w-none mb-[1.375rem] md:mb-[1.875rem] lg:mb-6 prose-headings:mb-0 prose-headings:font-semibold prose-headings:text-white prose-headings:text-[1.75rem] md:prose-headings:text-[2rem] lg:prose-headings:text-[2rem]"
                        dangerouslySetInnerHTML={{ __html: desc }}
                    />
                )}

                {videos.length > 0 && (
                    <div className="mx-auto max-w-[1245px] relative pb-16 md:pb-[4.5rem]">
                        <Swiper
                            modules={[Navigation, Pagination]}
                            spaceBetween={32}
                            slidesPerView={1}
                            navigation={{
                                nextEl: ".swiper-button-next-mobil-yt",
                                prevEl: ".swiper-button-prev-mobil-yt",
                            }}
                            pagination={{
                                clickable: true,
                                el: ".swiper-pagination-mobil-yt",
                                type: "bullets",
                                renderBullet: function (index, className) {
                                    return `<span class="${className} custom-bullet-white"></span>`;
                                },
                            }}
                            breakpoints={{
                                1024: {
                                    slidesPerView: 3,
                                },
                                768: {
                                    slidesPerView: 1.8,
                                },
                            }}
                            className="w-full"
                        >
                            {videos.map((video, index) => (
                                <SwiperSlide key={`${video.video_id}-${index}`} className="!h-auto">
                                    <div className="mx-auto w-full max-w-[399px] overflow-hidden rounded-lg bg-black shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
                                        <iframe
                                            className="block w-full h-[225px] md:h-[251px] lg:h-[347px]"
                                            src={`https://www.youtube-nocookie.com/embed/${video.video_id}?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`}
                                            title={`YouTube video ${index + 1}`}
                                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            loading="lazy"
                                            allowFullScreen
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        <div className="absolute bottom-0 left-0 w-full flex justify-center items-center gap-x-[0.875rem]">
                            <button className="swiper-button-prev-mobil-yt w-10 h-10 flex items-center justify-center border border-white/35 rounded-md text-white hover:bg-white hover:text-dark-blue transition-colors cursor-pointer">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                            <div className="swiper-pagination-mobil-yt !static !w-auto flex gap-x-2"></div>
                            <button className="swiper-button-next-mobil-yt w-10 h-10 flex items-center justify-center border border-white/35 rounded-md text-white hover:bg-white hover:text-dark-blue transition-colors cursor-pointer">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
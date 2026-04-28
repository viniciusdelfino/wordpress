"use client";

import { useState } from "react";
import Image from "next/image";

interface PerformanceBlockImage {
    url: string;
    alt: string;
    width: number;
    height: number;
}

interface TabLayoutItem {
    option: string;
    title: string;
    text: string;
    image?: PerformanceBlockImage;
}

interface ExtremePerformanceProps {
    title?: string;
    text?: string;
    tablayout?: TabLayoutItem[];
    conventional_percent?: number;
    mobil_percent?: number;
    conventional_label?: string;
    mobil_label?: string;
    full_width?: boolean;
}

function PerformanceComparisonBars({
    conventionalPercent = 72,
    mobilPercent = 100,
    conventionalLabel = "CONVENCIONAL",
    mobilLabel = "MOBIL 100%",
}: {
    conventionalPercent?: number;
    mobilPercent?: number;
    conventionalLabel?: string;
    mobilLabel?: string;
}) {
    const conv = Math.min(100, Math.max(0, Number(conventionalPercent) || 0));
    const mobil = Math.min(100, Math.max(0, Number(mobilPercent) || 0));

    return (
        <div className="mt-8 w-full">
            <div className="mb-3 flex justify-between gap-4">
                <span className="font-semibold uppercase text-[13px] text-[#9CA3AF]">
                    {conventionalLabel}
                </span>
                <span className="text-xs font-bold uppercase tracking-wide text-red">
                    {mobilLabel}
                </span>
            </div>
            <div className="flex flex-col gap-2.5">
                <div
                    className="h-2 w-full overflow-hidden rounded-full bg-[#F3F4F6]"
                    aria-hidden
                >
                    <div
                        className="h-full rounded-full bg-[#D2D5DA] transition-[width] duration-500 ease-out"
                        style={{ width: `${conv}%` }}
                    />
                </div>
                <div
                    className="h-2 w-full overflow-hidden rounded-full bg-light-gray"
                    aria-hidden
                >
                    <div
                        className="h-full rounded-full bg-red transition-[width] duration-500 ease-out"
                        style={{ width: `${mobil}%` }}
                    />
                </div>
            </div>
        </div>
    );
}


export default function ExtremePerformance({
    title,
    text,
    tablayout,
    conventional_percent,
    mobil_percent,
    conventional_label,
    mobil_label,
    full_width,
}: ExtremePerformanceProps) {
    const items = Array.isArray(tablayout) ? tablayout.filter((t) => t?.option) : [];
    const [activeIndex, setActiveIndex] = useState(0);
    const safeIndex = items.length ? Math.min(activeIndex, items.length - 1) : 0;
    const active = items[safeIndex];

    const displayImage: PerformanceBlockImage | undefined =
        active?.image?.url ? active.image : undefined;

    return (
        <section className={`${full_width ? 'bg-white w-full' : 'bg-[#F9FAFB]'}`}>
            <div className={`${!full_width ? 'container py-10' : ''} flex flex-col lg:flex-row lg:items-stretch`}>
                <div className="w-full lg:w-1/2 max-h-[500px] lg:max-w-[800px] lg:max-h-full overflow-hidden shrink-0">
                    <div className="relative w-full bg-neutral aspect-4/3 h-full">
                        {displayImage?.url ? (
                            <Image
                                key={displayImage.url}
                                src={displayImage.url}
                                alt={displayImage.alt || ""}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 560px"
                            />
                        ) : null}
                    </div>
                </div>
                <div className="flex-1 min-w-0 bg-neutral-2 pt-6 pb-6">
                    <div className="container lg:px-8!">
                        {title && (
                            <h3 className="text-[28px] font-semibold text-dark-blue leading-[140%]">
                                {title}
                            </h3>
                        )}
                        {text && (
                            <div
                                className="font-normal text-[14px] text-low-dark-blue leading-[160%] mt-2 mb-6"
                                dangerouslySetInnerHTML={{ __html: text }}
                            />
                        )}

                        {items.length > 0 && (
                            <>
                                <div
                                    className="flex flex-wrap gap-x-6 gap-y-2"
                                    role="tablist"
                                    aria-label="Opções de desempenho"
                                >
                                    {items.map((item, i) => {
                                        const isActive = safeIndex === i;
                                        return (
                                            <button
                                                key={`${item.option}-${i}`}
                                                type="button"
                                                role="tab"
                                                aria-selected={isActive}
                                                id={`extreme-tab-${i}`}
                                                aria-controls={`extreme-panel-${i}`}
                                                className={`font-semibold text-base leading-[150%] border-b-2 pb-2 cursor-pointer ${isActive
                                                    ? "border-red text-low-dark-blue"
                                                    : "border-transparent text-[#6D7280] hover:text-low-dark-blue"
                                                    }`}
                                                onClick={() => setActiveIndex(i)}
                                            >
                                                {item.option}
                                            </button>
                                        );
                                    })}
                                </div>

                                {active && (
                                    <div
                                        id={`extreme-panel-${safeIndex}`}
                                        role="tabpanel"
                                        aria-labelledby={`extreme-tab-${safeIndex}`}
                                        className="pt-6"
                                    >
                                        {active.title && (
                                            <h4 className="text-base font-semibold text-dark-blue leading-[120%] mt-5 mb-3">
                                                {active.title}
                                            </h4>
                                        )}
                                        {active.text && (
                                            <div
                                                className="font-normal text-[13px] text-low-dark-blue leading-[145%]"
                                                dangerouslySetInnerHTML={{ __html: active.text }}
                                            />
                                        )}
                                    </div>
                                )}

                                <PerformanceComparisonBars
                                    conventionalPercent={conventional_percent ?? 72}
                                    mobilPercent={mobil_percent ?? 100}
                                    conventionalLabel={
                                        conventional_label ?? "CONVENCIONAL"
                                    }
                                    mobilLabel={mobil_label ?? "MOBIL 100%"}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

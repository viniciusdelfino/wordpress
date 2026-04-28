"use client";

import { useState } from "react";
import Image from "next/image";

export interface TabLayoutTab {
    title: string;
    text?: string;
    description?: string;
    icon?: {
        url: string;
        alt: string;
        width: number;
        height: number;
    };
    image?: {
        url: string;
        alt: string;
        width: number;
        height: number;
    };
}

export interface TabLayoutProps {
    title?: string;
    subtitle?: string;
    dark_theme: boolean;
    tabs?: TabLayoutTab[];
}

function tabBody(item: TabLayoutTab) {
    return item.description ?? item.text ?? "";
}

function TabLayoutTabCard({
    item,
    index,
    isActive,
    body,
    onSelect,
    activePanelImage,
    dark_theme,
}: {
    item: TabLayoutTab;
    index: number;
    isActive: boolean;
    body: string;
    onSelect: () => void;
    activePanelImage: TabLayoutTab["image"] | undefined;
    dark_theme: boolean;
}) {
    const showMobilePanel = isActive && activePanelImage?.url;

    return (
        <div className="w-full">
            <button
                type="button"
                role="tab"
                id={`tablayout-tab-${index}`}
                aria-selected={isActive}
                aria-controls={`tablayout-panel-${index}`}
                tabIndex={isActive ? 0 : -1}
                onClick={onSelect}
                className="flex w-full cursor-pointer gap-6 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
            >
                <span
                    className={`w-0.5 shrink-0 self-stretch ${isActive ? "bg-red" : "hidden lg:block lg:bg-transparent"}`}
                    aria-hidden
                />

                <span className="min-w-0 flex-1">
                    <span className="flex gap-3">
                        {item.icon?.url && (
                            <span
                                className={`hidden lg:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral ${isActive ? "opacity-100" : "opacity-55"}`}
                            >
                                <Image
                                    src={item.icon.url}
                                    alt={item.icon.alt || ""}
                                    width={Math.min(
                                        item.icon.width || 24,
                                        24,
                                    )}
                                    height={Math.min(
                                        item.icon.height || 24,
                                        24,
                                    )}
                                    className={`object-contain ${isActive ? "brightness-90 saturate-100" : "opacity-80 grayscale-[0.15]"}`}
                                />
                            </span>
                        )}
                        <span className="min-w-0 pt-0.5">
                            <span
                                className={`block text-[20px] font-semibold leading-[40px] md:text-[22px] lg:text-[24px] ${
                                    dark_theme
                                        ? isActive
                                            ? "text-white"
                                            : "text-white/50"
                                        : isActive
                                          ? "text-dark-blue"
                                          : "text-[#6b7a8f]"
                                }`}
                            >
                                {item.title}
                            </span>
                            {body && (
                                <div
                                    className={`mt-1.5 text-sm font-normal md:text-base ${isActive ? (dark_theme ? "text-neutral-2" : "text-low-dark-blue") : "text-medium-gray/75"}`}
                                    dangerouslySetInnerHTML={{
                                        __html: body,
                                    }}
                                />
                            )}
                        </span>
                    </span>
                </span>
            </button>

            {showMobilePanel && (
                <div
                    id={`tablayout-panel-${index}`}
                    role="tabpanel"
                    aria-labelledby={`tablayout-tab-${index}`}
                    className="mt-5 overflow-hidden rounded-2xl bg-blue lg:hidden"
                >
                    <div className="relative aspect-4/3 w-full">
                        <Image
                            src={activePanelImage.url}
                            alt={
                                activePanelImage.alt || item.title
                            }
                            fill
                            className="object-cover"
                            sizes="100vw"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TabLayout({
    title,
    subtitle,
    tabs,
    dark_theme,
}: TabLayoutProps) {
    const list = Array.isArray(tabs) ? tabs.filter((t) => t?.title) : [];
    const [activeIndex, setActiveIndex] = useState(0);
    const safeIndex =
        list.length > 0 ? Math.min(activeIndex, list.length - 1) : 0;
    const active = list[safeIndex];

    if (list.length === 0) {
        return null;
    }

    const panelImage = active?.image;

    return (
        <section className={`w-full ${dark_theme ? "bg-[#010101]" : "bg-white"} py-10 md:py-15 lg:py-20`}>
            <div className="container">
                <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-12 xl:gap-16">
                    <div className="min-w-0 flex-1 lg:max-w-[min(100%,520px)] xl:max-w-[560px]">
                        {title && (
                            <h2
                                className={`text-2xl md:text-[32px] lg:text-[40px] font-bold leading-[130%] ${dark_theme ? "text-white" : "text-dark-blue"}`}
                                dangerouslySetInnerHTML={{ __html: title }}
                            />
                        )}
                        {subtitle && (
                            <div
                                className={`mt-3 text-sm md:text-[18px] font-normal leading-[160%] ${dark_theme ? "text-neutral-2" : "text-medium-gray"}`}
                                dangerouslySetInnerHTML={{ __html: subtitle }}
                            />
                        )}

                        <div
                            className="mt-8 flex flex-col gap-4 md:gap-8"
                            role="tablist"
                        >
                            {list.map((item, i) => (
                                <TabLayoutTabCard
                                    key={`${item.title}-${i}`}
                                    item={item}
                                    index={i}
                                    isActive={safeIndex === i}
                                    body={tabBody(item)}
                                    onSelect={() => setActiveIndex(i)}
                                    activePanelImage={panelImage}
                                    dark_theme={dark_theme}
                                />
                            ))}
                        </div>
                    </div>

                    {panelImage?.url && (
                        <div
                            className="relative hidden min-h-[280px] flex-1 overflow-hidden rounded-2xl bg-blue lg:block lg:min-h-[360px]"
                            role="tabpanel"
                            id={`tablayout-panel-desktop-${safeIndex}`}
                            aria-labelledby={`tablayout-tab-${safeIndex}`}
                        >
                            <Image
                                src={panelImage.url}
                                alt={panelImage.alt || active?.title || ""}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 0px, 50vw"
                                priority={safeIndex === 0}
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

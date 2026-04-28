import Image from "next/image";
import { Fragment } from "react";

const IMAGE_OVERLAY = `linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), linear-gradient(180deg, rgba(0, 20, 80, 0) 0%, rgba(0, 20, 80, 0.9) 100%)`;
const SECTION_BG = "linear-gradient(269.55deg, #001450 0%, #000410 100%)";

interface AuthoritySealCard {
    icon?: {
        url: string;
        alt: string;
        width: number;
        height: number;
    };
    title: string;
    subtitle?: string;
    description?: string;
}

interface AuthoritySealProps {
    image: {
        url: string;
        alt: string;
        width: number;
        height: number;
    };
    person_name: string;
    person_role?: string;
    theme_label?: string;
    dark_theme?: boolean;
    title: string;
    content?: string;
    card_style?: 'only_text' | 'with_data'
    cards?: AuthoritySealCard[];
}

function WithDataCard({
    item,
    index,
}: {
    item: AuthoritySealCard;
    index: number;
}) {
    return (
        <div className="relative box-border flex w-full flex-col rounded-[14px] border border-white/8 bg-white/6 p-[21px]">
            <div className="flex flex-col gap-[9px]">
                {item.icon?.url && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(182,231,255,0.1)]">
                        <Image
                            src={item.icon.url}
                            alt={item.icon.alt || ""}
                            width={Math.min(item.icon.width, 16)}
                            height={Math.min(item.icon.height, 16)}
                            className="h-4 w-4 object-contain"
                        />
                    </div>
                )}
                {item.title && (
                    <h3 className="text-2xl font-bold leading-[140%] text-white">
                        {item.title}
                    </h3>
                )}
                {item.description && (
                    <p className="text-sm font-normal leading-[17px] text-neutral">
                        {item.description}
                    </p>
                )}
            </div>
        </div>
    );
}

function OnlyTextCard({
    item,
}: {
    item: AuthoritySealCard;
}) {
    return (
        <div>
            <div className="flex flex-col gap-[9px]">
                {item.subtitle && (
                    <p className="text-sm font-semibold leading-[140%] uppercase text-red">
                        {item.subtitle}
                    </p>
                )}
                {item.title && (
                    <h3 className="text-[21px] md:text-[28px] font-bold leading-[140%] text-white">
                        {item.title}
                    </h3>
                )}
                {item.description && (
                    <p className="text-[12px] md:text-sm font-normal leading-[17px] text-neutral">
                        {item.description}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function AuthoritySeal({
    image,
    person_name,
    person_role,
    theme_label,
    dark_theme = false,
    card_style = 'with_data',
    title,
    content,
    cards,
    ...rest
}: AuthoritySealProps & Record<string, any>) {
    // Fallback: ACF may send "quote" instead of "content"
    const resolvedContent = content || rest.quote;
    const resolvedCardStyle = card_style || rest.card_style;
    const list = Array.isArray(cards) ? cards.filter((c) => c?.title) : [];

    return (
        <section
            className="authority-seal py-10 md:py-15 lg:py-20"
        >
            <div className="container " >
                <div className="rounded-[8px] overflow-hidden" style={{ background: dark_theme ? "#010101" : SECTION_BG }}>
                    <div className="flex flex-col lg:flex-row">
                        <div className="relative w-full lg:max-w-[512px] shrink-0 aspect-4/3">
                            <Image
                                src={image.url}
                                alt={image.alt}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority={false}
                            />
                            <div
                                className="absolute inset-0 pointer-events-none"
                                aria-hidden
                                style={{ background: IMAGE_OVERLAY }}
                            />
                            <div className="absolute inset-x-0 bottom-0 z-10 to-transparent px-6 pb-8 pt-24 lg:px-9 lg:pb-19">
                                {person_name && (
                                    <p className="text-2xl lg:text-[32px] leading-[140%] font-semibold text-white">
                                        {person_name}
                                    </p>
                                )}
                                {person_role && (
                                    <p className="mt-2 text-base font-semibold text-[#D2D5DA]">
                                        {person_role}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex w-full flex-col justify-between px-4 py-8 md:px-10 md:py-15 lg:p-21">
                            <div>
                                {theme_label && (
                                    <div className="mb-5 flex items-center gap-[17px]">
                                        <span className="h-0.5 w-[30px] shrink-0 bg-red" aria-hidden />
                                        <p className="text-[13px] font-normal text-white">
                                            {theme_label}
                                        </p>
                                    </div>
                                )}
                                {title && (
                                    <h2
                                        className="text-2xl lg:text-[32px] leading-[140%] text-white mt-6 mb-2"
                                        dangerouslySetInnerHTML={{ __html: title }}
                                    />
                                )}
                                {resolvedContent && (
                                    <div
                                        className="authority-seal-content text-base leading-relaxed text-[#F3F4F6] md:text-lg"
                                        dangerouslySetInnerHTML={{ __html: resolvedContent }}
                                    />
                                )}
                            </div>

                            {list.length > 0 && (
                                resolvedCardStyle === 'with_data' ? (<div className="grid grid-cols-1 gap-3 md:grid-cols-3 pt-6">
                                    {list.map((item, i) => (
                                        <WithDataCard
                                            key={`${item.title}-${i}`}
                                            item={item}
                                            index={i + 1}
                                        />


                                    ))}
                                </div>) : (<div className="flex flex-row  pt-6">
                                    {list.map((item, i) => (
                                        <Fragment key={`${item.title}-${i}`}>
                                            <OnlyTextCard
                                                item={item}
                                            />
                                            {i < list.length - 1 && (
                                            <div className=" w-px h-auto mx-4 lg:mx-8 bg-[#6D7280]" aria-hidden />
                                            )}
                                        </Fragment>
                                    ))}
                                </div>)


                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface SchoolOfMechanicsProps {
    image?: {
        url?: string;
        alt?: string;
        width?: number;
        height?: number;
    };
    subititle?: string;
    subtitle?: string;
    desc?: string;
    link?: {
        title?: string;
        url?: string;
        target?: string;
    };
    obs?: string;
}

export default function SchoolOfMechanics({
    image,
    subititle,
    subtitle,
    desc,
    link,
    obs,
}: SchoolOfMechanicsProps) {
    const subtitleText = subititle || subtitle;

    return (
        <section className="py-8 lg:py-10">
            <div className="container">
                <div className="rounded-[20px] bg-[rgba(12,71,157,0.1)] h-[589px] md:h-[695px] lg:h-[464px] overflow-hidden flex flex-col lg:flex-row">
                    <div className="w-full lg:w-1/2 px-6 md:px-10 lg:px-12 pt-8 md:pt-10 lg:py-12 flex flex-col justify-center">
                        {subtitleText && (
                            <p className="uppercase text-dark-blue text-[13px] md:text-[16px] leading-[1.3] font-semibold tracking-[0.02em]">
                                {subtitleText}
                            </p>
                        )}

                        {desc && (
                            <div
                                className="mt-3 prose max-w-none prose-headings:text-black prose-headings:text-[32px] md:prose-headings:text-[40px] prose-headings:leading-[1.1] prose-headings:m-0 prose-p:text-[#455154] prose-p:text-[15px] md:prose-p:text-[18px] prose-p:leading-[1.45] prose-p:font-normal prose-p:m-0 prose-p:mt-[13px]"
                                dangerouslySetInnerHTML={{ __html: desc }}
                            />
                        )}

                        {link?.title && link?.url && (
                            <Link
                                href={link.url}
                                target={link.target || "_self"}
                                className="mt-6 lg:mt-10 inline-flex items-center justify-center bg-red text-white text-sm md:text-base font-semibold rounded-sm w-full h-[2.3125rem] md:h-10 md:w-fit md:min-w-[17.3125rem] px-5 w-fit"
                            >
                                {link.title}
                            </Link>
                        )}

                        {obs && (
                            <p className="mt-3 text-[10px] leading-[1.4] text-low-dark-blue">{obs}</p>
                        )}
                    </div>

                    <div className="relative w-full lg:w-1/2 h-[19.4375rem] md:h-[24.875rem] lg:h-[27.8125rem] mt-auto">
                        {image?.url && (
                            <Image
                                src={image.url}
                                alt={image.alt || "Escola do Mecânico"}
                                fill
                                className="object-contain object-right-bottom"
                                sizes="(max-width: 1023px) 100vw, 50vw"
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
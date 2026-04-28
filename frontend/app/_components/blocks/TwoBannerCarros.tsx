import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface TwoBannerProps {
    list: {
        image: {
            url: string;
            alt: string;
        };
        content: string;
        button: {
            title: string;
            url: string;
            target?: string;
        };
    }[];
}

export default function TwoBannerCarros({ list }: TwoBannerProps) {
    if (!list || list.length < 2) return null;

    const [firstBanner, secondBanner] = list;

    return (
        <section className="w-full mt-10 md:mt-15 lg:mt-12 two-banner overflow-x-hidden">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-12 gap-6 md:gap-10">
                    
                    {/* Primeiro Banner */}
                    <div className="col-span-12 lg:col-span-6 relative w-full h-[269px] lg:h-[16.8125rem] rounded-2xl overflow-hidden group">
                        <Image
                            src={firstBanner.image.url}
                            alt={firstBanner.image.alt || 'Banner'}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                        />

                        <div className="absolute inset-0 bg-black/20 px-4 py-5 md:p-8 lg:p-6 flex flex-col justify-end md:justify-center items-start">
                            <div
                                className="text-white mb-6 prose max-w-full break-words prose-headings:text-white prose-headings:font-semibold prose-headings:mb-2 prose-headings:text-xl md:prose-headings:text-[1.375rem] lg:prose-headings:text-2xl prose-p:text-base prose-p:font-normal prose-p:leading-snug md:max-w-[28.125rem]"
                                dangerouslySetInnerHTML={{ __html: firstBanner.content }}
                            />

                            {firstBanner.button && (
                                <Link
                                    href={firstBanner.button.url}
                                    target={firstBanner.button.target}
                                    className="inline-flex items-center justify-center gap-2 bg-white text-dark-blue px-4 py-2 rounded-sm text-sm md:text-base font-medium min-h-[2.8125rem] w-full md:w-fit md:min-w-[20.5rem]"
                                >
                                    {firstBanner.button.title}
                                    <Image src="/icons/arrow-link-blue.svg" alt="" width={12} height={12} />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Segundo Banner */}
                    <div className="col-span-12 lg:col-span-6 relative w-full min-h-[14.0625rem] lg:h-full rounded-2xl overflow-hidden group">
                        <Image
                            src={secondBanner.image.url}
                            alt={secondBanner.image.alt || 'Banner'}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover object-right"
                        />

                        <div className="absolute inset-0 px-4 py-5 md:p-8 lg:p-6 flex flex-col justify-start items-start gap-6">
                            <div>
                                <Image
                                    src="/images/pededireto.png"
                                    alt="banner"
                                    width={101}
                                    height={39}
                                />
                            </div>

                            <div className="w-full">
                                <div
                                    className="text-white mb-6 prose max-w-full break-words prose-headings:text-white prose-headings:font-semibold prose-headings:mb-2 prose-headings:text-xl md:prose-headings:text-[1.375rem] lg:prose-headings:text-2xl prose-p:text-base prose-p:font-normal prose-p:leading-snug"
                                    dangerouslySetInnerHTML={{ __html: secondBanner.content }}
                                />

                                {secondBanner.button && (
                                    <Link
                                        href={secondBanner.button.url}
                                        target={secondBanner.button.target}
                                        className="inline-flex items-center justify-center gap-2 bg-white text-dark-blue px-4 py-2 rounded-sm text-sm md:text-base font-medium min-h-[2.8125rem] w-full md:w-fit md:min-w-[20.5rem]"
                                    >
                                        <Image src="/icons/tool_blue_svg.svg" alt="" width={13.26} height={13.26} />
                                        {secondBanner.button.title}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
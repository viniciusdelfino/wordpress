import Image from "next/image";

interface LPHeroProps {
    bg_image_desktop?: {
        url: string;
        alt: string;
        width: number;
        height: number;
    };
    bg_image_tablet?: {
        url: string;
        alt: string;
        width: number;
        height: number;
    };
    bg_image_mobile?: {
        url: string;
        alt: string;
        width: number;
        height: number;
    };
    
    title: string;
    subtitle?: string;
    brand_logo?: {
        url: string;
        alt: string;
        width: number;
        height: number;
    };
    benefits?: {
        icon: {
            url: string;
            alt: string;
            width: number;
            height: number;
        };
        text: string;
    }[];
}

export default function LPHero({ bg_image_desktop, bg_image_tablet, bg_image_mobile, title, subtitle, brand_logo, benefits }: LPHeroProps) {
    return (
        <section className='lp-hero'>
            <div>
                <div className="relative w-full overflow-hidden h-[697px] md:h-[846px] lg:h-[610px] flex lg:items-center">
                    {bg_image_desktop && (
                        <Image
                            src={bg_image_desktop.url}
                            alt={bg_image_desktop.alt || 'Banner Background'}
                            fill
                            className="object-cover z-0 hidden lg:block"
                        />
                    )}
                    {bg_image_tablet && (
                        <Image
                            src={bg_image_tablet.url}
                            alt={bg_image_tablet.alt || 'Banner Background'}
                            fill
                            className="object-cover z-0 hidden md:block lg:hidden"
                        />
                    )}
                    {bg_image_mobile && (
                        <Image
                            src={bg_image_mobile.url}
                            alt={bg_image_mobile.alt || 'Banner Background'}
                            fill
                            className="object-cover z-0 block md:hidden"
                        />
                    )}

                    <div className="container relative z-10 flex lg:items-center pt-[65px] md:pt-[130px] lg:p-0">
                        <div className="lg:max-w-[759px]">
                            {
                                brand_logo && (
                                    <Image className="w-[225px] md:w-auto" src={brand_logo.url} alt={brand_logo.alt || 'Brand Logo'} width={brand_logo.width} height={brand_logo.height} />
                                )
                            }
                            <h1 className="py-[18px] font-normal text-[28px] md:text-5xl lg:text-[60px] leading-9 md:leading-[60px] tracking-[-1.8px] text-white" dangerouslySetInnerHTML={{ __html: title }} />

                            <h2 className="pb-10 font-normal text-lg leading-6 text-white" dangerouslySetInnerHTML={{ __html: subtitle }} />

                            {
                                benefits && (
                                    <ul className="md:flex flex-row gap-x-6">
                                        {benefits.map((benefit) => (
                                            <li className="flex flex-row items-center pb-2 md:pb-0" key={benefit.text}>
                                                <Image className="w-[33px] md:w-auto" src={benefit.icon.url} width={benefit.icon.width} height={benefit.icon.height} alt={benefit.icon.alt} />
                                                <p className="font-semibold text-base lg:text-[18px] leading-[26px] text-white">{benefit.text}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
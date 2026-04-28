import Image from "next/image";

interface FeatureHighlightProps {
    dark_theme: boolean;
    theme_label?: string;
    title: string;
    subtitle?: string;
    content?: string;
    image?: {
        url: string;
        alt: string;
        width: number;
        height: number;
    };
    image_mobile?: {
        url: string;
        alt: string;
        width: number;
        height: number;
    }
}

export default function FeatureHighlight({ dark_theme, theme_label, title, subtitle, content, image, image_mobile }: FeatureHighlightProps) {
    return (
        <section className={`feature-highlight py-10 md:py-15 lg:pt-0 ${ dark_theme ? 'bg-[#010101]' : 'bg-[linear-gradient(197.43deg,#001450_11.22%,#070B12_96.22%)]'}`}>
            <div className="max-w-[358px] md:max-w-[648px] lg:max-w-none mx-auto lg:ml-[8%] lg:pb-20 flex flex-col lg:flex-row lg:items-center">
                <div className="lg:max-w-[603px] flex flex-col justify-center">
                    {
                        theme_label && (
                            <div className="flex items-center gap-[17px] mb-4">
                                <span className="w-[30px] h-[2px] bg-red"></span>
                                <p className="font-normal text-sm leading-4 text-white" dangerouslySetInnerHTML={{ __html: theme_label }} />
                            </div>
                        )
                    }
                    <h3 className="custom-highlight-title font-semibold text-[28px] md:text-[32px] lg:text-[40px] leading-[140%] text-white" dangerouslySetInnerHTML={{ __html: title }} />
                    <p className="font-semibold text-base lg:text-lg leading-[140%] text-white opacity-70 py-6 md:py-8" dangerouslySetInnerHTML={{ __html: subtitle }} />
                    <div className="text-base leading-[160%] text-[#D2D5DA] opacity-90" dangerouslySetInnerHTML={{ __html: content }} />
                </div>
                <div className="flex-1">
                    {
                        image && (
                            <Image className="w-full h-full object-cover hidden lg:block" src={image.url} alt={image.alt || 'Feature Image'} width={image.width} height={image.height} />
                        )
                    }
                    {
                        image_mobile && (
                            <Image className="max-w-[500px] mt-6 mx-auto w-full h-full object-cover block lg:hidden" src={image_mobile.url} alt={image_mobile.alt || 'Feature Image'} width={image_mobile.width} height={image_mobile.height} />
                        )
                    }
                </div>
            </div>
        </section>
    )
}
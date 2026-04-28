"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface InnovationItem {
  icon: {
    url: string;
    alt: string;
  };
  title_desc: string;
}

interface InnovationProps {
  block_ui: boolean;
  imagem_1: { url: string; alt: string };
  imagem_2: { url: string; alt: string } | false;
  title_desc: string;
  item_desc: InnovationItem[];
  link: {
    title: string;
    url: string;
    target: string;
  };
}

export default function Innovation({
  block_ui,
  imagem_1,
  imagem_2,
  title_desc,
  item_desc,
  link,
}: InnovationProps) {
  return (
    <section className="w-full py-10 md:py-16 lg:py-20 bg-white innovation-block">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-10 items-center">
          <div className="col-span-1 lg:col-span-5 w-full relative">
            {block_ui ? (
              <SimpleImageSection image={imagem_1} />
            ) : (
              <ComplexImageSection image1={imagem_1} image2={imagem_2} />
            )}
          </div>

          <div className="col-span-1 lg:col-span-7 flex flex-col">
            {title_desc && (
              <div
                className="prose-headings:text-dark-blue prose-headings:font-semibold prose-headings:text-[24px] prose-headings:md:text-[28px] prose-headings:lg:text-[32px] prose-headings:lg:w-[662px] prose-headings:mb-4 prose-headings:leading-tight prose-p:text-low-dark-blue prose-p:text-sm prose-p:md:text-base prose-p:lg:text-lg prose-p:mb-6 md:prose-p:mb-8 lg:prose-p:mb-10 prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: title_desc }}
              />
            )}

            <div className="flex flex-col gap-y-6 mb-6 lg:mb-8">
              {item_desc?.map((item, index) => (
                <div key={index} className={`flex flex-row gap-4 md:items-start ${index === 0 ? 'border-b border-[#E4E4E4] pb-4 md:pr-4' : ''}`}>
                  <div className="shrink-0 w-[3rem] h-[3rem] lg:w-[3.875rem] lg:h-[3.875rem] bg-[rgba(208,0,10,0.1)] rounded-lg flex items-center justify-center">
                    {item.icon && (
                      <Image
                        src={item.icon.url}
                        alt={item.icon.alt || ""}
                        width={32}
                        height={32}
                      />
                    )}
                  </div>
                  <div
                    className="prose-headings:text-dark-blue prose-headings:text-base prose-headings:md:text-[20px] prose-headings:mb-1 prose-p:text-low-dark-blue prose-p:text-sm prose-p:md:text-base prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item.title_desc }}
                  />
                </div>
              ))}
            </div>

            {link && (
              <Link
                href={link.url}
                target={link.target}
                className="min-w-[20.125rem] inline-flex items-center justify-center bg-red text-white text-sm md:text-base font-medium px-6 py-3 rounded-sm hover:bg-[#b00008] transition-colors w-full md:w-fit"
              >
                {link.title}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const SimpleImageSection = ({
  image,
}: {
  image: { url: string; alt: string };
}) => (
  <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-[32.4375rem] rounded-lg overflow-hidden">
    {image && (
      <Image
        src={image.url}
        alt={image.alt || "Inovação"}
        fill
        className="object-cover"
      />
    )}
  </div>
);

const ComplexImageSection = ({
  image1,
  image2,
}: {
  image1: { url: string; alt: string };
  image2: { url: string; alt: string } | false;
}) => {
  return (
    <div className="w-full relative grid grid-cols-5 gap-4 max-h-[32.5rem]">
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="innovation-clip" clipPathUnits="objectBoundingBox">
            <path
              transform="scale(0.003610108, 0.001926782)"
              d="M0 8C0 3.58172 3.58172 0 8 0H268.633C273.051 0 276.633 3.58172 276.633 8V270H219.016C214.592 270 211.007 273.592 211.016 278.016L211.486 510.199C211.494 514.243 214.135 517.811 218 519H140.422C139.042 519 137.685 518.643 136.483 517.963L4.06118 443.056C1.55156 441.636 0 438.976 0 436.093V8Z"
            />
          </clipPath>
        </defs>
      </svg>

      <div className="absolute bottom-0 left-0 z-0">
        <Image src="/images/dots.svg" alt="" width={155} height={75} />
      </div>

      {image1 && (
        <div className="absolute bottom-0 right-0 !z-20 w-[11.875rem] h-[10.9375rem] md:w-[24.0625rem] md:h-[15.625rem] lg:w-[12.5rem] lg:h-[11.25rem] xxl:h-[19.6875rem] xxl:w-[17.5rem] xxl:h-[15.625rem] rounded-lg overflow-hidden shadow-lg bg-white max-h-[15.625rem]">
          <Image
            src={image1.url}
            alt={image1.alt || "Inovação Mobil"}
            fill
            className="object-cover pt-2 pl-2"
          />
        </div>
      )}

      {image2 && (
        <div className="col-span-3 relative z-10 aspect-[277/519] pl-5">
          <div className="w-full h-full relative rounded-lg">
            <Image
              src={image2.url}
              alt={image2.alt || "Produção"}
              fill
              className="object-cover pl-3 rounded-lg max-h-[32.5rem] bg-gray"
              style={{ clipPath: "url(#innovation-clip)" }}
            />
          </div>
        </div>
      )}

      <div className="col-span-2 relative z-10">
        <div className="bg-dark-blue text-white p-2 rounded-lg text-center flex flex-col items-center justify-center min-h-[11rem] md:min-h-[250px] lg:min-h-[200px] xxl:min-h-[15.625rem] w-full">
          <span className="text-3xl md:text-6xl lg:text-5xl 2xl:text-7xl font-semibold leading-none mb-2">
            150 +
          </span>
          <p className="text-xs md:text-xl lg:text-sm min-[1200px]:text-base min-[1440px]:text-xl min-[1600px]:text-2xl leading-tight max-w-[11.25rem] min-[1440px]:max-w-[18rem] min-[1600px]:max-w-[22rem] font-normal">
            Anos de experiência no desenvolvimento de lubrificantes de alta
            tecnologia
          </p>
        </div>
      </div>
    </div>
  );
};

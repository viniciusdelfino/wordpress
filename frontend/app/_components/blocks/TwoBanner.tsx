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
    button_icon?: {
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    icon_position?: 'left' | 'right';
  }[];
}

export default function TwoBanner({ list }: TwoBannerProps) {
  if (!list || list.length === 0) return null;

  return (
    <section className="w-full mt-10 md:mt-15 lg:mt-12 two-banner">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-12 gap-6">
          {list?.length > 0 && list.map((item, index) => (
            <div
              key={index}
              className="col-span-12 lg:col-span-6 relative w-full h-[14.0625rem] lg:h-[16.8125rem] rounded-lg md:rounded-2xl overflow-hidden group"
            >
              {/* Imagem de Fundo */}
              <p>{index}</p>
              <Image
                src={item.image.url}
                alt={item.image.alt || 'Banner'}
                fill
                className="object-cover"
              />

              {/* Overlay e Conteúdo */}
              <div className="absolute inset-0 bg-black/20 px-4 py-5 md:p-8 lg:p-6 flex flex-col justify-center items-start">
                <div
                  className="text-white mb-6 prose max-w-none prose-headings:text-white prose-headings:font-semibold prose-headings:mb-2 prose-headings:text-xl md:prose-headings:text-[1.375rem] lg:prose-headings:text-2xl prose-p:text-base prose-p:font-normal prose-p:leading-snug md:max-w-[28.125rem]"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />

                {item.button && (
                  <Link
                    href={item.button.url}
                    target={item.button.target}
                    className={`inline-flex items-center justify-center gap-2 bg-white text-dark-blue px-4 py-2 rounded-lg text-sm md:text-base font-medium min-h-[2.8125rem] w-full md:w-fit md:min-w-[20.5rem] lg:min-w-[22.625rem] ${item.icon_position === 'left' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {item.button.title}
                    <Image
                      src={item.button_icon?.url || '/icons/arrow-link-blue.svg'}
                      alt={item.button_icon?.alt || ''}
                      width={item.button_icon?.width || 20}
                      height={item.button_icon?.height || 20}
                    />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

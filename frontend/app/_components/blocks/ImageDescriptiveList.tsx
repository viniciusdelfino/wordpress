'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ListItem {
  text: string;
  icon_list?: boolean;
  icon?: {
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
}

interface ContentItem {
  image_position: boolean;
  image: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  image_2?: {
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  title_desc: string;
  list: ListItem[];
  button: {
    title: string;
    url: string;
    target: string;
  };
}

interface ImageDescriptiveListProps {
  main_title_desc: string;
  list: ContentItem[];
}

export default function ImageDescriptiveList({ main_title_desc, list }: ImageDescriptiveListProps) {
  return (
    <section className="py-10 md:py-[60px] lg:py-20 bg-white image-descriptive-list">
      <div className="container">

        {main_title_desc && (
          <div 
            className="mb-10 prose-headings:text-2xl prose-headings:md:text-[28px] prose-headings:lg:text-[32px] prose-headings:font-semibold prose-headings:text-dark-blue prose-headings:mb-2 prose-p:text-base lg:prose-p:text-lg prose-p:text-low-dark-blue prose-p:mb-6 prose-p:md:mb-8 prose-p:lg:mb-10"
            dangerouslySetInnerHTML={{ __html: main_title_desc }}
          />
        )}
        

        <div className="flex flex-col gap-y-8 md:gap-y-10 lg:gap-y-15">
          {list?.map((block, index) => {
            const hasTwoImages = !block.image_position && !!block.image_2?.url;

            return (
            <div key={index} className="grid grid-cols-12 gap-y-10 lg:gap-x-10 items-center">
              
              <div className={`col-span-12 lg:col-span-6 ${hasTwoImages ? 'order-2 lg:order-2' : ''} ${!block.image_position ? 'lg:order-2 xxl:w-[597px]' : 'lg:order-1 '}`}>
                {!block.image_position && block.image_2?.url ? (
                  <div className="flex items-center justify-center gap-x-3 md:gap-x-4 lg:gap-x-6">
                    <div className="relative w-[10.9375rem] h-[13.3125rem] md:w-[19.75rem] md:h-[24.0625rem] lg:w-[20.5rem] lg:h-[23.25rem] rounded-2xl overflow-hidden shrink-0">
                      <Image
                        src={block.image.url}
                        alt={block.image.alt || ''}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="relative w-[10.9375rem] h-[13.3125rem] md:w-[19.75rem] md:h-[24.0625rem] lg:w-[20.5rem] lg:h-[23.25rem] rounded-2xl overflow-hidden shrink-0">
                      <Image
                        src={block.image_2.url}
                        alt={block.image_2.alt || ''}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`relative w-full h-[262px] md:h-[415px] rounded-2xl overflow-hidden ${
                    !block.image_position && 'lg:h-[27.25rem]'
                  }`}>
                    {block.image && (
                      <Image
                        src={block.image.url}
                        alt={block.image.alt || ''}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className={`col-span-12 lg:col-span-6 ${hasTwoImages ? 'order-1 lg:order-1' : ''} ${!block.image_position ? 'lg:order-1 xxl:min-w-[623px]' : 'lg:order-2'}`}>
                <div className="flex flex-col justify-center h-full lg:pt-5">
                  <div 
                    className="prose-headings:text-xl prose-headings:lg:text-2xl prose-headings:font-semibold prose-headings:text-dark-blue prose-headings:mb-2 prose-p:text-base prose-p:text-[#5A5A5A] prose-p:mb-6 md:prose-p:mb-8 lg:prose-p:mb-10"
                    dangerouslySetInnerHTML={{ __html: block.title_desc }}
                  />

                  {block.list && (
                    <ul className="flex flex-col gap-y-4 lg:gap-y-6 mb-6 md:mb-8 lg:mb-10">
                      {block.list.map((item, i) => (
                        <li key={i} className="flex items-center gap-x-3">
                          <Image
                            src={item.icon_list === false && item.icon?.url ? item.icon.url : "/icons/check.svg"}
                            width={32}
                            height={32}
                            alt={item.icon_list === false ? item.icon?.alt || "Ícone da lista" : "Check"}
                            className="mt-0.5 shrink-0"
                          />
                          <span className="text-sm md:text-base text-dark-blue">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {block.button && (
                    <Link
                      href={block.button.url}
                      target={block.button.target}
                      className="inline-flex items-center justify-center gap-x-2 bg-red text-white text-sm md:text-base px-6 py-3 rounded-lg hover:bg-red/90 transition-colors w-full xs:w-fit xs:min-w-[328px]"
                    >
                      {block.button.title}
                      <Image src="/icons/arrow-link.svg" width={12} height={12} alt="" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>
    </section>
  );
}
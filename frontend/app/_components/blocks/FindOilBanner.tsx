'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface FindOilBannerProps {
  bg_image?: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  desc?: string;
  button?: {
    title: string;
    url: string;
    target: string;
  };
  banner_high?: boolean;
  banner_width?: boolean;
  button_icon?: {
    url: string;
    alt?: string;
  };
}

export default function FindOilBanner({ bg_image, desc, button, banner_high, banner_width, button_icon }: FindOilBannerProps) {
  return (
    <section className='find-oil-banner mt-10 md:mt-15 lg:mt-12'>
      <div className="container">
        <div className={`relative w-full rounded-2xl overflow-hidden flex items-center ${
          banner_high 
            ? "h-[280px] lg:h-[269px] md:h-[232px]" 
            : "h-[186px] md:h-[191px] lg:h-[203px]"
        }`}>
          {/* Background bg_image */}
          {bg_image && (
            <Image
              src={bg_image.url}
              alt={bg_image.alt || 'Banner Background'}
              fill
              className="object-cover z-0"
            />
          )}
          
          {/* Content */}
          <div className="relative flex items-center bg-black/40 z-10 w-full h-full px-6 lg:py-[2.5625rem] lg:px-[3rem]">
            <div className="grid grid-cols-12">
              <div className={`col-span-12 grid grid-cols-5 items-center gap-y-4 md:gap-y-5 ${
                banner_width 
                  ? "lg:prose-headings:max-w-[424px] lg:prose-p:max-w-[450px] md:prose-p:max-w-[353px]" 
                  : "w-full"
              }`}>
                {desc && (
                  <div 
                    className="text-white prose-p:leading-[1.875rem] md:prose-p:leading-[1.25rem] lg:prose-p:leading-[1.875rem] md:prose-headings:text-[1.375rem] lg:prose-headings:text-2xl prose-headings:font-semibold col-span-12"
                    dangerouslySetInnerHTML={{ __html: desc }}
                  />
                )}
                {button && (
                    <Link
                      href={button.url}
                      target={button.target}
                      className="inline-flex items-center justify-center gap-x-2 bg-white text-dark-blue text-sm md:text-base px-6 py-3 rounded-sm hover:bg-gray-100 transition-colors w-full md:w-fit col-span-12 lg:col-span-4 h-[2.375rem] md:h-10"
                    >
                    {button.title}
                    {button_icon?.url && (
                      <Image src={button_icon.url} width={18} height={18} alt={button_icon.alt || button.title} />
                    )}
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
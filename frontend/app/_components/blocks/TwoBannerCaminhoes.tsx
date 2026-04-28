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

export default function TwoBannerCaminhoes({ list }: TwoBannerProps) {
  if (!list || list.length < 2) return null;

  const [firstBanner, secondBanner, thirdBanner, fourthBanner] = list;

  return (
    <section className="w-full mt-10 md:mt-15 lg:mt-12 two-banner">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-12 gap-3">
          {firstBanner && (
            <div
              className="col-span-12 lg:col-span-5 relative w-full min-h-[207px] md:h-[16.8125rem] rounded-lg md:rounded-2xl overflow-hidden group"
            >
            {/* Imagem de Fundo */}
            {firstBanner?.image?.url && (
              <Image
                src={firstBanner?.image.url}
                alt={firstBanner?.image.alt || 'Banner'}
                fill
                className="object-cover"
              />
            )}

            {/* Overlay e Conteúdo */}
            <div className="absolute inset-0 bg-black/20 px-4 py-5 md:p-8 lg:p-6 flex flex-col justify-end items-start">
              <div
                className="text-white mb-6 prose max-w-none prose-headings:text-white prose-headings:font-semibold prose-headings:mb-2 prose-headings:text-xl md:prose-headings:text-[1.375rem] lg:prose-headings:text-2xl prose-p:text-base prose-p:font-normal prose-p:leading-snug prose-p:lg:w-[362px] md:max-w-[28.125rem]"
                dangerouslySetInnerHTML={{ __html: firstBanner?.content ?? "" }}
              />

              {firstBanner.button && (
                <Link
                  href={firstBanner?.button.url}
                  target={firstBanner?.button.target}
                  className="inline-flex items-center justify-center gap-2 bg-white text-dark-blue px-4 py-2 rounded-sm text-sm md:text-base font-medium h-[38px] md:h-[40px] w-full md:w-fit md:min-w-[20.5rem] lg:min-w-[22.625rem]"
                >
                  {firstBanner?.button.title}
                  <Image src="/icons/arrow-link-blue.svg" alt="" width={12} height={12} />
                </Link>
              )}
            </div>
          </div>
          )}

          {/**Segundo Banner */}
          {secondBanner && (
            <div
              className="col-span-12 lg:col-span-7 relative w-full min-h-[256px] md:h-[16.8125rem] rounded-lg md:rounded-2xl overflow-hidden group"
            >
            {/* Imagem de Fundo */}
            {secondBanner?.image?.url && (
              <Image
                src={secondBanner?.image.url}
              alt={secondBanner?.image.alt || 'Banner'}
              fill
              className="object-cover"
            />
            )}

            {/* Overlay e Conteúdo */}
            <div className="absolute inset-0 bg-black/20 px-4 py-5 md:p-8 lg:p-6 flex flex-col justify-end items-start">
              <div
                className="text-white mb-6 prose max-w-none prose-headings:text-white prose-headings:font-semibold prose-headings:mb-2 prose-headings:text-xl md:prose-headings:text-[1.375rem] lg:prose-headings:text-2xl prose-p:text-base prose-p:font-normal prose-p:leading-snug prose-p:lg:w-[377px] md:max-w-[28.125rem]"
                dangerouslySetInnerHTML={{ __html: secondBanner?.content ?? "" }}
              />

              {secondBanner?.button && (
                <Link
                  href={secondBanner?.button.url}
                  target={secondBanner?.button.target}
                  className="inline-flex items-center justify-center gap-2 bg-white text-dark-blue px-4 py-2 rounded-sm text-sm md:text-base font-medium h-[38px] md:h-[40px] w-full md:w-fit md:min-w-[20.5rem] lg:min-w-[22.625rem]"
                >
                  {secondBanner?.button.title}
                  <Image src="/icons/arrow-link-blue.svg" alt="" width={12} height={12} />
                </Link>
              )}
            </div>
          </div>
          )}

          {/**Terceiro Banner */}
          {thirdBanner && (
            <div
              className="col-span-12 lg:col-span-7 relative w-full min-h-[280px] md:h-[16.8125rem] rounded-lg md:rounded-2xl overflow-hidden group"
            >
              {/* Imagem de Fundo */}
              {thirdBanner?.image?.url && (
                <Image
                  src={thirdBanner?.image.url}
                  alt={thirdBanner?.image.alt || 'Banner'}
                  fill
                  className="object-cover"
                />
              )}

              {/* Overlay e Conteúdo */}
              <div className="absolute inset-0 bg-black/20 px-4 py-5 md:p-8 lg:p-6 flex flex-col justify-end items-start">
                <div
                  className="text-white mb-6 prose max-w-none prose-headings:text-white prose-headings:font-semibold prose-headings:mb-2 prose-headings:text-xl md:prose-headings:text-[1.375rem] lg:prose-headings:text-2xl prose-p:text-base prose-p:font-normal prose-p:leading-snug prose-p:lg:w-[344px] md:max-w-[28.125rem]"
                  dangerouslySetInnerHTML={{ __html: thirdBanner?.content ?? "" }}
                />

                {thirdBanner?.button && (
                  <Link
                    href={thirdBanner?.button.url}
                    target={thirdBanner?.button.target}
                    className="inline-flex items-center justify-center gap-2 bg-white text-dark-blue px-4 py-2 rounded-sm text-sm md:text-base font-medium h-[38px] md:h-[40px] w-full md:w-fit md:min-w-[20.5rem] lg:min-w-[22.625rem]"
                  >
                    {thirdBanner?.button.title}
                    <Image src="/icons/download_ico.svg" alt="" width={12} height={12} />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/**Quarto Banner */}
          {fourthBanner && (
            <div
              className="col-span-12 lg:col-span-5 relative w-full min-h-[14.0625rem] md:h-[16.8125rem] rounded-lg md:rounded-2xl overflow-hidden group justify-end"
            >
              {/* Imagem de Fundo */}
              {fourthBanner?.image?.url && (
                <Image
                  src={fourthBanner?.image.url}
                  alt={fourthBanner?.image.alt || 'Banner'}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-right"
                />
              )}

              {/* Overlay e Conteúdo */}
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
                    className="text-white mb-6 prose prose-headings:text-white prose-headings:font-semibold prose-headings:mb-2 prose-headings:text-xl md:prose-headings:text-[1.375rem] lg:prose-headings:text-2xl prose-p:text-base prose-p:font-normal prose-p:leading-snug prose-p:w-full w-full"
                    dangerouslySetInnerHTML={{ __html: fourthBanner?.content ?? "" }}
                  />

                  {fourthBanner?.button && (
                    <Link
                      href={fourthBanner?.button.url}
                      target={fourthBanner?.button.target}
                      className="flex self-stretch md:self-auto items-center justify-center gap-2 bg-white text-dark-blue px-4 py-2 rounded-sm text-sm md:text-base font-medium h-[35px] md:w-fit md:min-w-[20.5rem] lg:min-w-[22.625rem]"
                    >
                      <Image src="/icons/tool_blue_svg.svg" alt="" width={13.26} height={13.26} />
                      {fourthBanner?.button.title}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

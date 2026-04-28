'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoItem {
  image: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  link?: {
    url: string;
    title?: string;
    target?: string;
  };
}

interface PilotItem {
  image: {
    url: string;
    alt: string;
  };
  name: string;
  nickname: string;
}

interface CarouselInfinityScrollProps {
  title_desc: string;
  link: {
    title: string;
    url: string;
    target: string;
  };
  logotipos: LogoItem[];
  pilots: PilotItem[];
}

export default function CarouselInfinityScroll({ title_desc, link, logotipos, pilots }: CarouselInfinityScrollProps) {
  const logos = logotipos ?? [];
  const partners = pilots ?? [];

  // Duração proporcional à qtd de itens, mantendo a mesma velocidade do original (4200ms/slide).
  const logoDuration = `${Math.max(logos.length * 4.2, 8)}s`;
  const partnerDuration = `${Math.max(partners.length * 4.2, 8)}s`;

  const pauseTrack = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = e.currentTarget.querySelector<HTMLElement>('.carousel-track');
    if (track) track.style.animationPlayState = 'paused';
  };

  const resumeTrack = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = e.currentTarget.querySelector<HTMLElement>('.carousel-track');
    if (track) track.style.animationPlayState = 'running';
  };

  return (
    <section className="w-full bg-neutral py-8 md:py-10 lg:py-[60px] overflow-hidden carousel-infinity-scroll">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-8 items-center">
          
          <div className="col-span-1 lg:col-span-3 flex flex-col items-start">
            {title_desc && (
              <div 
                className="prose prose-headings:text-dark-blue prose-headings:font-semibold prose-headings:text-xl prose-headings:tracking-[-1px] prose-h4:tracking-normal md:prose-headings:text-3xl lg:prose-headings:text-[2rem] prose-h4:text-red prose-h4:text-base prose-h4:font-normal prose-h4:uppercase prose-p:text-gray-600 prose-p:text-sm md:prose-p:text-base prose-headings:mb-2 lg:prose-p:text-lg mb-4 lg:mb-6"
                dangerouslySetInnerHTML={{ __html: title_desc }}
              />
            )}
            
            {link && (
              <Link 
                href={link.url}
                target={link.target}
                className="inline-flex items-center justify-center bg-red text-white text-sm md:text-base font-medium px-6 py-3 rounded-sm hover:bg-[#b00008] transition-colors"
              >
                {link.title}
              </Link>
            )}
          </div>

          <div className="col-span-1 lg:col-span-9 min-w-0">
            <div className="flex flex-col gap-6 w-full lg:w-[150%]">

              {/* Fileira 1: scroll para esquerda */}
              {logos.length > 0 && (
                <div className="overflow-hidden" onMouseEnter={pauseTrack} onMouseLeave={resumeTrack}>
                  {/*
                    Duas cópias idênticas dos itens. Cada cópia leva pr-4 (= gap entre itens)
                    para que a largura de cada cópia seja exatamente N*(itemWidth+gap).
                    Assim translateX(-50%) move exatamente uma cópia — loop perfeito sem salto.
                  */}
                  <div
                    className="carousel-track flex"
                    style={{ animation: `carousel-left ${logoDuration} linear infinite` }}
                  >
                    {[logos, logos].map((group, gi) => (
                      <div key={gi} className="flex shrink-0 gap-4 pr-4">
                        {group.map((item, index) => {
                          const cardContent = (
                            <div className="bg-white rounded-[8px] p-4 flex items-center justify-center">
                              <div className="bg-[#F0F2F5] rounded-base w-full h-[99px] flex items-center justify-center">
                                <div className="w-[80px] h-[80px] relative">
                                  {item.image && (                                   
                                      <Image
                                        src={item.image.url}
                                        alt={item.image.alt || ''}
                                        fill
                                        className="object-contain"
                                      />                                    
                                  )}
                                </div>
                              </div>
                            </div>
                          );

                          return (
                            <div key={index} className="flex-shrink-0 w-[194px]">
                              {item.link?.url ? (
                                <Link
                                  href={item.link.url}
                                  target={item.link.target || '_self'}
                                  rel={item.link.target === '_blank' ? 'noopener noreferrer' : undefined}
                                >
                                  {cardContent}
                                </Link>
                              ) : (
                                cardContent
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fileira 2: scroll para direita */}
              {partners.length > 0 && (
                <div className="overflow-hidden" onMouseEnter={pauseTrack} onMouseLeave={resumeTrack}>
                  <div
                    className="carousel-track flex"
                    style={{ animation: `carousel-right ${partnerDuration} linear infinite` }}
                  >
                    {[partners, partners].map((group, gi) => (
                      <div key={gi} className="flex shrink-0 gap-4 pr-4">
                        {group.map((partner, index) => {
                          const instagramUrl = partner.nickname
                            ? `https://instagram.com/${partner.nickname}`
                            : null;

                          const cardContent = (
                            <div className="bg-white rounded-[8px] p-4">
                              <div className="bg-[#F0F2F5] rounded-base w-full h-[99px] flex items-center justify-center mb-4 overflow-hidden">
                                <div className="w-[200px] h-[92px] relative">
                                  {partner.image && (
                                    <Image
                                      src={partner.image.url}
                                      alt={partner.image.alt || ''}
                                      fill
                                      className="object-cover object-top rounded-md"
                                    />
                                  )}
                                </div>
                              </div>
                              <div className="px-1">
                                <h3 className="text-dark-blue text-[18px] font-normal leading-tight mb-1">
                                  {partner.name}
                                </h3>
                                <p className="text-[#374151] text-sm">
                                  @{partner.nickname}
                                </p>
                              </div>
                            </div>
                          );

                          return (
                            <div key={index} className="flex-shrink-0 w-[252px]">                              
                              {instagramUrl ? (
                                <Link
                                  href={instagramUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {cardContent}
                                </Link>
                              ) : (
                                cardContent
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

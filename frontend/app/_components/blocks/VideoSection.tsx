"use client";

import React, { useState } from "react";
import Image from "next/image";

interface VideoSectionProps {
  dark_theme?: boolean;
  title?: string;
  text?: string;
  video_url?: string;
  thumbnail?: {
    url: string;
    alt?: string;
  };
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch)
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;

  return url;
}

export default function VideoSection({
  dark_theme = false,
  title,
  text,
  video_url,
  thumbnail,
}: VideoSectionProps) {
  const [playing, setPlaying] = useState(false);

  const embedUrl = video_url ? getEmbedUrl(video_url) : null;

  const fullVideo = !(title || text);

  return (
    <section className={`w-full py-10 md:py-14 lg:py-10 ${dark_theme ? 'bg-[#010101]' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 md:gap-8 lg:gap-12">
          {(title || text) && (
            <div className="flex-1 antialiased [text-rendering:optimizeLegibility]">
              {title && (
                <h2 className={`text-2xl md:text-3xl lg:text-[2rem] font-semibold leading-tight mb-3 md:mb-4 ${dark_theme ? 'text-white' : 'text-dark-blue'}`}>
                  {title}
                </h2>
              )}
              {text && (
                <div
                  className={`text-sm md:text-base lg:text-lg leading-relaxed [&>strong]:font-semibold [&>b]:font-semibold ${dark_theme ? 'text-gray-300' : 'text-low-dark-blue'}`}
                  dangerouslySetInnerHTML={{ __html: text }}
                />
              )}
            </div>
          )}

          <div className={`w-full shrink-0 ${fullVideo ? "lg:w-full" : "lg:w-[613px]"}`}>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-neutral">
              {playing && embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={title || "Vídeo"}
                />
              ) : (
                <>
                  {thumbnail?.url && (
                    <Image
                      src={thumbnail.url}
                      alt={thumbnail.alt || title || "Thumbnail do vídeo"}
                      fill
                      sizes="(max-width: 1024px) 100vw, 613px"
                      quality={88}
                      className="object-cover object-center"
                    />
                  )}
                  <div
                    className="absolute inset-0 z-[1] pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(0, 20, 80, 0) 0%, rgba(0, 20, 80, 0.42) 100%)",
                    }}
                  />
                  {video_url && (
                    <button
                      onClick={() => setPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center z-10 group"
                      aria-label="Reproduzir vídeo"
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                        <svg
                          width="28"
                          height="32"
                          viewBox="0 0 28 32"
                          fill="none"
                          className="ml-1"
                        >
                          <path
                            d="M26 14.268C27.3333 15.0378 27.3333 16.9623 26 17.7321L4 30.4282C2.66667 31.198 1 30.2358 1 28.6962V3.30385C1 1.76425 2.66667 0.802047 4 1.57185L26 14.268Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

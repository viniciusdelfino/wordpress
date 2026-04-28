import React from "react";
import Image from "next/image";

interface StatItem {
  number?: string;
  description?: string;
}

interface GlobalReferenceProps {
  tag?: string;
  title?: string;
  text?: string;
  image?: {
    url: string;
    alt?: string;
  };
  stats?: StatItem[];
}

export default function GlobalReference({
  tag,
  title,
  text,
  image,
  stats,
}: GlobalReferenceProps) {
  return (
    <section className="w-full py-10 md:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #001450 0%, #000000 100%)",
          }}
        >
          <div className="flex flex-col lg:flex-row">
            {image?.url && (
              <div className="relative w-full lg:w-[512px] shrink-0 aspect-[4/3] lg:aspect-auto lg:min-h-[480px]">
                <Image
                  src={image.url}
                  alt={image.alt || ""}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex-1 p-6 md:p-10 lg:p-12 flex flex-col justify-center">
              {tag && (
                <span className="inline-block text-xs md:text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
                  {tag}
                </span>
              )}
              {title && (
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white leading-tight mb-4">
                  {title}
                </h2>
              )}
              {text && (
                <p className="text-sm md:text-base text-white/80 leading-relaxed mb-8">
                  {text}
                </p>
              )}

              {stats && stats.length > 0 && (
                <div className="flex flex-col md:flex-row gap-4">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-xl border border-white/8 bg-white/6 p-4 md:p-5"
                    >
                      {stat.number && (
                        <p className="text-2xl md:text-3xl font-semibold text-white mb-1">
                          {stat.number}
                        </p>
                      )}
                      {stat.description && (
                        <p className="text-xs md:text-sm text-white/70 leading-relaxed">
                          {stat.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

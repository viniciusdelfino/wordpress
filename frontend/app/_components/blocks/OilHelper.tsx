'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AcfCard {
  card_title?: string;
  card_description?: string;
  card_button?: string;
  card_button_url?: string;
  card_button_icon?: { url: string } | false;
  card_image?: { url: string; alt?: string };
}

interface OilHelperProps {
  title?: string;
  description?: string;
  cards?: AcfCard[];
  // Fallback single-banner props
  button?: { title: string; url: string; target?: string };
  background_image?: { url: string; alt?: string };
}

function CardItem({ card }: { card: AcfCard }) {
  const buttonUrl = card.card_button_url || '#';
  const hasIcon = card.card_button_icon && typeof card.card_button_icon === 'object' && card.card_button_icon.url;
  const isExternal = buttonUrl.startsWith('http');

  return (
    <article className="flex-1 flex flex-col md:flex-row gap-4 items-center bg-neutral-2 rounded-lg p-5 md:min-h-[296px] md:max-h-[400px]">
      {/* Text + button */}
      <div className="flex flex-col h-full w-full md:flex-1 items-start justify-between gap-4">
        <div className="flex flex-col gap-4 w-full">
          {card.card_title && (
            <h3 className="text-lg md:text-xl font-semibold text-dark-blue leading-[1.4] tracking-[-0.3125px]">
              {card.card_title}
            </h3>
          )}
          {card.card_description && (
            <p className="text-sm text-medium-gray leading-[1.4]">
              {card.card_description}
            </p>
          )}
        </div>
        {card.card_button && (
          <Link
            href={buttonUrl}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="flex items-center justify-center gap-2 w-full bg-dark-blue hover:bg-dark-blue/90 text-white text-base px-4 py-3 rounded transition-colors"
          >
            {hasIcon && (
              <Image
                src={(card.card_button_icon as { url: string }).url}
                alt=""
                width={18}
                height={18}
                className="flex-shrink-0"
              />
            )}
            {card.card_button}
          </Link>
        )}
      </div>

      {/* Image */}
      {card.card_image?.url && (
        <div className="relative w-full md:w-[263px] h-[200px] md:h-full md:min-h-[256px] rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={card.card_image.url}
            alt={card.card_image.alt || card.card_title || ''}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 263px"
          />
        </div>
      )}
    </article>
  );
}

export default function OilHelper({
  title,
  description,
  cards,
  button,
  background_image,
}: OilHelperProps) {
  if (!title && !description) return null;

  const hasCards = cards && cards.length > 0;

  // Layout with 2 cards side by side
  if (hasCards) {
    return (
      <section className="w-full py-10 md:py-15 bg-white">
        <div className="container mx-auto flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            {title && (
              <h2 className="text-xl md:text-2xl lg:text-[2rem] leading-[1.4] lg:leading-[46px] font-semibold text-dark-blue">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-base md:text-lg lg:text-xl leading-snug text-low-dark-blue max-w-[800px]">
                {description}
              </p>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
            {cards.map((card, i) => (
              <CardItem key={i} card={card} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Fallback: single dark-blue banner
  const hasImage = background_image?.url;

  return (
    <section className="w-full py-6 md:py-8 lg:py-10">
      <div className="container mx-auto">
        <div className="relative rounded-2xl overflow-hidden min-h-[240px] md:min-h-[269px] flex items-center bg-dark-blue">
          {hasImage && (
            <>
              <Image
                src={background_image.url}
                alt={background_image.alt || ''}
                fill
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
                }}
              />
            </>
          )}
          <div className="relative z-10 w-full px-6 md:px-8 lg:px-10 py-8 flex flex-col items-start justify-center gap-4 lg:gap-6">
            <div className="flex flex-col gap-2">
              {title && (
                <h2 className="text-xl md:text-2xl font-semibold text-white leading-normal">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-lg">
                  {description}
                </p>
              )}
            </div>
            {button?.url && button?.title && (
              <Link
                href={button.url}
                target={button.target || '_self'}
                className="inline-flex items-center justify-center gap-2 bg-red text-white rounded px-6 py-3 text-sm md:text-base font-medium hover:bg-red/90 transition-colors"
              >
                {button.title}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

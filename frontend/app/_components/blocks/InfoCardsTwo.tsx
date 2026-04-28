import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface InfoCard {
  icon?: string;
  title: string;
  description: string;
  link_text: string;
  link_url: string;
}

interface InfoCardsTwoProps {
  title?: string;
  cards?: InfoCard[];
}

// Default cards for "Onde Comprar" page
const DEFAULT_CARDS: InfoCard[] = [
  {
    icon: 'oil',
    title: 'Encontre o óleo ideal',
    description: 'Use nossa ferramenta para descobrir qual óleo Mobil™ é o mais indicado para o seu veículo.',
    link_text: 'Encontre seu óleo',
    link_url: '/encontre-seu-oleo',
  },
  {
    icon: 'chat',
    title: 'Conheça o Oli',
    description: 'Nosso assistente virtual pode te ajudar a encontrar o produto certo para suas necessidades.',
    link_text: 'Fale com o Oli',
    link_url: '/contato',
  },
];

const DEFAULT_TITLE = 'Não sabe qual óleo usar? A gente te ajuda.';

export default function InfoCardsTwo({ title, cards }: InfoCardsTwoProps) {
  const displayTitle = title || DEFAULT_TITLE;
  const displayCards = cards && cards.length > 0 ? cards : DEFAULT_CARDS;

  const getIconSvg = (iconType?: string) => {
    switch (iconType) {
      case 'oil':
        return (
          <svg className="w-10 h-10 md:w-12 md:h-12" viewBox="0 0 48 48" fill="none">
            <path
              d="M24 4C17.37 4 12 9.37 12 16c0 9 12 22 12 22s12-13 12-22c0-6.63-5.37-12-12-12zm0 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
              fill="#d0000a"
            />
            <circle cx="36" cy="36" r="10" fill="#001450" />
            <path d="M36 31v10M31 36h10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      case 'chat':
        return (
          <svg className="w-10 h-10 md:w-12 md:h-12" viewBox="0 0 48 48" fill="none">
            <path
              d="M8 8h32v24H16l-8 8V8z"
              fill="#001450"
            />
            <circle cx="16" cy="20" r="2.5" fill="white" />
            <circle cx="24" cy="20" r="2.5" fill="white" />
            <circle cx="32" cy="20" r="2.5" fill="white" />
          </svg>
        );
      default:
        return (
          <svg className="w-10 h-10 md:w-12 md:h-12" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill="#001450" />
            <path d="M24 14v10l7 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <section className="py-10 md:py-[3.75rem] lg:py-20 bg-neutral">
      <div className="container mx-auto">
        {/* Section title */}
        <h2 className="text-xl md:text-2xl lg:text-[1.75rem] font-semibold text-dark-blue text-center mb-6 md:mb-8 lg:mb-10">
          {displayTitle}
        </h2>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-[52rem] mx-auto">
          {displayCards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Icon */}
              <div className="mb-4 md:mb-5">
                {getIconSvg(card.icon)}
              </div>

              {/* Title */}
              <h3 className="text-lg md:text-xl font-semibold text-dark-blue mb-2 md:mb-3">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-sm md:text-base text-medium-gray mb-5 md:mb-6 leading-relaxed">
                {card.description}
              </p>

              {/* Link */}
              <Link
                href={card.link_url}
                className="inline-flex items-center gap-2 text-red font-semibold text-sm md:text-base hover:text-red/80 transition-colors"
              >
                {card.link_text}
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import InfoCardsFour from './InfoCardsFour';

interface FaqQuestion {
  question: string;
  answer: string;
}

interface FaqCategory {
  category_name: string;
  questions: FaqQuestion[];
}

interface FaqFilteredQuestion extends FaqQuestion {
  categoryName: string;
}

interface FaqLink {
  title: string;
  url: string;
  target: string;
}

interface FaqInfoCard {
  image: {
    url: string;
    alt: string;
  };
  title_desc: string;
  link: {
    title: string;
    url: string;
    target: string;
  };
}

interface FaqSectionProps {
  faq_title: string;
  faq_subtitle: string;
  faq_search_placeholder: string;
  faq_categories: FaqCategory[];
  faq_footer_text: string;
  faq_footer_link: FaqLink;
  faq_hero_desktop: string;
  faq_hero_tablet: string;
  faq_hero_mobile: string;
  faq_info_cards?: FaqInfoCard[];
}

export default function FaqSection({
  faq_title,
  faq_subtitle,
  faq_search_placeholder,
  faq_categories,
  faq_footer_text,
  faq_footer_link,
  faq_hero_desktop,
  faq_hero_tablet,
  faq_hero_mobile,
  faq_info_cards,
}: FaqSectionProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const normalize = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const isSearching = searchTerm.trim().length > 0;

  const filteredQuestions = useMemo(() => {
    if (!faq_categories) return [];

    // Busca global: pesquisa em todas as categorias
    if (isSearching) {
      const term = normalize(searchTerm);
      const allResults: FaqFilteredQuestion[] = [];

      faq_categories.forEach((cat) => {
        (cat.questions || []).forEach((q) => {
          if (
            normalize(q.question).includes(term) ||
            normalize(q.answer.replace(/<[^>]*>/g, '')).includes(term)
          ) {
            allResults.push({ ...q, categoryName: cat.category_name });
          }
        });
      });

      // Se não encontrou nada, retorna todas da categoria ativa
      if (allResults.length === 0) {
        return (faq_categories[activeCategory]?.questions || []).map((q) => ({
          ...q,
          categoryName: faq_categories[activeCategory].category_name,
        }));
      }

      return allResults;
    }

    // Sem busca: mostra perguntas da categoria ativa
    const cat = faq_categories[activeCategory];
    if (!cat) return [];
    return (cat.questions || []).map((q) => ({
      ...q,
      categoryName: cat.category_name,
    }));
  }, [faq_categories, activeCategory, searchTerm, isSearching]);

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleCategoryChange = (index: number) => {
    setActiveCategory(index);
    setOpenItems(new Set());
  };

  if (!faq_categories || faq_categories.length === 0) return null;

  return (
    <>
      {/* Hero Banner */}
      <div className="w-full h-[200px] md:h-[260px] relative overflow-hidden mb-[32px] md:mb-[60px] lg:mb-[48px]">
        {faq_hero_desktop && (
          <img
            src={faq_hero_desktop}
            alt=""
            className="hidden lg:block w-full h-full object-cover"
          />
        )}
        {faq_hero_tablet && (
          <img
            src={faq_hero_tablet}
            alt=""
            className="hidden md:block lg:hidden w-full h-full object-cover"
          />
        )}
        {faq_hero_mobile && (
          <img
            src={faq_hero_mobile}
            alt=""
            className="block md:hidden w-full h-full object-cover"
          />
        )}
        {!faq_hero_desktop && !faq_hero_tablet && !faq_hero_mobile && (
          <div className="w-full h-full bg-dark-blue" />
        )}
      </div>

      {/* FAQ Content */}
      <section className="w-full py-8 lg:py-[65px]">
        <div className="container mx-auto">
          {/* Title & Subtitle */}
          <div className="flex flex-col gap-4 mb-8">
            <h1 className="text-[24px] md:text-[28px] font-normal leading-[30px] text-black">
              {faq_title}
            </h1>
            <p className="text-lg text-gray-medium-2 leading-[1.4]">
              {faq_subtitle}
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-[#fafafa] rounded-[6px] p-4 md:px-[25px] md:py-[24px] mb-8">
            <div className="flex flex-col md:flex-row gap-4 md:gap-4 md:items-center">
              <label className="text-base text-black whitespace-nowrap font-normal">
                Como podemos ajudar?
              </label>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={faq_search_placeholder || 'Buscar perguntas ou palavras chave'}
                  className="w-full max-w-[1030px] h-[52px] px-4 pr-12 rounded-lg border border-[#f3f4f6] bg-white text-base text-dark-blue placeholder:text-gray-medium-2 focus:outline-none focus:border-blue"
                />
                <Image
                  src="/icons/search-gray.svg"
                  alt="Buscar"
                  width={18}
                  height={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                />
              </div>
            </div>
          </div>

          {/* Tablet: Horizontal Scroll Tabs — overflow viewport */}
          {!isSearching && (
            <div className="hidden md:block lg:hidden -mr-[60px] mb-10 overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 w-max">
                {faq_categories.map((cat, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategoryChange(index)}
                    className={`faq-tab-button shrink-0 ${activeCategory === index ? 'active' : ''}`}
                  >
                    {cat.category_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Tabs + Accordion */}
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Desktop: Vertical Tabs (sidebar) — hidden during search */}
            {!isSearching && (
              <div className="hidden lg:flex flex-col gap-3 shrink-0">
                {faq_categories.map((cat, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategoryChange(index)}
                    className={`faq-tab-button text-left ${activeCategory === index ? 'active' : ''}`}
                  >
                    {cat.category_name}
                  </button>
                ))}
              </div>
            )}

            {/* Mobile: Dropdown — hidden during search */}
            {!isSearching && (
              <div className="flex md:hidden bg-white p-2 rounded-lg shadow-[0px_4px_8px_0px_rgba(0,22,43,0.04)]">
                <div className="flex items-center gap-6 flex-1">
                  <span className="text-[10.3px] font-bold text-[#737477] uppercase whitespace-nowrap leading-6">
                    Filtrar por
                  </span>
                  <div className="relative flex-1">
                    <select
                      value={activeCategory}
                      onChange={(e) => handleCategoryChange(Number(e.target.value))}
                      className="w-full h-10 px-3 pr-8 rounded border border-gray bg-white text-sm text-dark-blue appearance-none focus:outline-none focus:border-blue"
                    >
                      {faq_categories.map((cat, index) => (
                        <option key={index} value={index}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark-blue"
                      width="12"
                      height="6"
                      viewBox="0 0 12 6"
                      fill="none"
                    >
                      <path d="M1 0.5L6 5.5L11 0.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Accordion */}
            <div className="flex-1 flex flex-col gap-3">
              {filteredQuestions.map((item, qIndex) => {
                const itemKey = isSearching ? `search-${qIndex}` : `${activeCategory}-${qIndex}`;
                const isOpen = openItems.has(itemKey);

                return (
                  <div
                    key={itemKey}
                    className={`border rounded-lg overflow-hidden transition-shadow ${
                      isOpen
                        ? 'py-4 border-[#e3e5e6] bg-[rgba(249,249,249,0.5)] shadow-[0px_1px_5px_0px_rgba(0,0,0,0.1)]'
                        : 'border-[#e5e7eb]'
                    }`}
                  >
                    <button
                      onClick={() => toggleItem(itemKey)}
                      className={`w-full flex items-center justify-between text-left cursor-pointer ${
                        isOpen
                          ? 'px-4 pt-3 pb-[13px] md:pt-5 md:pb-[21px] border-b border-[rgba(229,231,235,0.6)]'
                          : 'px-[17px] py-[13px] md:py-[21px]'
                      }`}
                      aria-expanded={isOpen}
                    >
                      <div className="flex flex-col gap-1 pr-4">
                        {isSearching && item.categoryName && (
                          <span className="text-xs text-medium-gray font-normal">
                            {item.categoryName}
                          </span>
                        )}
                        <span className="text-lg font-normal text-dark-blue leading-6">
                          {item.question}
                        </span>
                      </div>
                      <Image
                        src={isOpen ? "/icons/chevron-up-gray.svg" : "/icons/chevron-down-gray.svg"}
                        alt=""
                        width={20}
                        height={20}
                        className="shrink-0"
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 py-3 md:py-6">
                        <div
                          className="text-[15px] text-low-dark-blue leading-6 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.answer }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Footer */}
              <div className="flex items-center gap-2 py-5 text-base text-dark-blue tracking-[-0.3125px]">
                <span>{faq_footer_text}</span>
                {faq_footer_link && (
                  <a
                    href={faq_footer_link.url}
                    target={faq_footer_link.target || '_self'}
                    className="underline font-normal hover:text-blue"
                  >
                    {faq_footer_link.title || 'Fale Conosco'}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      {faq_info_cards && faq_info_cards.length > 0 && (
        <InfoCardsFour card={faq_info_cards} />
      )}
    </>
  );
}

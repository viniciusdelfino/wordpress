'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Bullet {
  text: string;
}

interface ContentSection {
  image_tab?: { url: string; alt?: string };
  title_content: string;
  description_tab: string;
  bullets_tab?: Bullet[];
}

interface Tab {
  label: string;
  content_sections: ContentSection[];
}

interface EngineerPortfolioTabsProps {
  title_tab: string;
  tabs: Tab[];
}

const CheckIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <circle cx="10" cy="10" r="9" stroke="#001450" strokeWidth="1.5" />
    <path
      d="M6.5 10l2.5 2.5 4.5-5"
      stroke="#001450"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function EngineerPortfolioTabs({ title_tab, tabs }: EngineerPortfolioTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (!Array.isArray(tabs) || !tabs.length) return null;

  const currentTab = tabs[activeTab] ?? tabs[0];

  return (
    <section className="w-full bg-neutral-2 py-10 lg:py-[60px]">
      <div className="container mx-auto px-4">
        {/* Section title_tab */}
        {title_tab && (
          <h2 className="text-dark-blue font-semibold text-2xl md:text-[28px] lg:text-[32px] leading-tight mb-10">
            {title_tab}
          </h2>
        )}

        {/* Tabs wrapper */}
        <div className="flex flex-col items-start">
          {/* Tab bar */}
          <div className="w-full flex overflow-x-auto overflow-y-hidden border-l border-r border-t border-[#e5e7eb] rounded-tl rounded-tr bg-white h-12 lg:h-10 lg:overflow-x-visible">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`shrink-0 lg:flex-1 flex items-center justify-center px-3 lg:px-5 h-full cursor-pointer transition-colors whitespace-nowrap rounded-tl rounded-tr
                  ${activeTab === index
                    ? 'bg-[#002959] text-white font-semibold'
                    : 'bg-transparent text-[#002959] font-normal hover:bg-[#f3f4f6]'
                  }`}
              >
                <span className="text-sm lg:text-base leading-[1.5]">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content panel */}
          <div className="w-full bg-white border border-[#e5e7eb] rounded-bl rounded-br p-4 md:p-6 lg:p-12">
            <div className="flex flex-col gap-20 lg:gap-[60px]">
              {currentTab?.content_sections?.map((section, index) => {
                const isOdd = index % 2 === 1;

                return (
                  <div
                    key={index}
                    className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start lg:items-center"
                  >
                    {/* Image — always first in DOM (top on mobile) */}
                    {/* On desktop: even index → right (order-2), odd index → left (order-1) */}
                    <div
                      className={`relative w-full aspect-[580/376] lg:w-[580px] lg:h-[376px] lg:aspect-auto lg:shrink-0 rounded-2xl overflow-hidden bg-dark-blue
                        ${!isOdd ? 'lg:order-2' : 'lg:order-1'}`}
                    >
                      {section.image_tab?.url && (
                        <>
                          <Image
                            src={section.image_tab.url}
                            alt={section.image_tab.alt || ''}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(0,20,80,0.75)]" />
                        </>
                      )}
                    </div>

                    {/* Text content */}
                    <div
                      className={`flex-1 flex flex-col gap-2
                        ${!isOdd ? 'lg:order-1' : 'lg:order-2'}`}
                    >
                      <h3 className="text-dark-blue font-semibold text-xl md:text-[28px] lg:text-[32px] leading-tight">
                        {section.title_content}
                      </h3>
                      <p className="text-low-dark-blue text-base lg:text-lg leading-[1.45]">
                        {section.description_tab}
                      </p>

                      {section.bullets_tab?.length ? (
                        <div className="flex flex-col gap-6 mt-8">
                          {section.bullets_tab.map((bullet, bi) => (
                            <div key={bi} className="flex gap-2 items-center">
                              <CheckIcon />
                              <p className="flex-1 text-dark-blue text-sm md:text-base leading-normal">
                                {bullet.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

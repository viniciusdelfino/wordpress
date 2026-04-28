import React from 'react';

interface ContactCard {
  icon: 'headset' | 'phone' | 'shield' | string;
  title: string;
  phone: string;
  email: string;
  company_name: string;
  description: string;
  hours: string;
  link: {
    title: string;
    url: string;
    target: string;
  } | null;
}

interface ContactInfoBlockProps {
  title: string;
  description: string;
  cards: ContactCard[];
}

function HeadsetIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-dark-blue shrink-0">
      <path d="M3 18V12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 19C21 20.1046 20.1046 21 19 21H18C16.8954 21 16 20.1046 16 19V16C16 14.8954 16.8954 14 18 14H21V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 19C3 20.1046 3.89543 21 5 21H6C7.10457 21 8 20.1046 8 19V16C8 14.8954 7.10457 14 6 14H3V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PressIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-dark-blue shrink-0">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 8H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 11H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="13" y="7" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-dark-blue shrink-0">
      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CardIcon({ type }: { type: string }) {
  if (type === 'headset') return <HeadsetIcon />;
  if (type === 'phone') return <PressIcon />;
  return <ShieldIcon />;
}

function PhoneSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#525252] shrink-0">
      <path d="M22 16.92V19.92C22 20.48 21.56 20.93 21 20.97C20.17 21.04 19.34 20.99 18.52 20.83C15.67 20.24 13.01 18.93 10.79 17.07C8.73 15.35 7.06 13.21 5.91 10.79C5.06 8.98 4.56 7.02 4.45 5C4.44 4.44 4.87 3.98 5.43 3.96L8.43 3.82C8.98 3.8 9.45 4.2 9.52 4.75C9.6 5.42 9.76 6.08 10 6.71C10.14 7.07 10.06 7.48 9.78 7.76L8.64 8.9C9.71 11.01 11.49 12.79 13.6 13.86L14.74 12.72C15.02 12.44 15.43 12.36 15.79 12.5C16.42 12.74 17.08 12.9 17.75 12.98C18.31 13.05 18.7 13.53 18.68 14.08L18.54 17.08" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EmailSmallIcon() {
  return (
    <svg width="14" height="10" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#525252] shrink-0">
      <rect x="1" y="1" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M23 2L13.03 9.7C12.39 10.1 11.61 10.1 10.97 9.7L1 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ContactInfoBlock({ title, description, cards }: ContactInfoBlockProps) {
  if (!cards || cards.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="container py-8 md:py-10 lg:py-[60px]">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-[2rem] font-semibold text-dark-blue leading-[1.25] mb-3.5">
            {title}
          </h2>
          {description && (
            <p className="text-base text-low-dark-blue leading-[1.154]">
              {description}
            </p>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`bg-white border border-[#e0e0e0] rounded-xl p-6 flex flex-col gap-4 ${
                index === cards.length - 1 && cards.length === 3 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Título com ícone */}
              <div className={`flex items-start ${card.icon === 'shield' ? 'gap-4' : 'gap-2'}`}>
                <CardIcon type={card.icon} />
                <h3 className="text-xl font-semibold text-dark-blue leading-tight">
                  {card.title}
                </h3>
              </div>

              {/* Conteúdo do card */}
              <div className="flex flex-col gap-4 text-base text-[#525252]">
                {card.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneSmallIcon />
                    <span className="leading-[1.5]">{card.phone}</span>
                  </div>
                )}

                {card.company_name && (
                  <p className="font-semibold leading-[1.5]">{card.company_name}</p>
                )}

                {card.email && (
                  <div className="flex items-center gap-2">
                    <EmailSmallIcon />
                    <a href={`mailto:${card.email}`} className="underline decoration-solid leading-[1.5]">
                      {card.email}
                    </a>
                  </div>
                )}

                {card.link && card.link.url && (
                  <div className="flex items-center gap-2">
                    <EmailSmallIcon />
                    <a
                      href={card.link.url}
                      target={card.link.target || '_self'}
                      className="font-semibold underline decoration-solid leading-[1.5]"
                    >
                      {card.link.title || 'Saiba mais'}
                    </a>
                  </div>
                )}

                {card.description && (
                  <p className="leading-[1.5]">{card.description}</p>
                )}

                {card.hours && (
                  <p className="leading-[1.5] whitespace-pre-line">{card.hours}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

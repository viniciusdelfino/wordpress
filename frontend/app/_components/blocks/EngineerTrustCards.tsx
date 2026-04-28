import Image from 'next/image';

interface TrustCard {
  icon_tcards: { url: string; alt?: string };
  title_tcards: string;
  description_tcards: string;
}

interface EngineerTrustCardsProps {
  main_title_tcards: string;
  main_description_tcards?: string;
  cards_tcards: TrustCard[];
}

export default function EngineerTrustCards({ main_title_tcards, main_description_tcards, cards_tcards }: EngineerTrustCardsProps) {
  return (
    <section className="w-full bg-white py-10 md:py-[40px]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-3 mb-10">
          {main_title_tcards && (
            <h2 className="text-dark-blue font-semibold text-2xl md:text-[28px] lg:text-[32px] leading-tight">
              {main_title_tcards}
            </h2>
          )}
          {main_description_tcards && (
            <p className="text-low-dark-blue text-sm md:text-base lg:text-lg leading-relaxed">
              {main_description_tcards}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-4 lg:gap-5">
          {Array.isArray(cards_tcards) && cards_tcards.map((card, index) => (
            <div
              key={index}
              className="relative flex-1 justify-end min-w-[250px] lg:min-w-0 min-h-[276px] flex flex-col rounded-lg bg-[#D2D5DA] overflow-hidden"
              style={
                card.icon_tcards?.url
                  ? {
                    backgroundImage: `url(${card.icon_tcards.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                  : undefined
              }
            >
            <Image
                src="/images/gradient-blue-01.png"
                alt=""
                fill
                className="object-cover"
              />

              <div className="relative z-10 flex flex-col gap-2 p-4">
                <p className="text-white text-lg md:text-xl leading-7">
                  {card.title_tcards}
                </p>
                <p className="text-white text-sm leading-5 md:leading-6">
                  {card.description_tcards}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

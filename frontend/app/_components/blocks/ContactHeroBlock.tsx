import Image from 'next/image';

interface ContactHeroBlockProps {
  hero_image?: {
    url: string;
    alt?: string;
  };
  hero_image_mobile?: {
    url: string;
    alt?: string;
  };
}

export default function ContactHeroBlock({ hero_image, hero_image_mobile }: ContactHeroBlockProps) {
  return (
    <section className="relative w-full bg-dark-blue overflow-hidden h-[200px] md:h-[260px]">
      {/* Padrão tech/digital como fallback */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-dark-blue via-[#0a1e5c] to-dark-blue opacity-80" />
      <div
        className="absolute inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%)',
          backgroundSize: '80px 80px',
        }}
      />
      {hero_image_mobile && (
        <Image
          src={hero_image_mobile.url}
          alt={hero_image_mobile.alt || 'Banner contato'}
          fill
          className="object-cover lg:hidden z-[1]"
          priority
        />
      )}
      {hero_image && (
        <Image
          src={hero_image.url}
          alt={hero_image.alt || 'Banner contato'}
          fill
          className="object-cover hidden lg:block z-[1]"
          priority
        />
      )}
    </section>
  );
}

import Image from 'next/image';

interface EngineerMediaHeroProps {
  media_type_mediahero?: 'image' | 'video';
  image_mediahero?: { url: string; alt?: string };
  video_url_mediahero?: string;
}

export default function EngineerMediaHero({ media_type_mediahero = 'image', image_mediahero, video_url_mediahero }: EngineerMediaHeroProps) {
  const isVideo = media_type_mediahero === 'video' && video_url_mediahero;

  return (
    <section className="relative w-full h-[260px] md:h-[380px] lg:h-[500px] overflow-hidden bg-dark-blue">
      {isVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={video_url_mediahero} />
        </video>
      ) : image_mediahero?.url ? (
        <Image
          src={image_mediahero.url}
          alt={image_mediahero.alt || ''}
          fill
          unoptimized
          className="object-cover"
          priority
        />
      ) : null}
    </section>
  );
}

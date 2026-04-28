import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { wordpressAPI } from "@/app/lib/wordpress-api";
import Breadcrumb from "@/app/_components/ui/Breadcrumb/Breadcrumb";
import Image from "next/image";
import Link from "next/link";

interface EventoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: EventoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const events = await wordpressAPI.getEvents();
  const event = events.find((e: any) => e.slug === slug);

  if (!event) return { title: "Evento | Mobil" };

  return {
    title: `${event.title} | Eventos Mobil`,
    description: event.acf_fields?.desc || "Evento Mobil.",
  };
}

export default async function EventoPage({ params }: EventoPageProps) {
  const { slug } = await params;
  const events = await wordpressAPI.getEvents();
  const event = events.find((e: any) => e.slug === slug);

  if (!event) notFound();

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: "Eventos", href: "/blog/eventos" },
          { label: event.title },
        ]}
      />

      <article className="container py-10 md:py-12 lg:py-16 max-w-4xl">
        {event.featured_image && (
          <div className="relative w-full h-[320px] md:h-[480px] rounded-[4px] overflow-hidden mb-8">
            <Image
              src={event.featured_image}
              alt={event.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        )}

        <h1 className="text-[24px] md:text-[32px] font-semibold text-dark-blue mb-4">
          {event.title}
        </h1>

        {event.acf_fields?.date && (
          <p className="text-[14px] text-dark-blue flex items-center gap-[7px] mb-2">
            <Image src="/icons/calendar.svg" alt="" width={16} height={16} />
            <span>{event.acf_fields.date}</span>
          </p>
        )}

        {event.acf_fields?.address && (
          <p className="text-[14px] text-gray-medium-2 mb-6">
            {event.acf_fields.address}
          </p>
        )}

        {event.acf_fields?.desc && (
          <div
            className="prose prose-lg max-w-none prose-p:text-low-dark-blue"
            dangerouslySetInnerHTML={{ __html: event.acf_fields.desc }}
          />
        )}

        {event.acf_fields?.external_link && (
          <div className="mt-8">
            <a
              href={event.acf_fields.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-dark-blue text-white font-semibold rounded-[4px] hover:opacity-90 transition-opacity"
            >
              {event.acf_fields.button === "replay"
                ? "Assista ao Replay"
                : "Fazer Inscrição"}
            </a>
          </div>
        )}

        <div className="mt-10">
          <Link
            href="/blog/eventos"
            className="text-[14px] font-semibold text-dark-blue hover:underline"
          >
            ← Voltar para Eventos
          </Link>
        </div>
      </article>
    </>
  );
}

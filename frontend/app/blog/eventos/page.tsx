import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { wordpressAPI } from "@/app/lib/wordpress-api";
import BlockRenderer from "@/app/_components/BlockRenderer";
import Breadcrumb from "@/app/_components/ui/Breadcrumb/Breadcrumb";
import EventsHero from "./_components/EventsHero";
import type { MobilEvent } from "@/app/_components/features/MobilEvents/MobilEvents";

const HERO_BLOCK_TYPES = new Set(["hero", "sec_hero", "third_hero", "event_hero"]);

export async function generateMetadata(): Promise<Metadata> {
  const page = await wordpressAPI.getPage("eventos").catch(() => null);

  return {
    title: page?.seo?.title || page?.title || "Eventos | Mobil",
    description:
      page?.seo?.description || "Confira os eventos e ativações da Mobil.",
  };
}

export default async function EventosPage() {
  const [page, rawEvents] = await Promise.all([
    wordpressAPI.getPage("eventos").catch(() => null),
    wordpressAPI.getEvents(),
  ]);

  const events: MobilEvent[] = Array.isArray(rawEvents) ? rawEvents : [];

  if (!events.length && !page) {
    notFound();
  }

  // Split admin-configured blocks: hero types go above breadcrumb, rest below hero
  const blocks: unknown[] =
    (page as any)?.blocks || (page as any)?.acf?.blocks || [];
  const firstBlock = blocks[0] || null;
  const firstBlockType =
    (firstBlock as any)?.type || (firstBlock as any)?.acf_fc_layout;
  const hasTopHeroBlock =
    firstBlock && HERO_BLOCK_TYPES.has(firstBlockType as string);

  const topBlocks = hasTopHeroBlock ? [firstBlock] : [];
  const remainingBlocks = hasTopHeroBlock ? blocks.slice(1) : blocks;

  // 3 most recent events — passed to EventsHero (standalone or via BlockRenderer)
  const featuredEvents = events.slice(0, 3);

  // If admin configured event_hero in WP, BlockRenderer handles it; avoid double render
  const hasEventHeroBlock = blocks.some(
    (b) => ((b as any)?.type || (b as any)?.acf_fc_layout) === "event_hero",
  );

  return (
    <>
      {topBlocks.length > 0 && (
        <BlockRenderer blocks={topBlocks as any[]} events={featuredEvents} />
      )}

      {!hasEventHeroBlock && <EventsHero events={featuredEvents} />}

      {remainingBlocks.length > 0 && (
        <BlockRenderer blocks={remainingBlocks as any[]} events={featuredEvents} />
      )}
    </>
  );
}

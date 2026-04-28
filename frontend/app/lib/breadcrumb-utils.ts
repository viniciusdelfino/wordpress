/**
 * Shared breadcrumb utilities for hero block extraction and slug labeling.
 */

export const HERO_BLOCK_TYPES = new Set([
  "hero",
  "sec_hero",
  "third_hero",
  "lp_hero",
  "eng_media_hero",
  "contact_hero",
  "calculator_hero",
  "troca_hero",
  "partners_hero",
  "hero_distribuidores",
]);

export function extractHeroBlocks(blocks: any[]): {
  heroBlocks: any[];
  remainingBlocks: any[];
} {
  if (!blocks || blocks.length === 0) {
    return { heroBlocks: [], remainingBlocks: [] };
  }

  const firstBlock = blocks[0];
  const firstBlockType = firstBlock?.type || firstBlock?.acf_fc_layout;
  const isHero = firstBlock && HERO_BLOCK_TYPES.has(firstBlockType);

  return {
    heroBlocks: isHero ? [firstBlock] : [],
    remainingBlocks: isHero ? blocks.slice(1) : blocks,
  };
}

export const SLUG_LABELS: Record<string, string> = {
  carros: "Carros",
  motos: "Motos",
  caminhoes: "Caminhões",
  agricola: "Agrícola",
  industrial: "Industrial",
  "onde-comprar": "Onde Comprar",
  contato: "Contato",
  sobre: "Sobre",
  produtos: "Produtos",
  "encontre-seu-oleo": "Encontre seu Óleo",
  parceiros: "Parceiros",
  faq: "FAQ",
  industria: "Indústria",
  busca: "Busca",
  engineersolutions: "Engineer Solutions",
  blog: "Blog",
  conteudos: "Conteúdos",
};

export function formatSlugLabel(slug: string): string {
  return (
    SLUG_LABELS[slug] ||
    slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

export function getReadableTitle(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    if (typeof value.rendered === "string")
      return value.rendered.replace(/<[^>]+>/g, "").trim();
    if (typeof value.title === "string") return value.title.trim();
  }
  return "";
}

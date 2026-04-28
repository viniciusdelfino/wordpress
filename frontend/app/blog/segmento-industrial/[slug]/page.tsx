import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { wordpressAPI } from "@/app/lib/wordpress-api";
import BlockRenderer from "@/app/_components/BlockRenderer";
import Breadcrumb from "@/app/_components/ui/Breadcrumb/Breadcrumb";
import IndustryBlockRenderer from "@/app/industry/[slug]/IndustryBlockRenderer";
import {
  DEFAULT_SEC_HERO,
  DEFAULT_KNOW_OUR_TOOLS,
  DEFAULT_INFO_CARDS,
} from "@/app/industry/[slug]/constants";

interface IndustrialSegmentPageProps {
  params: Promise<{ slug: string }>;
}

const DEFAULT_NEWSLETTER = {
  bg_image: {
    url: "/images/newsletter-bg.jpg",
    alt: "Newsletter Mobil",
  },
  desc: "<h2>Receba conteúdos técnicos no seu e-mail</h2><p>Cadastre-se para receber novidades, guias e dicas da Mobil.</p>",
  form: "[contact-form-7 id=\"1\" title=\"Newsletter\"]",
};

const DEFAULT_RELATED_PRODUCTS = {
  acf_fc_layout: "related_products",
  type: "related_products",
  use_industries_segment_term_products: true,
  use_current_industries_segment_term: true,
};

const DEFAULT_POSTS_GRID = {
  acf_fc_layout: "posts_grid",
  type: "posts_grid",
  filter_strategy: "industrial_segment",
  use_filter_layout: false,
};

const DEFAULT_FIND_OIL_BANNER = {
  bg_image: {
    url: "/images/navio-2-3.jpg",
    alt: "Conheça toda a linha Mobil",
    width: 1440,
    height: 269,
  },
  desc: "<h2>Conheça toda a linha Mobil</h2><p>Soluções completas para aumentar a performance e proteger seus equipamentos.</p>",
  button: { title: "Ver linha completa", url: "/produtos", target: "_self" },
  banner_high: true,
  banner_width: true,
};

export async function generateMetadata({ params }: IndustrialSegmentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const term = await wordpressAPI.getTermBySlugAndTaxonomy("segmento_industrial", slug);

  if (!term) {
    return { title: "Blog" };
  }

  return {
    title: term?.name || "Blog",
    description: term?.description || "Conteudos relacionados a esta categoria.",
  };
}

export default async function IndustrialSegmentPage({ params }: IndustrialSegmentPageProps) {
  const { slug } = await params;

  const term = await wordpressAPI.getTermBySlugAndTaxonomy("segmento_industrial", slug);

  if (!term) {
    notFound();
  }

  const posts = await wordpressAPI.getPostsByTaxonomyTerm(
    "segmento_industrial",
    Number(term.id),
  );

  const currentTermId = Number(term?.id || term?.term_id || 0);
  const categorizedProducts = currentTermId > 0
    ? await wordpressAPI.getProductsByIndustriesSegmentTerm([currentTermId])
    : [];

  const rawBlocks: any[] = term?.acf?.blocks || [];

  const getBlock = (layoutName: string) =>
    rawBlocks.find((b: any) => (b?.type || b?.acf_fc_layout) === layoutName) ?? null;

  const heroSlot = getBlock("sec_hero");
  const postsGridSlot = getBlock("posts_grid");
  const newsletterSlot = getBlock("newsletter");
  const toolsSlot = getBlock("know_our_tools");
  const relatedProductsSlot = getBlock("related_products");
  const findOilBannerSlot = getBlock("find_oil_banner");
  const cardsSlot = getBlock("info_cards_four");

  const postsGridBlock = {
    ...DEFAULT_POSTS_GRID,
    ...postsGridSlot,
    title: postsGridSlot?.title || term?.name || "Conteúdos",
    description: postsGridSlot?.description || postsGridSlot?.desc || term?.description || "",
    desc: postsGridSlot?.desc || postsGridSlot?.description || term?.description || "",
    filter_strategy: postsGridSlot?.filter_strategy || "industrial_segment",
    use_filter_layout: postsGridSlot?.use_filter_layout ?? false,
  };

  const newsletterBlock = newsletterSlot ?? {
    acf_fc_layout: "newsletter",
    type: "newsletter",
    ...DEFAULT_NEWSLETTER,
  };

  const relatedProductsBlock = {
    ...DEFAULT_RELATED_PRODUCTS,
    ...relatedProductsSlot,
    title: relatedProductsSlot?.title || term?.name || "Produtos recomendados",
    desc:
      relatedProductsSlot?.desc ||
      relatedProductsSlot?.description ||
      term?.description ||
      "",
    use_industries_segment_term_products:
      relatedProductsSlot?.use_industries_segment_term_products ?? true,
    use_current_industries_segment_term:
      relatedProductsSlot?.use_current_industries_segment_term ?? true,
  };

  const findOilBannerBlock = findOilBannerSlot ?? {
    acf_fc_layout: "find_oil_banner",
    type: "find_oil_banner",
    ...DEFAULT_FIND_OIL_BANNER,
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: term?.name || "Categoria" },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      {/* Slot: Hero */}
      <IndustryBlockRenderer
        block={heroSlot ?? { acf_fc_layout: "sec_hero", ...DEFAULT_SEC_HERO }}
      />

      {/* Slot: Posts Grid */}
      <BlockRenderer
        blocks={[postsGridBlock]}
        dynamicPosts={posts}
        editorialFilterStrategy="industrial_segment"
        currentIndustrialSegmentTerm={term}
      />

      {/* Slot: Newsletter */}
      <BlockRenderer
        blocks={[newsletterBlock]}
      />

      {/* Slot: Conheça nossas ferramentas */}
      <IndustryBlockRenderer
        block={toolsSlot ?? { acf_fc_layout: "know_our_tools", ...DEFAULT_KNOW_OUR_TOOLS }}
      />

      {/* Slot: Produtos categorizados no segmento industrial atual */}
      <BlockRenderer
        blocks={[relatedProductsBlock]}
        currentIndustrialSegmentTerm={term}
        dynamicProducts={categorizedProducts}
      />

      {/* Slot: Find Oil Banner */}
      <BlockRenderer
        blocks={[findOilBannerBlock]}
      />

      {/* Slot: Cards informativos */}
      <IndustryBlockRenderer
        block={cardsSlot ?? { acf_fc_layout: "info_cards_four", card: DEFAULT_INFO_CARDS }}
      />
    </>
  );
}

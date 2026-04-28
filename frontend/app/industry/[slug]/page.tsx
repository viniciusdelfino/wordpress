import { wordpressAPI } from "@/app/lib/wordpress-api";
import Breadcrumb from "@/app/_components/ui/Breadcrumb/Breadcrumb";
import ProductDetail from "@/app/_components/products/ProductDetail";
import ProductBlockRenderer from "@/app/_components/products/ProductBlockRenderer";
import IndustryBlockRenderer from "./IndustryBlockRenderer";
import {
  DEFAULT_SEC_HERO,
  DEFAULT_TWO_BANNER,
  DEFAULT_KNOW_OUR_TOOLS,
  DEFAULT_CONTENTS,
  DEFAULT_INFO_CARDS,
} from "./constants";
import { getReadableTitle, formatSlugLabel } from "@/app/lib/breadcrumb-utils";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getIndustryData(slug: string) {
  const base = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base}/moove/v1/industry/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function IndustryPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const sParams = await searchParams;

  // 1) Tenta resolver como PDP — produto acessado via /industria/[produto-slug]
  const product = await wordpressAPI.getProductBySlug(slug);
  if (product) {
    const pdpBlocks: any[] = product?.acf?.pdp_blocks ?? [];
    const productName =
      product.B2BProductName__c || getReadableTitle(product.title) || slug;
    return (
      <>
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Indústria", href: "/industria" },
            { label: productName },
          ]}
        />
        <ProductDetail product={product} />
        <ProductBlockRenderer product={product} pdpBlocks={pdpBlocks} />
      </>
    );
  }

  const data = await getIndustryData(slug);

  let blocks: any[] = Array.isArray(data?.blocks) && data.blocks.length > 0 ? data.blocks : [];
  if (blocks.length === 0 && data?.acf && typeof data.acf === "object") {
    for (const val of Object.values(data.acf)) {
      if (Array.isArray(val) && val.length > 0 && (val[0] as any)?.acf_fc_layout) {
        blocks = val as any[];
        break;
      }
    }
  }

  const getBlock = (layoutName: string) =>
    blocks.find((b: any) => b.acf_fc_layout === layoutName) ?? null;

  const heroSlot    = getBlock("sec_hero");
  const gridSlot    = getBlock("product_grid");
  const bannersSlot = getBlock("two_banners_caminhoes");
  const toolsSlot   = getBlock("know_our_tools");
  const postsSlot   = getBlock("recent_posts");
  const cardsSlot   = getBlock("info_cards_four");

  const industryName =
    getReadableTitle(data?.title) ||
    getReadableTitle(data?.name) ||
    formatSlugLabel(slug);

  const [productsData, filtersData] = await Promise.all([
    wordpressAPI.getProductsBySegment("industria", { ...sParams, aplicacao: slug }),
    wordpressAPI.getFiltersBySegment("industria", sParams),
  ]);

  const salesforceData = {
    products: productsData?.products || [],
    pagination: productsData?.pagination || {},
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Indústria", href: "/industria" },
          { label: industryName },
        ]}
      />

      {/* Slot: Hero */}
      <IndustryBlockRenderer
        block={heroSlot ?? { acf_fc_layout: "sec_hero", ...DEFAULT_SEC_HERO }}
      />

      {/* Slot: Grade de produtos */}
      <IndustryBlockRenderer
        block={gridSlot ?? { acf_fc_layout: "product_grid" }}
        salesforceData={salesforceData}
        filters={filtersData}
        segmentSlug="industria"
        segmentName={industryName}
        industryName={industryName}
      />

      {/* Slot: Dois banners */}
      <IndustryBlockRenderer
        block={bannersSlot ?? { acf_fc_layout: "two_banners_caminhoes", ...DEFAULT_TWO_BANNER }}
      />

      {/* Slot: Conheça nossas ferramentas */}
      <IndustryBlockRenderer
        block={toolsSlot ?? { acf_fc_layout: "know_our_tools", ...DEFAULT_KNOW_OUR_TOOLS }}
      />

      {/* Slot: Conteúdos / Posts — fallback hardcoded; ACF substitui quando existir */}
      <IndustryBlockRenderer
        block={postsSlot ?? { acf_fc_layout: "recent_posts", ...DEFAULT_CONTENTS }}
      />

      {/* Slot: Cards informativos */}
      <IndustryBlockRenderer
        block={cardsSlot ?? { acf_fc_layout: "info_cards_four", card: DEFAULT_INFO_CARDS }}
      />
    </>
  );
}

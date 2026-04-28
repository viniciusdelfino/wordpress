import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/app/_components/products/ProductDetail";
import ProductBlockRenderer from "@/app/_components/products/ProductBlockRenderer";
import Breadcrumb from "@/app/_components/ui/Breadcrumb/Breadcrumb";
import { wordpressAPI } from "@/app/lib/wordpress-api";
import { generateProductMetadata } from "@/app/product/product-metadata";
import { formatSlugLabel, getReadableTitle } from "@/app/lib/breadcrumb-utils";
import ApplicationBlockRenderer from "./ApplicationBlockRenderer";
import {
  DEFAULT_SEC_HERO,
  DEFAULT_TWO_BANNER,
  DEFAULT_CONTENTS,
  DEFAULT_INFO_CARDS,
} from "./constants";

interface Props {
  params: Promise<{ slug: string; product: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: segmentSlug, product: productSlug } = await params;

  const product = await wordpressAPI.getProductBySlug(productSlug);
  if (product) {
    return generateProductMetadata(productSlug);
  }

  const [segment, applicationPageFromEndpoint, applicationPageBySegment, applicationPageBySlug, filtersData] =
    await Promise.all([
      wordpressAPI.getProductSegmentsBySlug(segmentSlug),
      wordpressAPI.getApplicationPage(segmentSlug, productSlug),
      wordpressAPI.getPage(`${segmentSlug}-${productSlug}`),
      wordpressAPI.getPage(productSlug),
      wordpressAPI.getFiltersBySegment(segmentSlug),
    ]);

  const applicationPage = applicationPageFromEndpoint || applicationPageBySegment || applicationPageBySlug;
  const applicationPageAny = applicationPage as any;

  const segmentTitle =
    getReadableTitle(segment?.name) || getReadableTitle(segment?.title);

  const applicationTitleFromPage =
    getReadableTitle(applicationPageAny?.title) ||
    getReadableTitle(applicationPageAny?.acf_fields?.title);

  const applicationTitleFromFilter =
    filtersData?.aplicacao?.find?.((item: any) => item?.value === productSlug)
      ?.label || "";

  const applicationTitle = applicationTitleFromPage || applicationTitleFromFilter;

  return {
    title: applicationTitle && segmentTitle
      ? `${applicationTitle} - ${segmentTitle} | Moove`
      : applicationTitle
        ? `${applicationTitle} | Moove`
        : segmentTitle
          ? `Aplicações - ${segmentTitle} | Moove`
          : "Moove",
  };
}

export default async function CategoryProductPage({ params }: Props) {
  const { slug: segmentSlug, product: productSlug } = await params;

  const hasProducts = (payload: any) =>
    Array.isArray(payload?.products) && payload.products.length > 0;

  // 1) Primeiro tenta resolver como página de detalhe de produto
  const product = await wordpressAPI.getProductBySlug(productSlug);
  if (product) {
    const pdpBlocks: any[] = product?.acf?.pdp_blocks ?? [];
    const segmentName = formatSlugLabel(segmentSlug);
    const productName = product.B2BProductName__c || getReadableTitle(product.title) || productSlug;

    return (
      <>
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: segmentName, href: `/${segmentSlug}` },
            { label: productName },
          ]}
        />
        <ProductDetail product={product} />
        <ProductBlockRenderer product={product} pdpBlocks={pdpBlocks} />
      </>
    );
  }

  // 2) Se não for produto, trata como página de aplicação (ex.: /motos/graxas)
  const segment = await wordpressAPI.getProductSegmentsBySlug(segmentSlug);
  if (!segment) {
    return notFound();
  }

  const [applicationPageFromEndpoint, applicationPageBySegment, applicationPageBySlug, productsData, filtersData] =
    await Promise.all([
      wordpressAPI.getApplicationPage(segmentSlug, productSlug),
      wordpressAPI.getPage(`${segmentSlug}-${productSlug}`),
      wordpressAPI.getPage(productSlug),
      wordpressAPI.getProductsBySegment(segmentSlug, {
        aplicacao: productSlug,
      }),
      wordpressAPI.getFiltersBySegment(segmentSlug, {
        aplicacao: productSlug,
      }),
    ]);

  const applicationPage = applicationPageFromEndpoint || applicationPageBySegment || applicationPageBySlug;
  const applicationPageAny = applicationPage as any;

  // Extrai blocos ACF da página de aplicação (se existir)
  let pageBlocks: any[] = applicationPageAny?.blocks || applicationPageAny?.acf?.blocks || [];
  if (pageBlocks.length === 0 && applicationPageAny?.acf && typeof applicationPageAny.acf === "object") {
    for (const val of Object.values(applicationPageAny.acf)) {
      if (Array.isArray(val) && val.length > 0 && (val[0] as any)?.acf_fc_layout) {
        pageBlocks = val as any[];
        break;
      }
    }
  }

  const getBlock = (layoutName: string) =>
    pageBlocks.find((b: any) => b.acf_fc_layout === layoutName) ?? null;

  const heroSlot    = getBlock("sec_hero");
  const gridSlot    = getBlock("product_grid");
  const bannersSlot = getBlock("two_banners_carros") ?? getBlock("two_banners_caminhoes");
  const postsSlot   = getBlock("recent_posts");
  const cardsSlot   = getBlock("info_cards_four");

  let resolvedProductsData = productsData;
  let resolvedFiltersData = filtersData;

  if (!hasProducts(productsData)) {
    const [fallbackProductsData, fallbackFiltersData] = await Promise.all([
      wordpressAPI.getProductsBySegment(segmentSlug, {}),
      wordpressAPI.getFiltersBySegment(segmentSlug),
    ]);
    resolvedProductsData = fallbackProductsData;
    resolvedFiltersData = fallbackFiltersData;
  }

  const salesforceData = {
    products: resolvedProductsData?.products || [],
    pagination: resolvedProductsData?.pagination || {},
  };

  const segmentName = getReadableTitle(segment?.name) || formatSlugLabel(segmentSlug);
  const applicationName =
    getReadableTitle(applicationPageAny?.title) || formatSlugLabel(productSlug);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: segmentName, href: `/${segmentSlug}` },
          { label: applicationName },
        ]}
      />

      {/* Slot: Hero */}
      <ApplicationBlockRenderer
        block={heroSlot ?? { acf_fc_layout: "sec_hero", ...DEFAULT_SEC_HERO }}
      />

      {/* Slot: Grade de produtos */}
      <ApplicationBlockRenderer
        block={gridSlot ?? { acf_fc_layout: "product_grid" }}
        salesforceData={salesforceData}
        filters={resolvedFiltersData}
        segmentSlug={segmentSlug}
        segmentName={segmentName}
        applicationName={applicationName}
      />

      {/* Slot: Dois banners */}
      <ApplicationBlockRenderer
        block={bannersSlot ?? { acf_fc_layout: "two_banners_carros", ...DEFAULT_TWO_BANNER }}
      />

      {/* Slot: Conteúdos / Posts */}
      <ApplicationBlockRenderer
        block={postsSlot ?? { acf_fc_layout: "recent_posts", ...DEFAULT_CONTENTS }}
      />

      {/* Slot: Cards informativos */}
      <ApplicationBlockRenderer
        block={cardsSlot ?? { acf_fc_layout: "info_cards_four", card: DEFAULT_INFO_CARDS }}
      />
    </>
  );
}

import React from "react";
import NotFound from "../not-found";
import { PageProps } from "../types/salesforce-types";
import { getPageData } from "./utils/page-data-fetcher";
import { PageRenderer } from "../_components/pages/PageRenderer";
import { SegmentRenderer } from "../_components/pages/SegmentRenderer";
import { SalesforceDirectRenderer } from "../_components/pages/SalesforceDirectRenderer";
import BlockRenderer from "../_components/BlockRenderer";
import Breadcrumb from "@/app/_components/ui/Breadcrumb/Breadcrumb";
import { extractHeroBlocks, formatSlugLabel, getReadableTitle } from "@/app/lib/breadcrumb-utils";
import { salesforceClient } from "../lib/salesforce-client";
import { wordpressAPI } from "../lib/wordpress-api";

interface DynamicPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DynamicPage({ params, searchParams }: DynamicPageProps) {
  const { slug } = await params;
  const searchParamsValue = await searchParams;

  const hasProducts = (payload: any) =>
    Array.isArray(payload?.products) && payload.products.length > 0;

  let result = await getPageData(slug);
  let filters = null;

  if (result.type === "segment") {
    const currentSfData = result.salesforceData as any;
    if (!currentSfData || !currentSfData.products || currentSfData.products.length === 0) {
      try {
        const sfData = await salesforceClient.getProductsByCategory(slug);

        result = {
          ...result,
          salesforceData: {
            ...sfData,
            total_grouped: sfData.pagination?.total || 0
          }
        };
      } catch (error) {
        console.error(`[DynamicPage] Erro ao buscar produtos para ${slug}:`, error);
      }
    }

    const filteredData = await wordpressAPI.getProductsBySegment(slug, searchParamsValue);
    if (filteredData && hasProducts(filteredData)) {
      result.salesforceData = filteredData;
    }

    // Busca os filtros disponíveis para este segmento (Viscosidade, Tecnologia, Aplicação)
    filters = await wordpressAPI.getFiltersBySegment(slug, searchParamsValue);
  }

  if (result.type === "not-found") {
    return <NotFound />;
  }

  if (result.type === "page" || result.type === "page-with-salesforce") {
    const blocks = result.data.blocks || result.data.acf?.blocks || [];
    const { heroBlocks, remainingBlocks } = extractHeroBlocks(blocks);
    const pageTitle = getReadableTitle(result.data.title) || formatSlugLabel(slug);
    const modifiedPage = { ...result.data, blocks: remainingBlocks };

    return (
      <>
        {heroBlocks.length > 0 && <BlockRenderer blocks={heroBlocks} />}
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: pageTitle },
          ]}
        />
        <PageRenderer page={modifiedPage} salesforceData={result.salesforceData} />
      </>
    );
  }

  if (result.type === "segment") {
    const blocks = result.data.blocks || [];
    const { heroBlocks, remainingBlocks } = extractHeroBlocks(blocks);
    const segmentName = result.data.name || formatSlugLabel(slug);
    const modifiedSegment = { ...result.data, blocks: remainingBlocks };
    const excludeBreadcrumb = ["super-moto"]

    return (
      <>
        {heroBlocks.length > 0 && (
          <BlockRenderer
            blocks={heroBlocks}
            salesforceData={result.salesforceData}
            segmentName={segmentName}
            segmentSlug={result.data.slug}
            filters={filters}
          />
        )}
        {!excludeBreadcrumb.includes(slug) && (
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: segmentName },
            ]}
          />
        )}
        <SegmentRenderer
          segment={modifiedSegment}
          salesforceData={result.salesforceData}
          filters={filters}
        />
      </>
    );
  }

  if (result.type === "salesforce-direct") {
    return (
      <>
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Produtos", href: "/produtos" },
            { label: result.data.category?.name || formatSlugLabel(slug) },
          ]}
        />
        <SalesforceDirectRenderer
          category={result.data.category}
          products={result.data.products}
        />
      </>
    );
  }

  return <NotFound />;
}

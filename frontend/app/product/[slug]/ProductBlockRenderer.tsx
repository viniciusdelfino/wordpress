import FindOilBanner from "@/app/_components/blocks/FindOilBanner";
import ComparativeTable from "@/app/_components/features/ComparativeTable/ComparativeTable";
import RelatedProducts from "@/app/_components/features/RelatedProducts/RelatedProducts";
import InfoCardsFour from "@/app/_components/blocks/InfoCardsFour";
import Contents from "@/app/_components/blocks/Contents";
import FindOilBannerFallback from "../_components/FindOilBannerFallback";
import InfoCardsFourFallback from "../_components/InfoCardsFourFallback";
import ContentsFallback from "../_components/ContentsFallback";

interface Props {
  product: any;
  pdpBlocks: any[];
}

export default function ProductBlockRenderer({ product, pdpBlocks }: Props) {
  const acfFindOil     = pdpBlocks.find((b) => b?.acf_fc_layout === "find_oil_banner");
  const acfComparative = pdpBlocks.find((b) => b?.acf_fc_layout === "comparative_table");
  const acfRelated     = pdpBlocks.find((b) => b?.acf_fc_layout === "related_products");
  const acfInfoCards   = pdpBlocks.find((b) => b?.acf_fc_layout === "info_cards_four");
  const acfContents    = pdpBlocks.find((b) => b?.acf_fc_layout === "recent_posts");

  const fallbackRelatedProducts: any[] = product?.related_products ?? [];

  return (
    <>
      {acfFindOil
        ? <FindOilBanner {...acfFindOil} />
        : <FindOilBannerFallback />}

      {acfComparative && <ComparativeTable {...acfComparative} />}

      {acfRelated
        ? <RelatedProducts {...acfRelated} />
        : fallbackRelatedProducts.length > 0 && (
            <RelatedProducts products={fallbackRelatedProducts} />
          )}

      {acfInfoCards
        ? <InfoCardsFour {...acfInfoCards} />
        : <InfoCardsFourFallback />}

      {acfContents
        ? <Contents {...acfContents} />
        : <ContentsFallback />}
    </>
  );
}

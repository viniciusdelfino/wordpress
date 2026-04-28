import SecondaryHero from "@/app/_components/layout/SecondaryHero/SecondaryHero";
import SegmentProductList from "@/app/_components/products/SegmentProductList";
import TwoBannerCarros from "@/app/_components/blocks/TwoBannerCarros";
import Contents from "@/app/_components/blocks/Contents";
import InfoCardsFour from "@/app/_components/blocks/InfoCardsFour";
import { DEFAULT_INFO_CARDS } from "./constants";

interface Props {
  block: any;
  salesforceData?: { products: any[]; pagination: any };
  filters?: any;
  segmentSlug?: string;
  segmentName?: string;
  applicationName?: string;
}

export default function ApplicationBlockRenderer({
  block,
  salesforceData,
  filters,
  segmentSlug = "",
  segmentName = "",
  applicationName,
}: Props) {
  const blockType: string = block?.acf_fc_layout ?? block?.type ?? "";

  if (blockType === "sec_hero") {
    return <SecondaryHero {...block} />;
  }

  if (blockType === "product_grid") {
    return (
      <SegmentProductList
        {...block}
        products={salesforceData?.products ?? []}
        pagination={salesforceData?.pagination ?? {}}
        filters={filters}
        segmentSlug={segmentSlug}
        segmentName={segmentName}
        sectionTitle={block.section_title || applicationName}
      />
    );
  }

  if (blockType === "two_banners_carros" || blockType === "two_banners_caminhoes") {
    return <TwoBannerCarros {...block} />;
  }

  if (blockType === "recent_posts") {
    return (
      <Contents
        {...block}
        buttonVariant={block.buttonVariant ?? "filled"}
        show_image={block.show_image ?? true}
        only_carrousel={true}
        hybrid_slide_class=""
      />
    );
  }

  if (blockType === "info_cards_four") {
    return (
      <InfoCardsFour
        card={
          Array.isArray(block?.card) && block.card.length > 0
            ? block.card
            : DEFAULT_INFO_CARDS
        }
      />
    );
  }

  return null;
}

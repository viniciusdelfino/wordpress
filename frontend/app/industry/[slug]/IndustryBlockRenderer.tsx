import SecondaryHero from "@/app/_components/layout/SecondaryHero/SecondaryHero";
import SegmentProductList from "@/app/_components/products/SegmentProductList";
import TwoBannerCaminhoes from "@/app/_components/blocks/TwoBannerCaminhoes";
import KnowOurTools from "@/app/_components/blocks/KnowOurTools";
import Contents from "@/app/_components/blocks/Contents";
import InfoCardsFour from "@/app/_components/blocks/InfoCardsFour";

interface Props {
  block: any;
  salesforceData?: { products: any[]; pagination: any };
  filters?: any;
  segmentSlug?: string;
  segmentName?: string;
  industryName?: string;
}

export default function IndustryBlockRenderer({
  block,
  salesforceData,
  filters,
  segmentSlug = "industria",
  segmentName = "industria",
  industryName,
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
        sectionTitle={block.section_title || industryName}
      />
    );
  }

  if (blockType === "two_banners_caminhoes") {
    return <TwoBannerCaminhoes {...block} />;
  }

  if (blockType === "know_our_tools") {
    return <KnowOurTools {...block} />;
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
    return <InfoCardsFour card={block.card} />;
  }

  return null;
}

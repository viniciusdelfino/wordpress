"use client";

import React from "react";
import { Block } from "@/app/types/settings";
import MainHero from "./layout/MainHero/MainHero";
import OurCategories from "./blocks/OurCategories";
import ImageDescriptiveList from "./blocks/ImageDescriptiveList";
import InfoCardsFour from "./blocks/InfoCardsFour";
import CarouselInfinityScroll from "./blocks/CarouselInfinityScroll";
import Innovation from "./blocks/Innovation";
import Contents from "./blocks/Contents";
import SecondaryHero from "./layout/SecondaryHero/SecondaryHero";
import FindOilBanner from "./blocks/FindOilBanner";
import HighlightedProducts from "./blocks/HighlightedProducts";
import SegmentProductList from "./products/SegmentProductList";
import NoProductsMessage from "./products/NoProductsMessage";
import ComparativeTable from "./features/ComparativeTable/ComparativeTable";
import RelatedProducts from "./features/RelatedProducts/RelatedProducts";
import FindOil from "./features/FindOil/FindOil";
import FastSearch from "./blocks/FastSearch";
import WhyChooseMobil from "./blocks/WhyChooseMobil";
import TwoBannerCarros from "./blocks/TwoBannerCarros";
import TwoBannerCaminhoes from "./blocks/TwoBannerCaminhoes";
import TrustSection from "./blocks/TrustSection";
import GlobalReference from "./blocks/GlobalReference";
import VideoSection from "./blocks/VideoSection";
import HistorySection from "./blocks/HistorySection";
import DistributionCards from "./blocks/DistributionCards";
import WhatWeDo from "./blocks/WhatWeDo";
import Error404Block from "./blocks/Error404Block";
import ContactHeroBlock from "./blocks/ContactHeroBlock";
import ContactFormBlock from "./blocks/ContactFormBlock";
import ContactInfoBlock from "./blocks/ContactInfoBlock";
import CalculatorHeroBlock from "./blocks/CalculatorHeroBlock";
import CalculatorListingBlock from "./blocks/CalculatorListingBlock";
import GearCalculator from "./blocks/calculators/GearCalculator";
import CompressorCalculator from "./blocks/calculators/CompressorCalculator";
import BearingsCalculator from "./blocks/calculators/BearingsCalculator";
import ElectricMotorCalculator from "./blocks/calculators/ElectricMotorCalculator";
import HydraulicsCalculator from "./blocks/calculators/HydraulicsCalculator";
import GasEngineCalculator from "./blocks/calculators/GasEngineCalculator";
import LPHero from "./blocks/LPHero";
import FeatureHighlight from "./blocks/FeatureHighlight";
import TechnologyList from "./blocks/TechnologyList";
import ExtremePerformance from "./blocks/ExtremePerformance";
import AuthoritySeal from "./blocks/AuthoritySeal";
import TabLayout from "./blocks/TabLayout";
import IdealOilCards from "./blocks/IdealOilCards";
import ContentBySegment from "./blocks/ContentBySegment";
import MobilMidia from "./blocks/MobilMidia";
import ThridHero from "./layout/ThirdHero/ThridHero";
import BrowseByTopic from "./blocks/BrowserByTopic";
import PartnersHero from "./blocks/PartnersHero";
import InfluencersSection from "./blocks/InfluencersSection";
import PartnershipCards from "./blocks/PartnershipCards";
import LogoGrid from "./blocks/LogoGrid";
import CtaBanner from "./blocks/CtaBanner";
import TwoBanner from "./blocks/TwoBanner";
import RaceCards from "./blocks/RaceCards";
import InfoCardsTwo from "./blocks/InfoCardsTwo";
import Breadcrumbs from "./blocks/Breadcrumbs";
import { StoreFinder } from "./features/StoreFinder";
import Newsletter from "./features/Newsletter/Newsletter";
import MobilEvents from "./features/MobilEvents/MobilEvents";
import KnowOurTools from "./blocks/KnowOurTools";
import IndustryList from "./features/IndustryList/IndustryList";
import OilHelper from "./blocks/OilHelper";
import NoResultsBlock from "./blocks/NoResultsBlock";
import { FindDistributor } from "./features/FindDistributor";
import DistribuidoresIntro from "./blocks/distribuidores/DistribuidoresIntro";
import DistribuidoresFinder from "./blocks/distribuidores/DistribuidoresFinder";
import PedeDiretoSection from "./blocks/distribuidores/PedeDiretoSection";
import {
  TrocaHero,
  TrocaProcessSteps,
  TrocaImpactNumbers,
  TrocaPillars,
  TrocaTechFeatures,
} from "./blocks/troca-inteligente";
import EngineerPortfolioTabs from "./blocks/EngineerPortfolioTabs";
import EngineerMediaHero from "./blocks/EngineerMediaHero";
import EngineerTrustCards from "./blocks/EngineerTrustCards";
import MobilYoutube from "./blocks/MobilYoutube";
import EditorialPostsShowcase from "./blocks/EditorialPostsShowcase/EditorialPostsShowcase";
import FeaturedPostsEditorial from "./blocks/EditorialPostsShowcase/FeaturedPostsEditorial";
import PostsGridEditorial from "./blocks/EditorialPostsShowcase/PostsGridEditorial";
import SchoolOfMechanics from "./blocks/SchoolOfMechanics";
import ProductSegmentCarousel from "./blocks/ProductSegmentCarousel";
import EventsHero from "../blog/eventos/_components/EventsHero";
import EventsGrid from "../blog/eventos/_components/EventsGrid";
import NoResultsBlog from "./blocks/NoResultsBlog";

// BLOCK REGISTER
const BLOCK_COMPONENTS: Record<string, React.ComponentType<any>> = {
  hero: MainHero,
  sec_hero: SecondaryHero,
  our_categories: OurCategories,
  content_split_list: ImageDescriptiveList,
  info_cards_four: InfoCardsFour,
  carousel_infinity: CarouselInfinityScroll,
  innovation: Innovation,
  recent_posts: Contents,
  find_oil_banner: FindOilBanner,
  highlighted_products: HighlightedProducts,
  product_grid: SegmentProductList,
  two_banners: TwoBanner,
  two_banners_carros: TwoBannerCarros,
  two_banners_caminhoes: TwoBannerCaminhoes,
  no_products: NoProductsMessage,
  comparative_table: ComparativeTable,
  related_products: RelatedProducts,
  trust_section: TrustSection,
  global_reference: GlobalReference,
  video_section: VideoSection,
  history_section: HistorySection,
  distribution_cards: DistributionCards,
  what_we_do: WhatWeDo,
  find_oil: FindOil,
  fast_search: FastSearch,
  why_choose_mobil: WhyChooseMobil,
  error_404: Error404Block,
  contact_hero: ContactHeroBlock,
  contact_form: ContactFormBlock,
  contact_info: ContactInfoBlock,
  calculator_hero: CalculatorHeroBlock,
  calculator_listing: CalculatorListingBlock,
  calculator_gears: GearCalculator,
  calculator_compressors: CompressorCalculator,
  calculator_bearings: BearingsCalculator,
  calculator_electric_motor: ElectricMotorCalculator,
  calculator_hydraulics: HydraulicsCalculator,
  calculator_gas_engine: GasEngineCalculator,
  lp_hero: LPHero,
  feature_highlight: FeatureHighlight,
  technology_list: TechnologyList,
  extreme_performance: ExtremePerformance,
  authority_seal: AuthoritySeal,
  tab_layout: TabLayout,
  ideal_oil_cards: IdealOilCards,
  content_by_segment: ContentBySegment,
  know_our_tools: KnowOurTools,
  solution_by_application: IndustryList,
  browse_by_topic: BrowseByTopic,
  third_hero: ThridHero,
  mobil_midia: MobilMidia,
  partners_hero: PartnersHero,
  influencers_section: InfluencersSection,
  partnership_cards: PartnershipCards,
  logo_grid: LogoGrid,
  cta_banner: CtaBanner,
  race_cards: RaceCards,
  info_cards_two: InfoCardsTwo,
  breadcrumbs: Breadcrumbs,
  store_finder: StoreFinder,
  newsletter: Newsletter,
  events: MobilEvents,
  hero_distribuidores: SecondaryHero,
  oil_helper: OilHelper,
  no_results: NoResultsBlock,
  no_results_blog: NoResultsBlog,
  find_distributor: FindDistributor,
  distribuidores_intro: DistribuidoresIntro,
  distribuidores_finder: DistribuidoresFinder,
  pede_direto: PedeDiretoSection,
  troca_hero: TrocaHero,
  troca_process_steps: TrocaProcessSteps,
  troca_impact_numbers: TrocaImpactNumbers,
  troca_pillars: TrocaPillars,
  troca_tech_features: TrocaTechFeatures,
  eng_portfolio_tabs: EngineerPortfolioTabs,
  eng_trust_cards: EngineerTrustCards,
  eng_media_hero: EngineerMediaHero,
  mobil_yt: MobilYoutube,
  editorial_posts_showcase: EditorialPostsShowcase,
  featured_posts_editorial: FeaturedPostsEditorial,
  posts_grid: PostsGridEditorial,
  school_of_mechanics: SchoolOfMechanics,
  product_segment_carousel: ProductSegmentCarousel,
  event_hero: EventsHero,
  events_grid: EventsGrid,
  
};

interface BlockRendererProps {
  blocks: Block[] | undefined;
  salesforceData?: any;
  segmentName?: string;
  segmentSlug?: string;
  currentProduct?: any;
  relatedProducts?: any[];
  filters?: any;
  currentIndustrialSegmentTerm?: any;

  // 🔥 NOVO
  dynamicPosts?: any[];
  dynamicProducts?: any[];
  editorialFilterStrategy?: string;
  blockPropsOverrides?: Record<string, Record<string, any>>;
  events?: any[];
}

export default function BlockRenderer({
  blocks,
  salesforceData,
  segmentName,
  segmentSlug,
  currentProduct,
  relatedProducts,
  filters,
  currentIndustrialSegmentTerm,
  dynamicPosts,
  dynamicProducts,
  editorialFilterStrategy,
  blockPropsOverrides,
  events,
}: BlockRendererProps) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  return (
    <>
      {blocks.map((block, index) => {
        const blockType = block.type || block.acf_fc_layout;
        const blockData = block.data || block;

        const Component = BLOCK_COMPONENTS[blockType];

        if (!Component) {
          if (process.env.NODE_ENV === "development") {
            return (
              <div
                key={index}
                className="p-4 my-4 border-2 border-dashed border-red-300 bg-red-50 text-red-700 rounded"
              >
                <p className="font-bold">Bloco não encontrado: "{blockType}"</p>
                <pre className="text-xs mt-2 overflow-auto max-h-40">
                  {JSON.stringify(blockData, null, 2)}
                </pre>
              </div>
            );
          }
          return null;
        }

        // 🔥 GRID DE PRODUTOS (já existente)
        if (blockType === "product_grid") {
          return (
            <Component
              key={`${blockType}-${index}`}
              {...blockData}
              products={salesforceData?.products}
              pagination={salesforceData?.pagination}
              basePath={segmentName ? `/${segmentName}` : "/product"}
              filters={filters}
              segmentSlug={segmentSlug}
            />
          );
        }

        // 🔥 BLOCO SEM PRODUTOS
        if (blockType === "no_products") {
          return (
            <Component
              key={`${blockType}-${index}`}
              {...blockData}
              segmentName={segmentName}
            />
          );
        }

        // 🔥 TABELA COMPARATIVA
        if (blockType === "comparative_table") {
          return (
            <Component
              key={`${blockType}-${index}`}
              {...blockData}
              currentProduct={currentProduct}
            />
          );
        }

        // 🔥 PRODUTOS DINÂMICOS (AQUI FOI ALTERADO)
        if (blockType === "related_products") {
          return (
            <Component
              key={`${blockType}-${index}`}
              {...blockData}
              products={
                dynamicProducts?.length
                  ? dynamicProducts
                  : relatedProducts || []
              }
              current_industries_segment_term={currentIndustrialSegmentTerm}
            />
          );
        }

        // Editorial post blocks receive dynamic posts
        if (
          blockType === "featured_posts_editorial" ||
          blockType === "posts_grid" ||
          blockType === "editorial_posts_showcase" ||
          blockType === "recent_posts"
        ) {
          const overrides = blockPropsOverrides?.[blockType] ?? {};
          return (
            <Component
              key={`${blockType}-${index}`}
              {...blockData}
              filter_strategy={blockData?.filter_strategy ?? editorialFilterStrategy}
              posts={dynamicPosts || []}
              {...overrides}
            />
          );
        }

       // 🔥 EVENT HERO / EVENTS GRID — injetam os eventos vindos do servidor
        if (blockType === "event_hero" || blockType === "events_grid") {
          return (
            <Component
              key={`${blockType}-${index}`}
              {...blockData}
              events={events || []}
            />
          );
        }

        if (blockType === "product_segment_carousel") {
          const resolvedProducts =
            (Array.isArray(blockData?.products) && blockData.products.length > 0
              ? blockData.products
              : null) ||
            (Array.isArray(dynamicProducts) && dynamicProducts.length > 0
              ? dynamicProducts
              : null) ||
            (Array.isArray(salesforceData?.products) && salesforceData.products.length > 0
              ? salesforceData.products
              : []);

          return (
            <Component
              key={`${blockType}-${index}`}
              {...blockData}
              products={resolvedProducts}
              events={events || []}
            />
          );
        }

        return <Component key={`${blockType}-${index}`} {...blockData} />;
      })}
    </>
  );
}

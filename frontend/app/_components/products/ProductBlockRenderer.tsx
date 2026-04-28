import FindOilBanner from "@/app/_components/blocks/FindOilBanner";
import ComparativeTable from "@/app/_components/features/ComparativeTable/ComparativeTable";
import RelatedProducts from "@/app/_components/features/RelatedProducts/RelatedProducts";
import InfoCardsFour from "@/app/_components/blocks/InfoCardsFour";
import Contents from "@/app/_components/blocks/Contents";

// ─── Escudo de Conteúdo Fixo — valores padrão por campo ─────────────────────

const DEFAULT_FIND_OIL = {
  bg_image: {
    url: "/images/navio-2-3.jpg",
    alt: "Conheça toda a linha Mobil One",
    width: 1440,
    height: 269,
  },
  desc: "<h2>Conheça toda a linha Mobil One</h2><p>A linha mais avançada de lubrificantes sintéticos para o máximo desempenho do seu motor.</p>",
  button: { title: "Ver linha completa", url: "/produtos", target: "_self" },
};

const DEFAULT_INFO_CARDS = [
  {
    image: { url: "/images/produtos-para-motos.jpg", alt: "Onde Comprar" },
    title_desc: "<h3>Onde Comprar</h3><p>Encontre o produto Mobil mais próximo de você.</p>",
    link: { title: "Encontrar loja", url: "/onde-comprar", target: "_self" },
  },
  {
    image: { url: "/images/encontre-o-distribuidor.jpg", alt: "Distribuidor" },
    title_desc: "<h3>Distribuidor</h3><p>Conheça nossa rede oficial de distribuidores autorizados.</p>",
    link: { title: "Ver distribuidores", url: "/distribuidores", target: "_self" },
  },
  {
    image: { url: "/images/oleo-ideal.jpg", alt: "Óleo Ideal" },
    title_desc: "<h3>Óleo Ideal</h3><p>Descubra qual lubrificante é o certo para o seu veículo.</p>",
    link: { title: "Descobrir agora", url: "/encontre-seu-oleo", target: "_self" },
  },
  {
    image: {
      url: "/images/refining-gold-metallurgy-precious-metals-generative-ai.jpg",
      alt: "Conteúdos",
    },
    title_desc: "<h3>Conteúdos</h3><p>Dicas e informações técnicas para cuidar melhor do seu motor.</p>",
    link: { title: "Ver conteúdos", url: "/conteudos", target: "_self" },
  },
];

const DEFAULT_CONTENTS = {
  title_desc: "<h2>Conteúdos relacionados</h2><p>Dicas e informações técnicas para tirar o máximo do seu lubrificante.</p>",
  button: { title: "Ver todos os conteúdos", url: "/conteudos", target: "_self" },
  selecao_categoria: "automatica" as const,
};

const DEFAULT_RELATED_DESC = "<h3>Produtos Relacionados</h3>";

const DEFAULT_COMPARATIVE = {
  title: "Tabela Comparativa",
  description: "Use nossa tabela para comparar as especificações e encontrar o produto ideal para a sua necessidade.",
};

// ─── Componente ──────────────────────────────────────────────────────────────

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
      <FindOilBanner
        bg_image={acfFindOil?.bg_image || DEFAULT_FIND_OIL.bg_image}
        desc={acfFindOil?.desc || DEFAULT_FIND_OIL.desc}
        button={acfFindOil?.button || DEFAULT_FIND_OIL.button}
        button_icon={acfFindOil?.button_icon}
        banner_high={true}
        banner_width={true}
      />

      {acfComparative && (
        <ComparativeTable
          {...acfComparative}
          title={acfComparative.title || DEFAULT_COMPARATIVE.title}
          description={acfComparative.description || DEFAULT_COMPARATIVE.description}
          currentProduct={product?.extended_data?.sf ?? product}
        />
      )}

      {acfRelated ? (
        <RelatedProducts
          {...acfRelated}
          desc={acfRelated.desc || DEFAULT_RELATED_DESC}
        />
      ) : fallbackRelatedProducts.length > 0 && (
        <RelatedProducts
          products={fallbackRelatedProducts}
          desc={DEFAULT_RELATED_DESC}
        />
      )}

      <InfoCardsFour
        card={
          Array.isArray(acfInfoCards?.card) && acfInfoCards.card.length > 0
            ? acfInfoCards.card
            : DEFAULT_INFO_CARDS
        }
      />

      <Contents
        title_desc={acfContents?.title_desc || DEFAULT_CONTENTS.title_desc}
        button={acfContents?.button || DEFAULT_CONTENTS.button}
        selecao_categoria={acfContents?.selecao_categoria || DEFAULT_CONTENTS.selecao_categoria}
        buttonVariant={acfContents?.buttonVariant ?? "filled"}
        show_image={acfContents?.show_image ?? true}
      />
    </>
  );
}

import { wordpressAPI } from "../lib/wordpress-api";
import BlockRenderer from "../_components/BlockRenderer";
import Breadcrumb from "@/app/_components/ui/Breadcrumb/Breadcrumb";
import { extractHeroBlocks } from "@/app/lib/breadcrumb-utils";

export default async function IndustriesPage() {
  const data = await wordpressAPI.getProductSegmentsBySlug("industria");

  if (!data) {
    return <div className="container py-20">Erro ao carregar conteúdo de Indústria.</div>;
  }

  const blocks = data.blocks || [];
  const { heroBlocks, remainingBlocks } = extractHeroBlocks(blocks);

  return (
    <>
      {heroBlocks.length > 0 && <BlockRenderer blocks={heroBlocks} />}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Indústria" },
        ]}
      />
      {remainingBlocks.length > 0 && <BlockRenderer blocks={remainingBlocks} />}
    </>
  );
}

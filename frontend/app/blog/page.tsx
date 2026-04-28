import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockRenderer from "@/app/_components/BlockRenderer";
import Breadcrumb from "@/app/_components/ui/Breadcrumb/Breadcrumb";
import { wordpressAPI } from "@/app/lib/wordpress-api";
import { extractHeroBlocks } from "@/app/lib/breadcrumb-utils";

export async function generateMetadata(): Promise<Metadata> {
  const page = await wordpressAPI.getPage("blog");

  return {
    title: page?.seo?.title || page?.title || "Blog",
    description: page?.seo?.description || "Conteudos e novidades da Mobil.",
  };
}

export default async function BlogPage() {
  const page = await wordpressAPI.getPage("blog");

  if (!page) {
    notFound();
  }

  const blocks = page.blocks || (page as any).acf?.blocks || [];
  const { heroBlocks: topBlocks, remainingBlocks } = extractHeroBlocks(blocks);

  return (
    <>
      {topBlocks.length > 0 && <BlockRenderer blocks={topBlocks} />}

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog" },
        ]}
      />

      {remainingBlocks.length > 0 && <BlockRenderer blocks={remainingBlocks} />}
    </>
  );
}
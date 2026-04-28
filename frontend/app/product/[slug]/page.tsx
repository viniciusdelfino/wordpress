import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/app/_components/products/ProductDetail";
import BlockRenderer from "@/app/_components/BlockRenderer";
import Breadcrumb from "@/app/_components/ui/Breadcrumb/Breadcrumb";
import { generateProductMetadata } from "../product-metadata";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return generateProductMetadata(slug);
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const isQA =
    process.env.NEXT_PUBLIC_SITE_URL?.includes("qa") ||
    process.env.NEXT_PUBLIC_SITE_URL?.includes("vercel.app") ||
    process.env.VERCEL_ENV === "preview";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/product/${slug}`,
    isQA ? { cache: "no-store" } : { next: { revalidate: 60 } },
  );

  const json = await res.json();

  if (!json.success || !json.data) {
    return notFound();
  }

  const product = json.data;
  const relatedProducts = product.related_products || [];
  const blocks = product.acf?.blocks || [];
  const productName = product.B2BProductName__c || product.title || "Produto";

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Produtos", href: "/produtos" },
          { label: productName },
        ]}
      />
      <ProductDetail product={product} />
      {blocks.length > 0 && (
        <BlockRenderer
          blocks={blocks}
          currentProduct={product}
          relatedProducts={relatedProducts}
        />
      )}
    </>
  );
}
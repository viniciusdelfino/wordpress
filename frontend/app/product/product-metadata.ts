import { Metadata } from "next";
import { getProduct } from "./product-fetcher";

export async function generateProductMetadata(slug: string): Promise<Metadata> {
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Produto não encontrado | Moove",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const canonicalUrl = `${siteUrl}/product/${product.slug}`;

  return {
    title: `${product.B2BProductName__c} | Moove`,
    description: product.Description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      images: product.DisplayUrl ? [product.DisplayUrl] : [],
    },
  };
}

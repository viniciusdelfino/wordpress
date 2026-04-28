import Image from "next/image";
import Link from "next/link";

interface ProductData {
  ID?: number;
  id?: number;
  post_id?: number;
  post_name?: string;
  slug?: string;
  post_title?: string;
  title?: string;
  post_excerpt?: string;
  excerpt?: string;
  featured_image?: string | { url?: string };
}

interface RelatedMobilProductsBlockProps {
  products?: ProductData[];
  link?: {
    title?: string;
    url?: string;
    target?: string;
  };
  contextTerm?: any;
}

function getProductUrl(product: ProductData): string {
  const slug = product?.post_name || product?.slug || "";
  return slug ? `/produto/${slug}` : "#";
}

function getProductImage(product: ProductData): string {
  if (typeof product?.featured_image === "string") {
    return product.featured_image;
  }

  if (product?.featured_image && typeof product.featured_image === "object") {
    return (product.featured_image as any)?.url || "/images/produto.webp";
  }

  return "/images/produto.webp";
}

function getProductTitle(product: ProductData): string {
  return product?.post_title || product?.title || "Produto sem título";
}

function getProductExcerpt(product: ProductData): string {
  return product?.post_excerpt || product?.excerpt || "";
}

export default function RelatedMobilProductsBlock({
  products = [],
  link,
}: RelatedMobilProductsBlockProps) {
  const productsList = Array.isArray(products) ? products.filter(Boolean) : [];

  if (productsList.length === 0) {
    return null;
  }

  return (
    <article className="related-mobil-products-block">
      {productsList.map((product, index) => {
        const productUrl = getProductUrl(product);
        const productImage = getProductImage(product);
        const productTitle = getProductTitle(product);
        const productExcerpt = getProductExcerpt(product);
        const isExternal = link?.target === "_blank";

        return (
          <Link
            key={`${product?.id || product?.post_id || index}`}
            href={productUrl}
            className="h-[19.9375rem] md:h-[12.5rem] block rounded-lg border border-[#D2D5DA] p-4"
            target={isExternal ? "_blank" : undefined}
          >
            <div className="flex flex-col md:flex-row h-full justify-center md:gax-x-4">
              <div className="relative min-w-[243px]">
                <Image
                  src={productImage}
                  alt={productTitle}
                  width={243}
                  height={161}
                  className="object-contain group-hover:scale-105 transition-transform object-cover h-[161px] mx-auto md:mx-0"
                />
              </div>

              <div className="flex flex-col pt-4 md:justify-center">
                <h4 className="text-dark-blue font-semibold mb-[1.125rem] line-clamp-2 lg:text-lg">
                  {productTitle}
                </h4>

                {productExcerpt && (
                  <p className="text-sm text-low-dark-blue line-clamp-2 mb-3 flex-grow">
                    {productExcerpt}
                  </p>
                )}

                {link?.url && link?.title && (
                  <span className="inline-flex h-[2.3125rem] w-[12.125rem] md:h-10 md:text-base items-center rounded-sm bg-red px-4 py-[0.625rem] text-sm font-semibold text-white w-fit">
                    {link.title}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </article>
  );
}

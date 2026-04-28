import DescriptionBlock from "./DescriptionBlock";
import DescriptionCompleteBlock from "./DescriptionCompleteBlock";
import BlockquoteBlock from "./BlockquoteBlock";
import DescTableBlock from "./DescTableBlock";
import VideoBlock from "./VideoBlock";
import RelatedMobilProductsBlock from "./RelatedMobilProductsBlock";
import TableOfContentsBlock from "./TableOfContentsBlock";
import RecentBlogPosts from "../_components/RecentBlogPosts";
import MentionedMobilProducts from "./MentionedMobilProducts";
import { wordpressAPI } from "@/app/lib/wordpress-api";
import { slugify, normalizePostData } from "@/app/blog/utils";

interface BlogAcfBlockRendererProps {
  blocks?: any[];
  contextTerm?: any;
  post?: any;
  recentPosts?: any[];
  mentionedProductsBlocks?: any[];
}

interface TableOfContentsItem {
  id: string;
  title: string;
}

const BLOCK_COMPONENTS: Record<string, React.ComponentType<any>> = {
  description: DescriptionBlock,
  description_complete: DescriptionCompleteBlock,
  bloquequote: BlockquoteBlock,
  desc_table: DescTableBlock,
  video: VideoBlock,
  related_mobil_products: RelatedMobilProductsBlock,
};

export function extractTableOfContents(blocks: any[]): TableOfContentsItem[] {
  if (!Array.isArray(blocks)) {
    return [];
  }

  return blocks
    .filter((block) => {
      const blockType = block?.acf_fc_layout || block?.type;
      return (
        blockType === "description_complete" &&
        block?.indice === true &&
        block?.title
      );
    })
    .map((block) => ({
      id: slugify(block.title),
      title: block.title,
    }));
}

/**
 * Enrich mentioned products server-side so the client component can render
 * without issuing N individual fetch calls.
 */
async function enrichMentionedProducts(rawProducts: any[]): Promise<any[]> {
  if (!Array.isArray(rawProducts) || rawProducts.length === 0) return [];

  function normalizeMentionedProduct(source: any, fallback: any) {
    const base = source?.data || source?.product || source || {};
    const fallbackTitle =
      fallback?.post_title ||
      fallback?.title ||
      fallback?.B2BProductName__c ||
      "Produto sem título";
    const fallbackSlug = fallback?.post_name || fallback?.slug || "";

    const variationFromAcf = {
      sku: base?.acf?.sku || fallback?.sku || "unknown",
      viscosity: base?.acf?.viscosidade || base?.Viscosity__c || "",
      packing: base?.acf?.embalagem || base?.Packing__c || "",
    };

    const variations =
      Array.isArray(base?.variations) && base.variations.length > 0
        ? base.variations
        : [variationFromAcf];

    return {
      ...base,
      id: base?.id || fallback?.ID || fallback?.id,
      slug: base?.slug || fallbackSlug,
      B2BProductName__c: base?.B2BProductName__c || fallbackTitle,
      Description: base?.Description || fallback?.post_excerpt || "",
      ProductApplication__c: base?.ProductApplication__c || "",
      IndustryClassifications__c: base?.IndustryClassifications__c || "",
      Viscosity__c: base?.Viscosity__c || variationFromAcf.viscosity || "",
      image:
        base?.image ||
        base?.DisplayUrl ||
        base?.featured_image?.url ||
        base?.featured_image ||
        "/images/produto.webp",
      DisplayUrl:
        base?.DisplayUrl ||
        base?.image ||
        base?.featured_image?.url ||
        base?.featured_image ||
        "/images/produto.webp",
      variations,
    };
  }

  return Promise.all(
    rawProducts.map(async (product) => {
      const slug = product?.post_name || product?.slug;
      if (!slug) return normalizeMentionedProduct(null, product);

      try {
        const detailed = await wordpressAPI.getProductBySlug(slug);
        return normalizeMentionedProduct(detailed, product);
      } catch {
        return normalizeMentionedProduct(null, product);
      }
    }),
  );
}

export default async function BlogAcfBlockRenderer({
  blocks = [],
  contextTerm,
  post: currentPost,
  recentPosts: recentPostsProp,
  mentionedProductsBlocks = [],
}: BlogAcfBlockRendererProps) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  const tableOfContents = extractTableOfContents(blocks);
  const tags = Array.isArray(currentPost?.tags) ? currentPost.tags : [];
  const taxonomy =
    contextTerm?.taxonomy === "segmento_industrial"
      ? "segmento_industrial"
      : "editorial";

  const recentPosts =
    recentPostsProp ??
    (
      await wordpressAPI.getPostsByTaxonomyTerm(
        taxonomy,
        Number(contextTerm?.id || 0),
      )
    )
      .filter((item: any) => item?.id !== currentPost?.id)
      .slice(0, 3)
      .map(normalizePostData);

  const allMentionedProducts = mentionedProductsBlocks.flatMap(
    (block: any) =>
      Array.isArray(block?.products) ? block.products : [],
  );
  const enrichedMentionedProducts =
    allMentionedProducts.length > 0
      ? await enrichMentionedProducts(allMentionedProducts)
      : [];

  return (
    <>
      <div className="grid grid-cols-1 mt-12 md:mt-16 lg:mt-20 lg:grid-cols-12 gap-y-8 lg:gap-8">
        {tableOfContents.length > 0 && (
          <div className="lg:col-span-3 hidden lg:block lg:pt-10">
            <TableOfContentsBlock items={tableOfContents} />
          </div>
        )}

        <div className="p-4 lg:col-span-6 space-y-8 md:space-y-[3rem] lg:space-y-12 border border-[#F9FAFB] rounded-xl lg:p-8 lg:mb-10">
          {blocks.map((block, index) => {
            const blockType = block?.acf_fc_layout || block?.type;
            const Component = BLOCK_COMPONENTS[blockType];

            if (!Component) {
              return null;
            }

            const blockId = block?.title ? slugify(block.title) : undefined;

            return (
              <Component
                key={`${blockType || "blog-block"}-${index}`}
                {...block}
                blockId={blockId}
                contextTerm={contextTerm}
              />
            );
          })}

          {tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-light-gray">
              <h2 className="text-low-dark-blue text-sm md:text-base font-bold mb-3">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: any) => (
                  <span
                    key={tag?.id || tag?.slug || tag?.name}
                    className="rounded-lg bg-[#F3F4F6] p-2 text-base text-low-dark-blue min-h-[2.0625rem] gap-y-4"
                  >
                    #{tag?.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <RecentBlogPosts
            posts={recentPosts}
            currentPostId={currentPost?.id}
            categoryLabel={contextTerm?.name}
          />
        </div>
      </div>

      {enrichedMentionedProducts.length > 0 && (
        <MentionedMobilProducts products={enrichedMentionedProducts} />
      )}
    </>
  );
}

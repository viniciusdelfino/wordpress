import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { wordpressAPI } from "@/app/lib/wordpress-api";
import BlockRenderer from "@/app/_components/BlockRenderer";
import Breadcrumb from "@/app/_components/ui/Breadcrumb/Breadcrumb";
import { extractHeroBlocks } from "@/app/lib/breadcrumb-utils";

type TaxonomyType = "editorial" | "segmento_industrial";

type ResolvedTerm = {
  taxonomy: TaxonomyType;
  term: any;
};

interface BlogTaxonomyPageProps {
  params: Promise<{ slug: string }>;
}

const INDUSTRIAL_FILTER_BLOCK_TYPES = new Set([
  "posts_grid",
  "editorial_posts_showcase",
]);
const INDUSTRIAL_SEGMENT_ALLOWED_SLUGS = new Set([
  "caminhoes",
  "equipamentos-agricolas",
]);

function normalizeSlug(value?: string): string {
  if (!value) return "";

  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

function getEditorialTermsFromPost(post: any): any[] {
  const embeddedTerms = post?._embedded?.["wp:term"]?.flat() || [];
  const embeddedEditorialTerms = embeddedTerms.filter(
    (term: any) => term?.taxonomy === "editorial",
  );

  return [
    ...embeddedEditorialTerms,
    ...(Array.isArray(post?.editorial_terms)
      ? post.editorial_terms
      : []),
    ...(Array.isArray(post?.editorial) ? post.editorial : []),
    ...(Array.isArray(post?.acf?.editorial_terms)
      ? post.acf.editorial_terms
      : []),
    ...(Array.isArray(post?.acf?.editorial)
      ? post.acf.editorial
      : []),
    ...(Array.isArray(post?.acf_fields?.editorial_terms)
      ? post.acf_fields.editorial_terms
      : []),
    ...(Array.isArray(post?.acf_fields?.editorial)
      ? post.acf_fields.editorial
      : []),
  ];
}

function hasAllowedIndustrialSegment(
  post: any,
  parentEditorialSlug?: string,
): boolean {
  const terms = getEditorialTermsFromPost(post);
  const normalizedParentSlug = normalizeSlug(parentEditorialSlug);

  return terms.some((term: any) => {
    const slug = normalizeSlug(
      typeof term === "string" ? term : term?.slug || term?.name || term?.label,
    );

    if (!slug) {
      return false;
    }

    if (normalizedParentSlug && slug === normalizedParentSlug) {
      return false;
    }

    return INDUSTRIAL_SEGMENT_ALLOWED_SLUGS.has(slug);
  });
}

function blockUsesIndustrialSegmentStrategy(block: any): boolean {
  const blockType = block?.type || block?.acf_fc_layout;

  if (!INDUSTRIAL_FILTER_BLOCK_TYPES.has(blockType)) {
    return false;
  }

  return block?.filter_strategy === "industrial_segment";
}

async function resolveTermBySlug(slug: string): Promise<ResolvedTerm | null> {
  // Tentar buscar por slug através do novo endpoint que retorna ACF
  const editorial = await wordpressAPI.getTermBySlugAndTaxonomy("editorial", slug);
  if (editorial) {
    return { taxonomy: "editorial", term: editorial };
  }

  const segmento = await wordpressAPI.getTermBySlugAndTaxonomy(
    "segmento_industrial",
    slug,
  );
  if (segmento) {
    return { taxonomy: "segmento_industrial", term: segmento };
  }

  return null;
}

export async function generateMetadata({ params }: BlogTaxonomyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveTermBySlug(slug);

  if (!resolved) {
    return {
      title: "Blog",
    };
  }

  return {
    title: resolved.term?.name || "Blog",
    description: resolved.term?.description || "Conteudos relacionados a esta categoria.",
  };
}

export default async function BlogTaxonomyPage({ params }: BlogTaxonomyPageProps) {
  const { slug } = await params;

  const resolved = await resolveTermBySlug(slug);

  if (!resolved) {
    notFound();
  }

  const blocks = resolved.term?.acf?.blocks || [];
  const usesIndustrialSegmentFeed =
    resolved.taxonomy === "editorial" &&
    blocks.some(blockUsesIndustrialSegmentStrategy);

  const taxonomyPosts = await wordpressAPI.getPostsByTaxonomyTerm(
    resolved.taxonomy,
    Number(resolved.term.id),
  );

  const posts = usesIndustrialSegmentFeed
    ? taxonomyPosts.filter((post: any) =>
        hasAllowedIndustrialSegment(post, resolved.term?.slug || resolved.term?.name),
      )
    : taxonomyPosts;

  const { heroBlocks: topBlocks, remainingBlocks } = extractHeroBlocks(blocks);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: resolved.term?.name || "Categoria" },
  ];

  const editorialFilterStrategy = usesIndustrialSegmentFeed
    ? "industrial_segment"
    : "editorial_children";
  const currentIndustrialSegmentTerm =
    resolved.taxonomy === "segmento_industrial" ? resolved.term : undefined;

  return (
    <>
      {topBlocks.length > 0 && (
        <BlockRenderer
          blocks={topBlocks}
          dynamicPosts={posts}
          editorialFilterStrategy={editorialFilterStrategy}
          currentIndustrialSegmentTerm={currentIndustrialSegmentTerm}
        />
      )}

      <Breadcrumb items={breadcrumbItems} />

      {remainingBlocks.length > 0 && (
        <BlockRenderer
          blocks={remainingBlocks}
          dynamicPosts={posts}
          editorialFilterStrategy={editorialFilterStrategy}
          currentIndustrialSegmentTerm={currentIndustrialSegmentTerm}
        />
      )}
    </>
  );
}

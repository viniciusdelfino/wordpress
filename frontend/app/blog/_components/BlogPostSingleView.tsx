import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/app/_components/ui/Breadcrumb/Breadcrumb";
import BlogAcfBlockRenderer from "@/app/blog/blocks/BlogAcfBlockRenderer";
import EbookDownloadButton from "@/app/_components/features/EbookDownloadModal/EbookDownloadButton";
import ScrollProgressBar from "./ScrollProgressBar";
import PostShareButton from "./PostShareButton";
import { getEbookFileUrl, getEbookFileName } from "@/app/blog/utils";

interface BlogPostSingleViewProps {
  post: any;
  postTitle: string;
  termName: string;
  termUrl: string;
  contextTerm: any;
  fallbackBackLabel?: string;
  /** Pre-fetched recent posts from page.tsx — forwarded to BlogAcfBlockRenderer. */
  recentPosts?: any[];
}

function getRawText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value && typeof value === "object") {
    const renderedValue = (value as any)?.rendered;
    if (typeof renderedValue === "string") {
      return renderedValue;
    }

    const textValue = (value as any)?.text;
    if (typeof textValue === "string") {
      return textValue;
    }
  }

  return "";
}

function stripHtml(value?: unknown): string {
  const rawText = getRawText(value);
  if (!rawText) return "";
  return rawText
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDateLabel(value?: string): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getReadingTimeLabel(post: any): string {
  const rawValue =
    post?.reading_time ||
    post?.acf_fields?.["reading-time"] ||
    post?.acf_fields?.reading_time ||
    post?.acf_fields?.["content-infos"]?.["reading-time"] ||
    post?.acf_fields?.["content_infos"]?.reading_time ||
    post?.acf?.["reading-time"] ||
    post?.acf?.reading_time ||
    "";

  if (!rawValue) {
    return "";
  }

  const text = String(rawValue).trim();
  if (!text) {
    return "";
  }

  if (/min/i.test(text)) {
    return text;
  }

  return `${text} min de leitura`;
}

function getPostFeaturedImage(post: any): string | null {
  if (typeof post?.featured_image === "string") {
    return post.featured_image;
  }

  if (post?.featured_image?.url) {
    return post.featured_image.url;
  }

  return null;
}


function isEbookPost(post: any): boolean {
  if (typeof post?.is_ebook === "boolean") return post.is_ebook;

  const sources = [post, post?.acf, post?.acf_fields];
  for (const source of sources) {
    if (!source) continue;
    const ct = source.content_type;
    if (typeof ct === "string" && ct.toLowerCase() === "ebook") return true;
  }

  return getEbookFileUrl(post) !== null;
}

function resolveFormVariant(
  contextTerm: any,
  post: any,
): "industria" | "guia-oleo-frotas" {
  // Posts from segmento_industrial taxonomy -> industria form
  if (contextTerm?.taxonomy === "segmento_industrial") return "industria";

  // Check editorial terms for known slugs
  const editorialTerms: any[] = [
    ...(Array.isArray(post?.editorial_terms) ? post.editorial_terms : []),
    ...(Array.isArray(post?.acf_fields?.editorial_terms) ? post.acf_fields.editorial_terms : []),
  ];

  const guiaOleoFrotasSlugs = ["guia-do-oleo", "mobil-frotas"];
  const hasGuiaOrFrotas = editorialTerms.some(
    (term: any) =>
      guiaOleoFrotasSlugs.includes(term?.slug) ||
      guiaOleoFrotasSlugs.includes(term?.name?.toLowerCase()),
  );

  if (hasGuiaOrFrotas) return "guia-oleo-frotas";

  // Check segmento_industrial_terms on the post directly
  const segmentoTerms = Array.isArray(post?.segmento_industrial_terms)
    ? post.segmento_industrial_terms
    : [];

  if (segmentoTerms.length > 0) return "industria";

  // Default to industria
  return "industria";
}

export default function BlogPostSingleView({
  post,
  postTitle,
  termName,
  termUrl,
  contextTerm,
  fallbackBackLabel = "Categoria",
  recentPosts,
}: BlogPostSingleViewProps) {
  const featuredImage = getPostFeaturedImage(post);
  const excerpt = stripHtml(post?.excerpt || "");
  const publishedLabel = formatDateLabel(post?.dates?.published || post?.date);
  const modifiedLabel = formatDateLabel(
    post?.dates?.modified || post?.modified,
  );
  const readingTimeLabel = getReadingTimeLabel(post);
  const articleBlocks = Array.isArray(post?.acf_fields?.article_blog)
    ? post.acf_fields.article_blog
    : [];

  // Separar blocos de produtos mencionados do restante
  const mentionedProductsBlocks = articleBlocks.filter(
    (block: any) => (block?.acf_fc_layout || block?.type) === "mentioned_mobil_products"
  );
  const regularBlocks = articleBlocks.filter(
    (block: any) => (block?.acf_fc_layout || block?.type) !== "mentioned_mobil_products"
  );

  // Ebook download
  const showEbookDownload = isEbookPost(post);
  const ebookUrl = getEbookFileUrl(post) || "";
  const ebookName = getEbookFileName(post);
  const ebookFormVariant = resolveFormVariant(contextTerm, post);

  return (
    <>
      <ScrollProgressBar />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: termName || fallbackBackLabel, href: termUrl },
          { label: postTitle },
        ]}
      />

      <section className="container pt-6 blog-post-single-view">
        <div className="mb-6 md:mb-8 lg:mb-10">
          <div className="flex flex-row justify-between items-center mb-2">
            <h1 className="text-dark-blue text-2xl md:text-[1.75rem] lg:text-[2rem] font-semibold leading-tight">
              {postTitle}
            </h1>
            <PostShareButton title={postTitle} />
          </div>
          {excerpt && (
            <p className="text-base md:text-lg text-low-dark-blue mb-6">
              {excerpt}
            </p>
          )}

          <div className="flex flex-col md:flex-row gap-x-4 lg:gap-x-0 gap-y-2 text-xs md:text-sm text-low-dark-blue">
            {publishedLabel && modifiedLabel && (
              <span className="flex flex-row items-center gap-x-2">
                <Image
                  src="/icons/calendar-2.svg"
                  width="16"
                  height="16"
                  alt="Data de publicação"
                />{" "}
                Publicado {publishedLabel} | Atualizado {modifiedLabel}
              </span>
            )}
            <span className="hidden lg:block mx-6">|</span>
            {readingTimeLabel && (
              <span className="flex flex-row items-center gap-x-2">
                <Image
                  src="/icons/clock.svg"
                  width="16"
                  height="16"
                  alt="Tempo de leitura"
                />{" "}
                {readingTimeLabel}
              </span>
            )}
          </div>         
        </div>

        {featuredImage && (
          <div className="relative w-full">
            <div className="h-[6.5625rem] md:h-[11.8125rem] lg:h-[22.9375rem]">
              <Image
                src={featuredImage}
                alt={postTitle}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {regularBlocks.length > 0 ? (
          <BlogAcfBlockRenderer
            blocks={regularBlocks}
            contextTerm={contextTerm}
            post={post}
            recentPosts={recentPosts}
            mentionedProductsBlocks={mentionedProductsBlocks}
          />
        ) : (
          post?.content && (
            <div
              className="prose prose-lg max-w-none prose-headings:text-dark-blue prose-p:text-sm prose-a:text-red text-low-dark-blue"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )
        )}
      </section>
    </>
  );
}

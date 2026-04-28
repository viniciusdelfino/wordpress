"use client";

import Image from "next/image";
import Link from "next/link";
import { getEbookFileName } from "@/app/blog/utils";

export interface EbookDownloadData {
  post: any;
  downloadUrl: string;
  fileName: string;
}

interface PostCardProps {
  post: any;
  featured?: boolean; // True para layout grande, False para layout pequeno
  className?: string;
  showDownloadButton?: boolean;
  sidebarFeatured?: boolean;
  onDownloadClick?: (data: EbookDownloadData) => void;
}

function stripHtml(value?: string): string {
  if (!value || typeof value !== "string") return "";
  return value.replace(/<[^>]+>/g, "").trim();
}

function getPostImage(post: any): string | null {
  return (
    post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    post?.featured_media_url ||
    post?.featured_image ||
    null
  );
}

function getPostExcerpt(post: any, limit: number = 100): string {
  const excerpt = stripHtml(post?.excerpt?.rendered || post?.excerpt || "");
  if (excerpt.length > limit) {
    return excerpt.substring(0, limit) + "...";
  }
  return excerpt;
}

function getNestedField(source: any, key: string): any {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  if (Object.prototype.hasOwnProperty.call(source, key)) {
    return source[key];
  }

  const altKey = key.includes("-") ? key.replace(/-/g, "_") : key.replace(/_/g, "-");
  if (Object.prototype.hasOwnProperty.call(source, altKey)) {
    return source[altKey];
  }

  return undefined;
}

function getAcfField(post: any, key: string): any {
  const sources = [post, post?.acf, post?.acf_fields];

  for (const source of sources) {
    const value = getNestedField(source, key);
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
}

function isEbook(post: any): boolean {
  if (typeof post?.is_ebook === "boolean") {
    return post.is_ebook;
  }

  const contentType = getAcfField(post, "content_type");
  const hasFile = Boolean(getDownloadUrl(post));

  if (typeof contentType === "string" && contentType.toLowerCase() === "ebook") {
    return hasFile;
  }

  if (contentType === undefined || contentType === null || contentType === "") {
    return hasFile;
  }

  const isExplicitFalse =
    contentType === false ||
    contentType === 0 ||
    contentType === "0" ||
    contentType === "false";

  return isExplicitFalse && hasFile;
}

function getDownloadUrl(post: any): string | null {
  const fileUrl = getAcfField(post, "file_url");
  if (typeof fileUrl === "string" && fileUrl) {
    return fileUrl;
  }

  const fileField = getAcfField(post, "file");
  if (typeof fileField === "string" && fileField) {
    return fileField;
  }

  if (typeof fileField === "object" && fileField) {
    if (typeof fileField.url === "string" && fileField.url) {
      return fileField.url;
    }

    if (typeof fileField.source_url === "string" && fileField.source_url) {
      return fileField.source_url;
    }

    if (typeof fileField.guid?.rendered === "string" && fileField.guid.rendered) {
      return fileField.guid.rendered;
    }
  }

  return null;
}

function getPrimaryEditorialTerm(post: any): any | null {
  const termGroups = post?._embedded?.["wp:term"] || [];
  const flatTerms = Array.isArray(termGroups) ? termGroups.flat() : [];
  const editorialTerms = flatTerms.filter(
    (term: any) => term?.taxonomy === "editorial",
  );

  const rootTerm = editorialTerms.find((term: any) => !term?._links?.up?.length);
  return rootTerm || editorialTerms[0] || null;
}

function formatPostMonthYear(dateValue?: string): string {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const monthLabels = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  return `${monthLabels[date.getMonth()]}/${date.getFullYear()}`;
}

function getPostUrl(post: any): string {
  if (typeof post?.frontend_url === "string" && post.frontend_url) {
    return post.frontend_url;
  }

  const termGroups = post?._embedded?.["wp:term"] || [];
  const flatTerms = Array.isArray(termGroups) ? termGroups.flat() : [];
  const industrialTerm = flatTerms.find(
    (term: any) => term?.taxonomy === "segmento_industrial",
  );
  const editorialTerm = flatTerms.find((term: any) => term?.taxonomy === "editorial");

  if (industrialTerm?.slug && post?.slug) {
    return `/blog/segmento-industrial/${industrialTerm.slug}/${post.slug}`;
  }

  if (editorialTerm?.slug && post?.slug) {
    return `/blog/${editorialTerm.slug}/${post.slug}`;
  }

  return `/conteudos/${post.slug}`;
}


function getReadingTimeLabel(post: any): string {
  const rawValue =
    getAcfField(post, "reading_time") ||
    getAcfField(post, "reading-time") ||
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

export default function PostCard({
  post,
  featured = false,
  className = "",
  showDownloadButton = false,
  sidebarFeatured = false,
  onDownloadClick,
}: PostCardProps) {
  const image = getPostImage(post);
  const excerpt = getPostExcerpt(post);
  const postTitle = post?.title?.rendered || post?.title || "Sem Título";
  const postUrl = getPostUrl(post);
  const ebook = isEbook(post);
  const downloadUrl = getDownloadUrl(post);
  const primaryEditorial = getPrimaryEditorialTerm(post);
  const primaryEditorialLabel = primaryEditorial?.name || "Conteúdo";
  const postMonthYear = formatPostMonthYear(post?.date || "");
  const readingTimeLabel = getReadingTimeLabel(post);
  const shouldShowDownload = Boolean(showDownloadButton && ebook && downloadUrl);
  const postDate = new Date(post?.date || "").toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (featured) {
    // Layout grande - destaque
    return (
      <article className={`flex flex-col rounded-lg bg-white [font-family:Inter,sans-serif] ${className}`}>
        <Link href={postUrl} className="block">
          <div className="relative h-[280px] md:h-[355px] lg:h-[400px] bg-neutral rounded-lg overflow-hidden flex-shrink-0">
            {image && (
              <Image
                src={image}
                alt={postTitle}
                fill
                className="object-cover"
              />
            )}
          </div>
        </Link>

        <div className="mt-6 flex flex-col flex-grow">
          <div className="flex items-center justify-between gap-4 mb-[10px]">
            <div className="flex items-center gap-x-2 text-red uppercase text-xs font-semibold tracking-[0.04em]">
              <Image
                src="/icons/doc.svg"
                alt="Categoria editorial"
                width={16}
                height={16}
              />
              <span className="font-semibold tracking-[0.03px]">{primaryEditorialLabel}</span>
            </div>
            <span className="text-xs text-low-dark-blue">{postMonthYear || postDate}</span>
          </div>

          <h3 className="text-dark-blue text-2xl md:text-[32px] leading-tight mb-4">
            <Link href={postUrl}>
              {postTitle}
            </Link>
          </h3>
          {excerpt && (
            <p className="text-base text-[#4A4A4A] line-clamp-3 flex-grow">
              {excerpt}
            </p>
          )}
        </div>
      </article>
    );
  }

  if (sidebarFeatured) {
    return (
      <article className={`flex flex-row gap-x-[12px] [font-family:Inter,sans-serif] items-center ${className}`}>
        <Link href={postUrl} className="block flex-shrink-0">
          <div className="relative w-[150px] h-[118px] md:h-[170px] md:w-[216px] rounded-lg overflow-hidden bg-neutral">
            {image && (
              <Image
                src={image}
                alt={postTitle}
                fill
                className="object-cover"
              />
            )}
          </div>
        </Link>

        <div className="flex min-w-0 flex-col">
          <p className="text-xs text-low-dark-blue mb-3">{postMonthYear || postDate}</p>

          <h3 className="text-dark-blue text-[18px] leading-tight mb-[12px] line-clamp-3">
            <Link href={postUrl} className="hover:underline">
              {postTitle}
            </Link>
          </h3>

          {readingTimeLabel && (
            <div className="flex items-center gap-x-2 text-sm text-low-dark-blue justify-between">
              <span>{readingTimeLabel}</span>
              <Image
                src="/icons/arrow-right-red.svg"
                alt="Ir para o conteúdo"
                width={16}
                height={16}
              />
            </div>
          )}
        </div>
      </article>
    );
  }

  // Layout pequeno - grid
  return (
    <article className={`flex h-full w-full flex-col overflow-hidden rounded-lg border border-dark-blue bg-white ${className}`}>
      {image && (
        <Link href={postUrl} className="block ">
          <div className="relative w-full aspect-[343/165] bg-neutral min-h-[10.75rem] md:min-h-[9.5rem] lg:min-h-[12.25rem]">
            <Image
              src={image}
              alt={postTitle}
              fill
              className="object-cover"
            />
          </div>
        </Link>
      )}

      <div
        className="flex flex-1 flex-col px-6 py-8"
      >
        <div className="flex justify-between gap-x-2">
          <div className="flex items-center gap-x-2 mb-6">
            <Image
              src="/icons/doc.svg"
              alt="Categoria editorial"
              width={16}
              height={16}
            />
            <span className="text-xs font-semibold uppercase tracking-wide text-red">
              {primaryEditorialLabel || "Conteúdo"}
            </span>
          </div>
          <span className="text-xs text-low-dark-blue">{postMonthYear || postDate}</span>
        </div>

        <div className="flex flex-1 flex-col gap-y-2">
          <h3 className="text-xl font-semibold leading-tight text-dark-blue">
            <Link href={postUrl} className="hover:opacity-80 transition-opacity">
              {postTitle}
            </Link>
          </h3>
          {excerpt && (
            <p className="line-clamp-3 text-sm font-normal leading-relaxed text-low-dark-blue md:text-base">
              {excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-4">
          {!shouldShowDownload && (
            <span className="text-sm text-low-dark-blue">{readingTimeLabel}</span>
          )}
          {shouldShowDownload ? (
            <button
              type="button"
              onClick={() => {
                if (onDownloadClick && downloadUrl) {
                  onDownloadClick({
                    post,
                    downloadUrl,
                    fileName: getEbookFileName(post),
                  });
                }
              }}
              className="inline-flex items-center justify-center gap-x-2 rounded-sm px-1 py-1 text-base font-semibold text-[#5A5A5A] transition hover:opacity-90 cursor-pointer"
            >
              <Image
                src="/icons/download-2.svg"
                alt="Baixar conteúdo"
                width={24}
                height={24}
              />
              Faça o download
            </button>
          ) : (
            <Link href={postUrl} className="transition-opacity hover:opacity-70">
              <Image
                src="/icons/arrow-right.svg"
                alt="Ler mais"
                width={16}
                height={16}
              />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

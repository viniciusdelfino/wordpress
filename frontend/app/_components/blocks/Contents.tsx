"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { wordpressAPI } from "@/app/lib/wordpress-api";
import ContentsNoImageHybrid, { ContentsButtonLink } from "./ContentsNoImageHybrid";

import { usePathname } from "next/navigation";
import { helpers } from "./ContentHelpers/Helpers";

interface Post {
  acf_fields?: any;
  acf?: any;
  id: number;
  title: string;
  excerpt: string;
  featured_image?: string;
  category?: string;
  reading_time?: string;
  link?: string;
  date?: string;
  content_type?: boolean | number | string;
  file?: any;
  file_url?: string;
}

interface ContentsProps {
  title_desc: string;
  button: {
    title: string;
    url: string;
    target: string;
  } | string;
  selecao_categoria: string;
  buttonVariant?: "filled" | "outline";
  show_image?: boolean | number | string;
  force_show_image?: boolean;
  only_carrousel?: boolean | number | string;
  hybrid_slide_class?: string;
}

function isBooleanFieldTrue(value?: boolean | number | string): boolean {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true"
  );
}

function resolveShowImageByRoute(
  pathname: string,
  showImageField?: boolean | number | string,
  forceShowImage?: boolean
): boolean {
  const normalizedPath = (pathname || "").toLocaleLowerCase();
  const acfShowImage =
    showImageField !== false &&
    showImageField !== 0 &&
    showImageField !== "0" &&
    showImageField !== "false";

  if (forceShowImage === true) return true;

  // Busca sempre força cards com imagem.
  if (normalizedPath.includes("/busca")) return true;

  // Segmentos de industria sempre forcam cards sem imagem.
  if (normalizedPath.startsWith("/industria/") || normalizedPath.startsWith("/industry/")) {
    return false;
  }

  return acfShowImage;
}

function stripHtml(value?: string): string {
  if (!value || typeof value !== "string") return "";
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function sanitizeTitleDescHtml(value?: string): string {
  if (!value || typeof value !== "string") return "";
  // Prevent malformed wrapper divs from ACF content from swallowing following layout nodes.
  return value.replace(/<\/?div[^>]*>/gi, "").trim();
}

function isRenderablePost(post: Post): boolean {
  const hasTitle = typeof post.title === "string" && post.title.trim().length > 0;
  const hasExcerpt = stripHtml(post.excerpt).length > 0;
  const hasImage = typeof post.featured_image === "string" && post.featured_image.length > 0;
  const hasLink = typeof post.link === "string" && post.link !== "#";

  return hasTitle || hasExcerpt || hasImage || hasLink;
}

export default function Contents({
  title_desc,
  button: buttonProp,
  selecao_categoria,
  buttonVariant = "filled",
  show_image,
  force_show_image,
  only_carrousel,
  hybrid_slide_class,
}: ContentsProps) {
  const pathname = usePathname();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const showImage = resolveShowImageByRoute(pathname || "", show_image, force_show_image);
  const isEventosPage = (pathname || "").toLowerCase().includes("/blog/eventos");
  const isOnlyCarrouselActive = isBooleanFieldTrue(only_carrousel);
  const useFullCarouselLayout = isEventosPage || !isOnlyCarrouselActive;
  const useTabletCarouselLayout = !isEventosPage && isOnlyCarrouselActive;
  const shouldHideViewAllButton = useFullCarouselLayout;
  const carouselShowImage = isEventosPage ? false : showImage;

  const button = typeof buttonProp === 'object' && buttonProp ? buttonProp : { title: "", url: "", target: "" };
  const safeSelecaoCategoria = selecao_categoria || "todas";

  const btnBase = "flex items-center justify-center gap-2 rounded-sm transition hover:opacity-90 font-medium text-sm md:text-base h-[2.5rem]";
  const btnFilled = "bg-red text-white";
  const btnOutline = "border border-dark-blue text-dark-blue";
  const btnStyle = buttonVariant === "outline" ? btnOutline : btnFilled;
  const safeTitleDesc = sanitizeTitleDescHtml(title_desc);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const [data, catData] = await Promise.all([
          wordpressAPI.getAllPosts(),
          wordpressAPI.getAllCategories(),
        ]);

        if (Array.isArray(data) && data.length > 0) {
          const urlSegment = (pathname || "")
            .toLocaleLowerCase()
            .replace(/\//g, " ");

          // Busca pelas categorias
          const catCombine = catData.filter((cat: any) => {
            const catSlug = (cat.slug || "").toLocaleLowerCase();
            const key = cat.acf?.termos_de_busca
              ? cat.acf.termos_de_busca
                  .split(",")
                  .map((t: string) => t.trim().toLocaleLowerCase())
                  .filter(Boolean)
              : [];
            return (
              urlSegment.includes(catSlug) ||
              key.some((t: string) => urlSegment.includes(t))
            );
          });

          const catID = catCombine.map((cat) => cat.id);

          let filteredData = data.filter((post: any) => {
            // A - Seleção manual
            if (
              safeSelecaoCategoria !== "automatica" &&
              safeSelecaoCategoria !== "todas"
            ) {
              return post.categories?.some((cat: any) => {
                const slug = typeof cat === "object" ? cat.slug : null;
                return slug === safeSelecaoCategoria;
              });
            }

            // B - Seleção automática
            if (safeSelecaoCategoria === "automatica") {
              return (
                helpers.matchByACF(post, catID) ||
                helpers.matchByCategorySlug(post, urlSegment)
              );
            }

            // C - Todas
            return true;
          });

          // Fallback final
          if (
            safeSelecaoCategoria === "automatica" &&
            filteredData.length === 0
          ) {
            filteredData = data;
          }

          const formattedData = filteredData.slice(0, 3).map((item: any) => {
            const slug =
              item.slug ||
              (item.link
                ? item.link
                    .split("/")
                    .filter((p: string) => p)
                    .pop()
                : "");

            return {
              id: item.id,
              title: item.title?.rendered || item.title,
              excerpt: item.excerpt?.rendered || item.excerpt || "",
              featured_image: item.featured_image || "",
              category: item.categories?.[0]?.name || "Novidades",
              reading_time:
                item.reading_time ||
                item.acf?.reading_time ||
                item.acf?.["reading-time"] ||
                item.acf_fields?.reading_time ||
                item.acf_fields?.["reading-time"] ||
                item.acf?.content_infos?.reading_time ||
                item.acf?.["content-infos"]?.["reading-time"] ||
                item.acf_fields?.content_infos?.reading_time ||
                item.acf_fields?.["content-infos"]?.["reading-time"] ||
                "",
              link: slug ? `/conteudos/${slug}` : "#",
              date: item.date,
              acf: item.acf ?? undefined,
              acf_fields: item.acf_fields ?? undefined,
              content_type: item.content_type ?? item.acf?.content_type ?? item.acf_fields?.content_type,
              file: item.file ?? item.acf?.file ?? item.acf_fields?.file,
              file_url: item.file_url ?? item.acf?.file_url ?? item.acf_fields?.file_url,
            };
          });
          setPosts(formattedData.filter(isRenderablePost));
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error("Erro ao carregar posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [pathname, safeSelecaoCategoria]);

  const visiblePosts = posts.filter(isRenderablePost);
  const defaultButtonLink: ContentsButtonLink = {
    href: button?.url || "/conteudos",
    target: button?.target || "_parent",
    title: button?.title || "Ver todos os conteúdos",
  };

  if (loading || visiblePosts.length === 0) return null;

  return (
    <section className="w-full pb-[3.75rem] md:pb-[5.625rem] lg:pb-[3.75rem] pt-8 md:pt-10 lg:pt-15 bg-neutral-2 contents-block">
      <div className="container mx-auto px-4">
        {safeTitleDesc && (
          <div className="mb-6 md:mb-8 lg:mb-10">
            <div
              className="prose prose-slate max-w-none prose-headings:text-dark-blue prose-headings:font-semibold prose-headings:text-2xl md:prose-headings:text-3xl lg:prose-headings:text-[32px] prose-headings:mb-4 prose-headings:leading-tight prose-p:text-low-dark-blue prose-p:text-base lg:prose-p:text-lg prose-p:max-w-3xl"
              dangerouslySetInnerHTML={{ __html: safeTitleDesc }}
            />
          </div>
        )}

        {useFullCarouselLayout ? (
          <>
            <Swiper
              modules={[Pagination, Navigation]}
              navigation={{
                nextEl: ".swiper-button-next-content",
                prevEl: ".swiper-button-prev-content",
              }}
              spaceBetween={16}
              slidesPerView={1.5}
              breakpoints={{
                768: { slidesPerView: 2.5 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
              }}
              pagination={{
                clickable: true,
                el: ".swiper-pagination-contents",
                type: "bullets",
                renderBullet: function (index, className) {
                  return '<span class="' + className + ' custom-bullet"></span>';
                },
              }}
              className="w-full [&_.swiper-wrapper]:items-stretch"
            >
              {visiblePosts.map((post) => (
                <SwiperSlide key={post.id} className="!h-auto flex">
                  <PostCard post={post} showImage={carouselShowImage} />
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="mt-[0.875rem] md:mt-4 flex flex-col md:flex-row items-center justify-center gap-[0.875rem] md:gap-4">
              <div className="flex items-center gap-x-4 order-1 md:order-2">
                <button className="swiper-button-prev-content w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div className="swiper-pagination-contents !static !w-auto flex gap-x-2"></div>
                <button className="swiper-button-next-content w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : useTabletCarouselLayout ? (
          <ContentsNoImageHybrid
            posts={visiblePosts}
            buttonLink={defaultButtonLink}
            btnBase={btnBase}
            btnStyle={btnStyle}
            slideClassName={hybrid_slide_class}
            renderPostCard={(post) => <PostCard post={post} showImage={false} />}
          />
        ) : (
          <>
            <div className="hidden lg:grid grid-cols-12 gap-8 items-stretch">
              {visiblePosts.map((post) => (
                <div key={post.id} className="col-span-4 flex flex-col h-full">
                  <PostCard post={post} showImage={showImage} />
                </div>
              ))}
            </div>

            <div className="lg:hidden">
              <Swiper
                modules={[Pagination, Navigation]}
                navigation={{
                  nextEl: ".swiper-button-next-content",
                  prevEl: ".swiper-button-prev-content",
                }}
                spaceBetween={16}
                slidesPerView={1.1}
                breakpoints={{
                  768: {
                    slidesPerView: 2,
                  },
                }}
                pagination={{
                  clickable: true,
                  el: ".swiper-pagination-contents",
                  type: "bullets",
                  renderBullet: function (index, className) {
                    return '<span class="' + className + ' custom-bullet"></span>';
                  },
                }}
                className="w-full [&_.swiper-wrapper]:items-stretch"
              >
                {visiblePosts.map((post) => (
                  <SwiperSlide key={post.id} className="!h-auto flex">
                    <PostCard post={post} showImage={showImage} />
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="mt-[0.875rem] md:mt-4 flex flex-col md:flex-row items-center justify-center md:justify-between gap-[0.875rem] md:gap-4">
                {button?.url && button.title ? (
                  <Link
                    href={button.url || "#"}
                    target={button.target}
                    className={`order-2 md:order-1 ${btnBase} ${btnStyle} text-center min-w-[17.125rem] w-full md:w-fit`}
                  >
                    {button.title}
                  </Link>
                ) : (
                  <Link
                    href="/conteudos"
                    target="_parent"
                    className={`order-2 md:order-1 ${btnBase} ${btnStyle} text-center min-w-[17.125rem] w-full md:w-fit`}
                  >
                    Ver todos os conteúdos
                  </Link>
                )}
                <div className="flex items-center gap-x-4 order-1 md:order-2">
                  <button className="swiper-button-prev-content w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <div className="swiper-pagination-contents !static !w-auto flex gap-x-2"></div>
                  <button className="swiper-button-next-content w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {!shouldHideViewAllButton && (
              <Link
                href={defaultButtonLink.href}
                target={defaultButtonLink.target}
                className={`hidden lg:flex mx-auto mt-6 w-fit min-w-[17.125rem] [font-family:Inter,sans-serif] ${btnBase} ${btnStyle}`}
              >
                {defaultButtonLink.title}
              </Link>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function formatPostDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const month = d.toLocaleString("pt-BR", { month: "short" });
  const capitalized = month.charAt(0).toUpperCase() + month.slice(1).replace(".", "");
  return `${capitalized}/${d.getFullYear()}`;
}

export const PostCard = ({ post, showImage }: { post: Post; showImage?: boolean | number | string }) => {
  const getAcfField = (key: string) => {
    const sources = [post, post?.acf, post?.acf_fields];
    for (const source of sources) {
      if (!source || typeof source !== "object") continue;

      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const value = (source as any)[key];
        if (value !== undefined && value !== null) return value;
      }

      const altKey = key.includes("-") ? key.replace(/-/g, "_") : key.replace(/_/g, "-");
      if (Object.prototype.hasOwnProperty.call(source, altKey)) {
        const value = (source as any)[altKey];
        if (value !== undefined && value !== null) return value;
      }
    }

    return undefined;
  };

  const getDownloadUrl = () => {
    const fileUrl = getAcfField("file_url");
    if (typeof fileUrl === "string" && fileUrl) return fileUrl;

    const fileField = getAcfField("file");
    if (typeof fileField === "string" && fileField) return fileField;
    if (typeof fileField === "object" && fileField) {
      if (typeof fileField.url === "string" && fileField.url) return fileField.url;
      if (typeof fileField.source_url === "string" && fileField.source_url) return fileField.source_url;
      if (typeof fileField.guid?.rendered === "string" && fileField.guid.rendered) return fileField.guid.rendered;
    }

    return null;
  };

  const rawReadingTime =
    post.reading_time ||
    getAcfField("reading_time") ||
    getAcfField("reading-time") ||
    getAcfField("content_infos")?.reading_time ||
    getAcfField("content-infos")?.["reading-time"] ||
    "";

  const readingTimeLabel = (() => {
    const value = String(rawReadingTime || "").trim();
    if (!value) return "";
    return /min/i.test(value) ? value : `${value} min de leitura`;
  })();

  const contentType = getAcfField("content_type");
  const downloadUrl = getDownloadUrl();
  const isArticleType =
    contentType === true ||
    contentType === 1 ||
    contentType === "1" ||
    contentType === "true";
  const shouldShowDownload = !isArticleType && !!downloadUrl;
  const handleDownloadClick = () => {
    if (!downloadUrl || typeof window === "undefined") return;
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = "";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const forceImage = showImage === true;
  const hasImage = !!post.featured_image;
  const shouldShowImage = (hasImage || forceImage) && showImage !== false && showImage !== 0 && showImage !== "0";
  const imageUrl = post.featured_image || (forceImage ? "/images/conteudos.jpg" : "");
  const formattedDate = formatPostDate(post.date);

  if (!isRenderablePost(post)) return null;

  return (
    <div className="w-full h-full border border-dark-blue rounded-sm flex flex-col bg-white overflow-visible">
      {shouldShowImage && imageUrl && (
        <div className="relative w-full aspect-[343/165] overflow-hidden rounded-t-sm">
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className={`flex flex-col flex-1 py-[2.0625rem] px-4 lg:px-[2.0625rem] ${shouldShowImage ? "gap-y-6" : "gap-y-10"}`}>
        <div className="flex items-center gap-x-2">
          <Image
            src="/icons/doc.svg"
            alt="Ícone Documento"
            width={16}
            height={16}
          />
          <span className="text-red text-xs font-semibold uppercase tracking-wide">
            {post.category || "Conteúdo"}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-y-2">
          <h3 className="text-dark-blue text-xl font-semibold leading-tight">
            {post.title}
          </h3>
          <div
            className="text-low-dark-blue text-sm md:text-base font-normal leading-relaxed line-clamp-3"
            dangerouslySetInnerHTML={{ __html: post.excerpt }}
          />
        </div>

        <div className={`flex items-center ${isArticleType ? 'justify-between': ''} pt-4 `}>
          {isArticleType ? (
            <span className="text-sm text-low-dark-blue">{readingTimeLabel}</span>
          ) : (
            <span className="text-sm text-low-dark-blue"></span>
          )}
          {shouldShowDownload ? (
            <button
              type="button"
              onClick={handleDownloadClick}
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
            <Link
              href={post.link || "#"}
              className="transition-opacity hover:opacity-70"
            >
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
    </div>
  );
};

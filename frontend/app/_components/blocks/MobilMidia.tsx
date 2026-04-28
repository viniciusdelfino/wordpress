"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { wordpressAPI } from "@/app/lib/wordpress-api";

interface MobilModiaProps {
  desc?: string;
}

interface Post {
  id: number;
  title: string;
  excerpt: string;
  featured_image?: string;
  slug?: string;
  url?: string;
  date?: string;
  external_link?: {
    url?: string;
    title?: string;
    target?: string;
  } | null;
  acf_fields?: Record<string, unknown> | null;
  categories?: Array<{ id?: number; name?: string; slug?: string } | number>;
}

const findAnyAcfLink = (value: unknown): { url?: string; target?: string } | null => {
  if (!value || typeof value !== "object") return null;

  if (
    "url" in (value as Record<string, unknown>) &&
    typeof (value as Record<string, unknown>).url === "string"
  ) {
    return {
      url: (value as Record<string, string>).url,
      target:
        typeof (value as Record<string, unknown>).target === "string"
          ? ((value as Record<string, string>).target as string)
          : undefined,
    };
  }

  for (const nested of Object.values(value as Record<string, unknown>)) {
    const found = findAnyAcfLink(nested);
    if (found?.url) return found;
  }

  return null;
};

export default function MobilMidia({ desc }: MobilModiaProps) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await wordpressAPI.getAllPosts();

      if (!Array.isArray(data)) {
        setPosts([]);
        return;
      }

      const noticias = data
        .filter((post: any) => {
          if (!Array.isArray(post?.categories)) return false;

          return post.categories.some((cat: any) => {
            if (typeof cat === "object") {
              return String(cat.slug || "").toLowerCase() === "noticias";
            }
            return false;
          });
        })
        .slice(0, 3)
        .map((post: any) => ({
          id: post.id,
          title: post.title?.rendered || post.title || "",
          excerpt: post.excerpt?.rendered || post.excerpt || "",
          featured_image: post.featured_image || "",
          slug: post.slug || "",
          url: post.url || "",
          date: post.date || "",
          external_link: post.external_link || null,
          acf_fields: post.acf_fields || null,
          categories: post.categories || [],
        }));

      setPosts(noticias);
    };

    fetchPosts();
  }, []);

  const cardPosts = useMemo(() => posts.slice(0, 3), [posts]);

  const formatPostDate = (isoDate?: string) => {
    if (!isoDate) return "";
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(isoDate));
    } catch {
      return "";
    }
  };

  return (
    <section className="mobil-midia relative">
      <div className="container">
        {desc && (
          <div
            dangerouslySetInnerHTML={{ __html: desc }}
            className="prose-headings:text-dark-blue prose-headings:font-semibold prose-p:text-low-dark-blue prose-headings:text-2xl md:prose-headings:text-[1.75rem] lg:prose-headings:text-[2rem] prose-headings:mb-2 prose-p:text-base lg:prose-p:text-lg mb-6 md:mb-8 lg:mb-10"
          />
        )}

        {cardPosts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {cardPosts.map((post, index) => {
                const acfLink = findAnyAcfLink(post.acf_fields);
                const cardHref = post.external_link?.url || "#";
                const cardTarget = post.external_link?.target || acfLink?.target || undefined;

                return (
                <Link
                  key={post.id}
                  href={cardHref}
                  target={cardTarget}
                  rel={cardTarget === "_blank" ? "noopener noreferrer" : undefined}
                  className={`h-full flex flex-col ${index === 2 ? "hidden lg:flex" : ""}`}
                >
                  {post.featured_image && (
                    <div className="relative w-full aspect-[343/180] rounded-lg overflow-hidden">
                      <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover min-h-[12.1875rem]"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-y-[0.625rem] flex-1 mt-4">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-red font-semibold uppercase tracking-wide">
                        <Image
                          src="/icons/noticias.svg"
                          alt="Categoria notícias"
                          width={16}
                          height={16}
                        />
                        <span>Notícias</span>
                      </div>
                      <span className="text-low-dark-blue">{formatPostDate(post.date)}</span>
                    </div>

                    <h3 className="text-dark-blue text-base font-semibold leading-tight line-clamp-2">
                      {post.title}
                    </h3>

                    <div
                      className="text-low-dark-blue text-sm leading-relaxed line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: post.excerpt }}
                    />
                  </div>
                </Link>
              )})}
            </div>

            <div className="mt-6 md:mt-8 lg:mt-10 flex justify-center">
              <Link
                href="/blog/noticias"
                className="text-dark-blue border border-dark-blue min-w-[18.75rem] h-[2.5625rem] rounded-sm px-6 flex items-center justify-center font-semibold text-sm md:text-base transition duration-300 hover:bg-dark-blue hover:text-white"
              >
                Ver todos
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
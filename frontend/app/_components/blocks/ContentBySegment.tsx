"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { wordpressAPI } from "@/app/lib/wordpress-api";

interface Category {
  id: number;
  name: string;
  slug: string;
  ordem?: number | string;
  image?: string | { url: string; alt?: string; width?: number; height?: number };
  acf?: {
    ordem?: number | string;
    image?: string | { url: string; alt?: string; width?: number; height?: number };
  };
}

interface ContentBySegmentProps {
  desc?: string;
}

function parseCategoryOrder(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return Number.POSITIVE_INFINITY;
}

function sortCategoriesByOrder(items: Category[]): Category[] {
  return items
    .map((item, index) => ({
      item,
      index,
      order: parseCategoryOrder(item.acf?.ordem ?? item.ordem),
    }))
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}

export default function ContentBySegment({ desc }: ContentBySegmentProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const editorialTerms = await wordpressAPI.getSegmentoIndustrialTerms();
        if (Array.isArray(editorialTerms) && editorialTerms.length > 0) {
          setCategories(sortCategoriesByOrder(editorialTerms));
          return;
        }
        const categoryTerms = await wordpressAPI.getAllCategories();
        if (Array.isArray(categoryTerms)) {
          setCategories(sortCategoriesByOrder(categoryTerms));
        }
      } catch (error) {
        console.error("Erro ao buscar termos de conteúdo:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="bg-neutral-2 lg:py-10 md:py-8 py-6 w-full content-by-segment">
      <div className="container mx-auto px-4">
        {desc && (
          <div
            className="prose-headings:text-2xl md:prose-headings:text-[28px] lg:prose-headings:text-[32px] prose-headings:font-bold prose-headings:text-dark-blue prose-p:text-base lg:prose-p:text-lg mb-6 md:mb-8 lg:mb-10 text-low-dark-blue"
            dangerouslySetInnerHTML={{ __html: desc }}
          />
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            let imageUrl = "";
            if (cat.acf?.image) {
              if (typeof cat.acf.image === "string") imageUrl = cat.acf.image;
              else if (typeof cat.acf.image === "object" && cat.acf.image.url) imageUrl = cat.acf.image.url;
            } else if (cat.image) {
              if (typeof cat.image === "string") imageUrl = cat.image;
              else if (typeof cat.image === "object" && cat.image.url) imageUrl = cat.image.url;
            }

            return (
              <Link
                key={cat.id}
                href={`/blog/segmento-industrial/${cat.slug}`}
                className="group bg-white rounded-[12px] p-4 flex flex-col items-center justify-center gap-y-5 text-black border border-[#E3E5E6] hover:border-dark-blue hover:text-low-dark-blue transition-all duration-300 min-h-[10.625rem]"
              >
                <div className="relative w-10 h-10">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt=""
                      fill
                      className="object-contain transition-all duration-300 group-hover:[filter:brightness(0)_saturate(100%)_invert(8%)_sepia(61%)_saturate(5427%)_hue-rotate(227deg)_brightness(90%)_contrast(106%)]"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded"></div>
                  )}
                </div>
                <h3 className="text-base text-center leading-tight font-arial">
                  {cat.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
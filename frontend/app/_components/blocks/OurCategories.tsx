"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { wordpressAPI } from "@/app/lib/wordpress-api";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const EMPTY_SELECTED_CATEGORIES: SelectedCategoryTerm[] = [];

interface Category {
  id: number;
  name: string;
  description: string;
  slug: string;
  link: string;
  image_category: string;
  product_category: string;
  order?: number;
  ordem?: string;
}

interface SelectedCategoryTerm {
  term_id?: number;
  id?: number;
  slug: string;
  name?: string;
}

interface OurCategoriesProps {
  content: string;
  show_all_categories?: boolean;
  categories?: SelectedCategoryTerm[];
}

export default function OurCategories({
  content,
  show_all_categories = true,
  categories: selectedCategories = EMPTY_SELECTED_CATEGORIES,
}: OurCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data: any[] = await wordpressAPI.getProductSegments();

        const mappedData: Category[] = data.map((item) => ({
          ...item,
          order: item.order ? Number(item.order) : (item.ordem ? Number(item.ordem) : 999),
        }));

        const industryCard: Category = {
          id: 9999,
          name: "Indústria",
          description:
            "Tenha o máximo de desempenho, proteção e economia de combustível com os nossos lubrificantes",
          slug: "industria",
          link: "/industria",
          image_category: "/images/industria.jpg",
          product_category: "/images/oleo-para-carro.png",
          order: 5,
        };
        const allCategories = [...mappedData, industryCard];
        const sortedCategories = allCategories.sort(
          (a, b) => (a.order || 999) - (b.order || 999)
        );

        if (show_all_categories) {
          setCategories(sortedCategories);
          return;
        }

        const selectedSlugs = selectedCategories
          .map((item) => item?.slug)
          .filter(Boolean);

        if (selectedSlugs.length === 0) {
          setCategories([]);
          return;
        }

        const selectedMap = new Map(sortedCategories.map((item) => [item.slug, item]));
        const filteredBySelection = selectedSlugs
          .map((slug) => selectedMap.get(slug))
          .filter(Boolean) as Category[];

        setCategories(filteredBySelection);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [show_all_categories, selectedCategories]);
  if (loading) return null;

  const isSliderOnDesktop = categories.length > 5;
  const desktopColumnsClass =
    categories.length >= 5
      ? "lg:grid-cols-5"
      : categories.length === 4
        ? "lg:grid-cols-4"
        : categories.length === 3
          ? "lg:grid-cols-3"
          : categories.length === 2
            ? "lg:grid-cols-2"
            : "lg:grid-cols-1";

  const Card = ({ category }: { category: Category }) => (
    <Link
      href={`/${category.slug}`}
      className="flip-card w-full h-[350px] cursor-pointer group block"
    >
      <div className="flip-card-inner w-full h-full relative">
        {/* FRONT CARD */}
        <div className="flip-card-front absolute inset-0 w-full h-full rounded-xl overflow-hidden">
          {category?.image_category && (
            <Image
              src={category.image_category}
              alt={category.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          <Image
            src="/images/bg-blue.png"
            alt=""
            fill
            className="object-cover"
          />

          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
            {category.name && (
              <h3 className="text-white text-xl">{category.name}</h3>
            )}
            <Image
              src="/icons/plus.svg"
              width={32}
              height={32}
              alt="Ver mais"
              className="rounded-full flex items-center justify-center"
            />
          </div>
        </div>

        {/* BACK CARD */}
        <div className="flip-card-back absolute inset-0 w-full h-full bg-dark-blue rounded-lg p-4 flex flex-col overflow-hidden">
          {category.name && (
            <h3 className="text-white text-base md:text-lg lg:text-xl mb-2">
              {category.name}
            </h3>
          )}

          {category.description && (
            <p className="text-white text-sm font-light leading-relaxed mb-4 line-clamp-3">
              {category.description}
            </p>
          )}

          {category.product_category && (
            <div className="relative w-full h-[143px] mb-auto">
              <Image
                src={category.product_category}
                alt={category.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 200px"
              />
            </div>
          )}

          <span className="mt-4 text-white text-sm md:text-base border border-white rounded-sm justify-center flex items-center gap-x-2 min-h-[2rem]">
            Ver produtos
          </span>
        </div>
      </div>
    </Link>
  );

  return (
    <section className="pt-10 bg-white our-categories">
      <div className="container">
        <div 
          className="mb-12 prose-headings:text-2xl prose-headings:md:text-[1.75rem] prose-headings:lg:text-[2rem] prose-headings:font-semibold prose-headings:text-dark-blue prose-headings:mb-4 prose-p:text-low-dark-blue prose-p:text-base prose-p:lg:text-lg"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        <div className="lg:hidden relative pb-16">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={16}
            slidesPerView={1.5}
            breakpoints={{
              640: { slidesPerView: 2.5 },
            }}
            navigation={{
              nextEl: ".swiper-button-next-cat",
              prevEl: ".swiper-button-prev-cat",
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination-cat",
              type: "bullets",
              renderBullet: function (index, className) {
                return '<span class="' + className + ' custom-bullet"></span>';
              },
            }}
            className="w-full"
          >
            {categories.map((cat) => (
              <SwiperSlide key={cat.id}>
                <Card category={cat} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute bottom-0 left-0 w-full flex justify-center items-center gap-x-4">
            <button className="swiper-button-prev-cat w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
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
            <div className="swiper-pagination-cat !static !w-auto flex gap-x-2"></div>
            <button className="swiper-button-next-cat w-10 h-10 flex items-center justify-center border border-dark-blue/30 rounded-md text-dark-blue hover:bg-dark-blue hover:text-white transition-colors">
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

        <div className="hidden lg:block">
          {isSliderOnDesktop ? (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={24}
              slidesPerView={5}
              className="w-full"
            >
              {categories.map((cat) => (
                <SwiperSlide key={cat.id}>
                  <Card category={cat} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${desktopColumnsClass}`}>
              {categories.map((cat) => (
                <div key={cat.id}>
                  {" "}
                  <Card category={cat} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

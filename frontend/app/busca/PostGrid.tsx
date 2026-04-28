"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { PostCard } from "../_components/blocks/Contents";

interface PostGridButton {
  title: string;
  url: string;
  target: string;
}

interface PostGridProps {
  posts: any[];
  titleDesc?: string;
  button?: PostGridButton;
}

function getPostFeaturedImage(post: any): string {
  return (
    post?.featured_image ||
    post?.featured_media_url ||
    post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    post?.acf?.featured_image ||
    ""
  );
}

function sanitizeTitleDescHtml(value?: string): string {
  if (!value || typeof value !== "string") return "";
  return value.replace(/<\/?div[^>]*>/gi, "").trim();
}

export default function PostGrid({ posts, titleDesc, button }: PostGridProps) {
  const visiblePosts = Array.isArray(posts)
    ? posts.slice(0, 3).map((post) => ({
        ...post,
        featured_image: getPostFeaturedImage(post),
      }))
    : [];
  const safeTitleDesc = sanitizeTitleDescHtml(titleDesc);
  const buttonData = button?.url
    ? button
    : { title: "Ver todos os conteúdos", url: "/conteudos", target: "_self" };

  if (visiblePosts.length === 0) return null;

  return (
    <section className="w-full pb-[3.75rem] md:pb-[5.625rem] lg:pb-[3.75rem] pt-8 md:pt-10 lg:pt-15 bg-neutral-2">
      <div className="container mx-auto px-4">
        {safeTitleDesc && (
          <div className="mb-6 md:mb-8 lg:mb-10">
            <div
              className="prose prose-slate max-w-none prose-headings:text-dark-blue prose-headings:font-semibold prose-headings:text-2xl md:prose-headings:text-3xl lg:prose-headings:text-[32px] prose-headings:mb-4 prose-headings:leading-tight prose-p:text-low-dark-blue prose-p:text-base lg:prose-p:text-lg prose-p:max-w-3xl"
              dangerouslySetInnerHTML={{ __html: safeTitleDesc }}
            />
          </div>
        )}

        <div className="hidden lg:grid grid-cols-12 gap-8 items-stretch">
          {visiblePosts.map((post) => (
            <div key={post?.id || post?.slug} className="col-span-4 flex flex-col h-full">
              <PostCard post={post} showImage={true} />
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
              <SwiperSlide key={post?.id || post?.slug} className="!h-auto flex">
                <PostCard post={post} showImage={true} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="mt-[0.875rem] md:mt-4 flex flex-col md:flex-row items-center justify-center md:justify-between gap-[0.875rem] md:gap-4">
            <Link
              href={buttonData.url}
              target={buttonData.target}
              className="order-2 md:order-1 flex items-center justify-center gap-2 rounded-sm transition hover:opacity-90 font-medium text-sm md:text-base h-[2.5rem] bg-red text-white text-center min-w-[17.125rem] w-full md:w-fit"
            >
              {buttonData.title}
            </Link>
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
        </div>

        <Link
          href={buttonData.url}
          target={buttonData.target}
          className="hidden lg:flex mx-auto mt-6 w-fit min-w-[17.125rem] [font-family:Inter,sans-serif] flex items-center justify-center gap-2 rounded-sm transition hover:opacity-90 font-medium text-sm md:text-base h-[2.5rem] bg-red text-white"
        >
          {buttonData.title}
        </Link>
      </div>
    </section>
  );
}

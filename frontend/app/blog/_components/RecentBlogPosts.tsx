'use client';

import Image from "next/image";
import Link from "next/link";

interface RecentBlogPostsProps {
  posts: any[];
  currentPostId?: number;
  categoryLabel?: string;
}

function getPostUrl(post: any): string {
  if (typeof post?.frontend_url === "string" && post.frontend_url) {
    return post.frontend_url;
  }

  if (post?.slug) {
    return `/conteudos/${post.slug}`;
  }

  return "#";
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

function getCategoryLabel(post: any, categoryLabel?: string): string {
  if (categoryLabel) {
    return categoryLabel;
  }

  const editorialTerm = Array.isArray(post?.editorial_terms) ? post.editorial_terms[0] : null;
  const segmentTerm = Array.isArray(post?.segmento_industrial_terms)
    ? post.segmento_industrial_terms[0]
    : null;

  return editorialTerm?.name || segmentTerm?.name || "Categoria";
}

export default function RecentBlogPosts({
  posts,
  currentPostId,
  categoryLabel,
}: RecentBlogPostsProps) {
  const recentPosts = posts
    .filter((post) => post?.id !== currentPostId)
    .slice(0, 3);

  if (recentPosts.length === 0) {
    return null;
  }

  return (
    <section className="recent-blog-posts">
      <h3 className="mb-4 text-sm font-semibold text-dark-blue md:text-base">Posts recentes</h3>
      <div className="grid grid-cols-1 gap-y-1 md:grid-cols-3 md:gap-x-1 md:gap-y-0 lg:grid-cols-1 lg:gap-x-0 lg:gap-y-1">
        {recentPosts.map((post) => {
          const featuredImage = getPostFeaturedImage(post);
          const postUrl = getPostUrl(post);
          const postCategoryLabel = getCategoryLabel(post, categoryLabel).toUpperCase();

          return (
            <Link
              key={post?.id}
              href={postUrl}
              className="block rounded-[0.5rem] h-[86px] border border-[#F3F4F6] p-2"
            >
              <article className="flex items-center gap-4 overflow-hidden rounded-[8px]">
                {featuredImage && (
                  <div className="h-[70px] w-[74px] shrink-0 overflow-hidden rounded-[6px] bg-neutral">
                    <Image
                      src={featuredImage}
                      alt={post?.title}
                      width={74}
                      height={70}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Image
                      src="/icons/doc.svg"
                      alt="Categoria"
                      width={16}
                      height={16}
                    />
                    <span className="line-clamp-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-red">
                      {postCategoryLabel}
                    </span>
                  </div>

                  <h4 className="line-clamp-2 text-sm font-semibold text-dark-blue">
                    {post?.title}
                  </h4>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

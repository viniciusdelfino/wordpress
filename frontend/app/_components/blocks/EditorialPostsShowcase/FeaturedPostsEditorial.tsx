"use client";

import FeaturedPosts from "./components/FeaturedPosts";

interface FeaturedPostsEditorialProps {
  posts?: any[];
}

export default function FeaturedPostsEditorial({
  posts = [],
}: FeaturedPostsEditorialProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="py-6 md:py-8 lg:py-10 featured-posts-editorial">
      <div className="container">
        <FeaturedPosts posts={posts.slice(0, 4)} />
      </div>
    </section>
  );
}

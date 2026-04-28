"use client";

import PostCard from "./PostCard";

interface FeaturedPostsProps {
  posts: any[];
}

export default function FeaturedPosts({ posts }: FeaturedPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  const mainPost = posts[0];
  const sidebarPosts = posts.slice(1, 4);

  return (
    <section className="featured-posts">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Post Grande à Esquerda */}
        <div className="md:col-span-3 lg:col-span-2">
          <PostCard post={mainPost} featured={true} />
        </div>

        {/* Posts Menores à Direita em Coluna */}
        <div className="md:col-span-3 lg:col-span-1 grid grid-cols-1 gap-y-8">
          {sidebarPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              featured={false}
              sidebarFeatured={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

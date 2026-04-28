import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "@/app/_components/ui/Breadcrumb/Breadcrumb";
import { wordpressAPI } from "@/app/lib/wordpress-api";

interface PostData {
  id: number;
  title: string;
  content: string;
  date: string;
  slug: string;
  featured_media?: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text?: string;
    }>;
  };
}

async function getPost(slug: string): Promise<PostData | null> {
  try {
    const posts = await wordpressAPI.getAllPosts();
    if (Array.isArray(posts)) {
      return posts.find((p: any) => p.slug === slug) || null;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar post:", error);
    return null;
  }
}

// 1. Mudamos o tipo do params para Promise
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  
  // 2. Colocamos o await para "esperar" o slug chegar
  const { slug } = await params;
  
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Conteúdos", href: "/conteudos" },
          { label: typeof post.title === 'string' ? post.title : post.title },
        ]}
      />
      <main className="min-h-screen bg-white pb-16">
        <section className="container mx-auto px-4">
            <article>

            <h1 
                className="text-dark-blue text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
                dangerouslySetInnerHTML={{ __html: typeof post.title === 'string' ? post.title : post.title }}
            />

            {featuredImage && (
                <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden">
                <Image 
                    src={featuredImage} 
                    alt="Imagem destaque" 
                    fill 
                    className="object-cover"
                    priority
                />
                </div>
            )}
            {post.content && (
                <div 
                    className="prose prose-lg max-w-none text-low-dark-blue prose-headings:text-dark-blue prose-a:text-red hover:prose-a:text-dark-blue"
                    dangerouslySetInnerHTML={{ __html: typeof post.content === 'string' ? post.content : post.content }}
                />
            )}
            </article>
        </section>
      </main>
    </>
  );
}
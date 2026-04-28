import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { wordpressAPI } from "@/app/lib/wordpress-api";
import BlogPostSingleView from "@/app/blog/_components/BlogPostSingleView";
import { normalizePostData } from "@/app/blog/utils";

interface IndustrialSegmentPostPageProps {
  params: Promise<{ slug: string; post: string }>;
}

function resolveIndustrialContextTerm(post: any, slug: string) {
  const segmentoTerms = post?.segmento_industrial_terms || [];
  return segmentoTerms.find((term: any) => term?.slug === slug) || null;
}

function stripHtml(value?: string): string {
  if (!value) return "";
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}


export async function generateMetadata({ params }: IndustrialSegmentPostPageProps): Promise<Metadata> {
  const { post: postSlug } = await params;
  const post = await wordpressAPI.getPostBySlug(postSlug);

  if (!post) {
    return {
      title: "Blog",
    };
  }

  return {
    title: post?.title || "Blog",
    description: stripHtml(post?.excerpt || post?.content || "").slice(0, 160),
  };
}

export default async function IndustrialSegmentPostPage({ params }: IndustrialSegmentPostPageProps) {
  const { slug, post: postSlug } = await params;

  const post = await wordpressAPI.getPostBySlug(postSlug);

  if (!post) {
    notFound();
  }

  const contextTerm = resolveIndustrialContextTerm(post, slug);

  if (!contextTerm) {
    notFound();
  }

  const postTitle = post?.title || "Sem titulo";

  return (
    <>
      <BlogPostSingleView
        post={post}
        postTitle={postTitle}
        termName={contextTerm?.name || "Categoria"}
        termUrl={`/blog/segmento-industrial/${contextTerm.slug}`}
        contextTerm={contextTerm}
      />      
    </>
  );
}

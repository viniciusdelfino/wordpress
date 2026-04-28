import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { wordpressAPI } from "@/app/lib/wordpress-api";
import BlogPostSingleView from "@/app/blog/_components/BlogPostSingleView";
import { normalizePostData } from "@/app/blog/utils";

interface BlogPostPageProps {
  params: Promise<{ slug: string; post: string }>;
}

function resolveContextTerm(post: any, slug: string) {
  const editorialTerms = post?.editorial_terms || [];
  const segmentoTerms = post?.segmento_industrial_terms || [];
  const availableTerms = [...editorialTerms, ...segmentoTerms];

  return availableTerms.find((term: any) => term?.slug === slug) || null;
}

function getTermBlogUrl(term: any): string {
  if (term?.taxonomy === "segmento_industrial") {
    return `/blog/segmento-industrial/${term.slug}`;
  }

  return `/blog/${term.slug}`;
}

function stripHtml(value?: string): string {
  if (!value) return "";
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}


export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug, post: postSlug } = await params;

  const post = await wordpressAPI.getPostBySlug(postSlug);

  if (!post) {
    notFound();
  }

  const contextTerm = resolveContextTerm(post, slug);

  if (!contextTerm) {
    notFound();
  }

  const postTitle = post?.title || "Sem titulo";
  const termBlogUrl = getTermBlogUrl(contextTerm);
  const taxonomy = contextTerm?.taxonomy === "segmento_industrial" ? "segmento_industrial" : "editorial";
  const termPosts = await wordpressAPI.getPostsByTaxonomyTerm(taxonomy, Number(contextTerm?.id || 0));
  const recentPosts = termPosts
    .filter((item: any) => item?.id !== post?.id)
    .slice(0, 3)
    .map(normalizePostData);

  return (
    <BlogPostSingleView
      post={post}
      postTitle={postTitle}
      termName={contextTerm?.name || "Categoria"}
      termUrl={termBlogUrl}
      contextTerm={contextTerm}
      recentPosts={recentPosts}
    />
  );
}
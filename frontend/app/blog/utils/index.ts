/**
 * Shared blog utilities — single source of truth.
 * Import from here instead of duplicating across components.
 */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function normalizePostData(post: any): any {
  return {
    ...post,
    title:
      typeof post?.title === "string"
        ? post.title
        : post?.title?.rendered || "",
    excerpt:
      typeof post?.excerpt === "string"
        ? post.excerpt
        : post?.excerpt?.rendered || "",
    featured_image: post?.featured_image || post?.featured_media_url || null,
    frontend_url: post?.frontend_url || `/conteudos/${post?.slug}`,
    slug: post?.slug || "",
    id: post?.id,
  };
}

// ── Ebook helpers ──────────────────────────────────────────────────────────

export function getEbookFileUrl(post: any): string | null {
  const sources = [post, post?.acf, post?.acf_fields];

  for (const source of sources) {
    if (!source) continue;

    const fileUrl = source.file_url;
    if (typeof fileUrl === "string" && fileUrl) return fileUrl;

    const file = source.file;
    if (typeof file === "string" && file) return file;

    if (typeof file === "object" && file) {
      if (typeof file.url === "string" && file.url) return file.url;
      if (typeof file.source_url === "string" && file.source_url)
        return file.source_url;
      if (typeof file.guid?.rendered === "string" && file.guid.rendered)
        return file.guid.rendered;
    }
  }

  return null;
}

export function getEbookFileName(post: any): string {
  const sources = [post, post?.acf, post?.acf_fields];

  for (const source of sources) {
    if (!source) continue;

    const ebookTitle =
      source.ebook_name || source.ebook_title || source.file_name;
    if (typeof ebookTitle === "string" && ebookTitle.trim())
      return ebookTitle.trim();

    const file = source.file;
    if (typeof file === "object" && file) {
      const title = file.title || file.name || file.filename;
      if (typeof title === "string" && title.trim()) {
        return title
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]/g, " ")
          .trim();
      }
    }
  }

  const fileUrl = getEbookFileUrl(post);
  if (fileUrl) {
    const segments = fileUrl.split("/");
    const last = segments[segments.length - 1] || "";
    const decoded = decodeURIComponent(last);
    const withoutExt = decoded
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]/g, " ")
      .trim();
    if (withoutExt) return withoutExt;
  }

  return "";
}

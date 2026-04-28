export type SortOption = "recente" | "antigo" | "a-z";
export type ContentTypeOption = "todos" | "artigo" | "ebook";
export type FilterStrategy = "editorial_children" | "industrial_segment";

export interface FilterOptions {
  subject?: string;
  contentType?: ContentTypeOption;
  sortBy?: SortOption;
}

export interface FilterStrategyConfig {
  strategy: FilterStrategy;
  editorialTermName?: string;
  editorialTermSlug?: string;
}

function normalizeSlug(value?: string): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

function normalizeText(value?: string): string {
  if (!value) return "";
  return String(value).trim();
}

function getEmbeddedTerms(post: any): any[] {
  const embedded = post?._embedded?.["wp:term"]?.flat() || [];
  if (embedded.length > 0) {
    return embedded;
  }

  const directTerms = [
    ...(Array.isArray(post?.editorial) ? post.editorial : []),
    ...(Array.isArray(post?.editorial_terms) ? post.editorial_terms : []),
    ...(Array.isArray(post?.segmento_industrial) ? post.segmento_industrial : []),
    ...(Array.isArray(post?.segmento_industrial_terms)
      ? post.segmento_industrial_terms
      : []),
  ];

  return directTerms;
}

function getEmbeddedEditorialTerms(post: any): any[] {
  const embedded = getEmbeddedTerms(post).filter(
    (term: any) => term?.taxonomy === "editorial",
  );

  const direct = [
    ...(Array.isArray(post?.editorial_terms) ? post.editorial_terms : []),
    ...(Array.isArray(post?.acf?.editorial_terms) ? post.acf.editorial_terms : []),
    ...(Array.isArray(post?.acf_fields?.editorial_terms)
      ? post.acf_fields.editorial_terms
      : []),
  ];

  return [...embedded, ...direct];
}

function getEmbeddedIndustrialSegments(post: any): any[] {
  const embedded = getEmbeddedTerms(post).filter(
    (term: any) => term?.taxonomy === "segmento_industrial",
  );

  const direct = [
    ...(Array.isArray(post?.segmento_industrial_terms)
      ? post.segmento_industrial_terms
      : []),
    ...(Array.isArray(post?.acf?.segmento_industrial_terms)
      ? post.acf.segmento_industrial_terms
      : []),
    ...(Array.isArray(post?.acf_fields?.segmento_industrial_terms)
      ? post.acf_fields.segmento_industrial_terms
      : []),
  ];

  return [...embedded, ...direct];
}

function getPostSubjectsByEditorialChildren(
  post: any,
  parentEditorialSlug?: string
): string[] {
  const editorialTerms = getEmbeddedEditorialTerms(post);
  if (editorialTerms.length === 0) {
    return [];
  }

  const normalizedParentSlug = normalizeSlug(parentEditorialSlug);
  const childTerms = editorialTerms.filter(
    (term: any) =>
      (typeof term?.parent === "number" && term.parent > 0) ||
      (Array.isArray(term?._links?.up) && term._links.up.length > 0),
  );

  const termsToUse = childTerms.length > 0 ? childTerms : editorialTerms;

  return termsToUse
    .filter((term: any) => {
      const termSlug = normalizeSlug(term?.slug);
      if (!termSlug) return false;
      if (!normalizedParentSlug) return true;
      return termSlug !== normalizedParentSlug;
    })
    .map((term: any) => normalizeText(term?.name))
    .filter(Boolean);
}

function getTermNameListFromArray(values: any[]): string[] {
  return values
    .map((value) => {
      if (typeof value === "string") return normalizeText(value);
      if (value && typeof value === "object") return normalizeText(value?.name || value?.label);
      return "";
    })
    .filter(Boolean);
}

function getNestedField(source: any, key: string): any {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  if (Object.prototype.hasOwnProperty.call(source, key)) {
    return source[key];
  }

  const altKey = key.includes("-") ? key.replace(/-/g, "_") : key.replace(/_/g, "-");
  if (Object.prototype.hasOwnProperty.call(source, altKey)) {
    return source[altKey];
  }

  return undefined;
}

function getAcfField(post: any, key: string): any {
  const sources = [post, post?.acf, post?.acf_fields];

  for (const source of sources) {
    const value = getNestedField(source, key);
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
}

function hasDownloadableFile(post: any): boolean {
  const fileUrl = getAcfField(post, "file_url");
  if (typeof fileUrl === "string" && fileUrl) {
    return true;
  }

  const fileField = getAcfField(post, "file");
  if (typeof fileField === "string" && fileField) {
    return true;
  }

  if (typeof fileField === "object" && fileField) {
    if (typeof fileField.url === "string" && fileField.url) {
      return true;
    }

    if (typeof fileField.source_url === "string" && fileField.source_url) {
      return true;
    }

    if (typeof fileField.guid?.rendered === "string" && fileField.guid.rendered) {
      return true;
    }
  }

  return false;
}

/**
 * Allowed industrial segment slugs (must match backend allowed segments)
 */
const INDUSTRIAL_SEGMENT_ALLOWED_SLUGS = new Set([
  "caminhoes",
  "equipamentos-agricolas",
]);

function getPostSubjectsByIndustrialSegment(
  post: any,
  parentEditorialSlug?: string,
): string[] {
  const embeddedSegments = getEmbeddedIndustrialSegments(post);
  if (embeddedSegments.length > 0) {
    return embeddedSegments
      .map((term: any) => normalizeText(term?.name || term?.label))
      .filter(Boolean);
  }

  const directSegments = [
    ...(Array.isArray(post?.segmento_industrial) ? post.segmento_industrial : []),
    ...(Array.isArray(post?.segmento_industrial_terms)
      ? post.segmento_industrial_terms
      : []),
    ...(Array.isArray(post?.acf?.segmento_industrial) ? post.acf.segmento_industrial : []),
    ...(Array.isArray(post?.acf?.segmento_industrial_terms)
      ? post.acf.segmento_industrial_terms
      : []),
    ...(Array.isArray(post?.acf_fields?.segmento_industrial)
      ? post.acf_fields.segmento_industrial
      : []),
    ...(Array.isArray(post?.acf_fields?.segmento_industrial_terms)
      ? post.acf_fields.segmento_industrial_terms
      : []),
  ];

  const directSubjects = getTermNameListFromArray(directSegments);

  if (directSubjects.length > 0) {
    return directSubjects;
  }

  const editorialTerms = getEmbeddedEditorialTerms(post);
  const normalizedParentSlug = normalizeSlug(parentEditorialSlug);

  return editorialTerms
    .filter((term: any) => {
      const termSlug = normalizeSlug(term?.slug);
      if (!termSlug) return false;
      // Excluir o parent
      if (normalizedParentSlug && termSlug === normalizedParentSlug) {
        return false;
      }
      // Incluir apenas slugs permitidos
      return INDUSTRIAL_SEGMENT_ALLOWED_SLUGS.has(termSlug);
    })
    .map((term: any) => normalizeText(term?.name))
    .filter(Boolean);
}

function getPostContentType(post: any): "artigo" | "ebook" {
  if (typeof post?.is_ebook === "boolean") {
    return post.is_ebook ? "ebook" : "artigo";
  }

  const contentType = getAcfField(post, "content_type");
  const hasFile = hasDownloadableFile(post);

  if (typeof contentType === "string" && contentType.toLowerCase() === "ebook") {
    return hasFile ? "ebook" : "artigo";
  }

  if (contentType === undefined || contentType === null || contentType === "") {
    return hasFile ? "ebook" : "artigo";
  }

  const isArticle =
    contentType === true ||
    contentType === 1 ||
    contentType === "1" ||
    contentType === "true";

  const isExplicitFalse =
    contentType === false ||
    contentType === 0 ||
    contentType === "0" ||
    contentType === "false";

  if (isArticle) {
    return "artigo";
  }

  if (isExplicitFalse && hasFile) {
    return "ebook";
  }

  return "artigo";
}

/**
 * Get subjects based on strategy
 */
function getPostSubjects(
  post: any,
  config: FilterStrategyConfig
): string[] {
  if (config.strategy === "editorial_children") {
    const parentSlug = config.editorialTermSlug || config.editorialTermName;
    return getPostSubjectsByEditorialChildren(post, parentSlug);
  }

  if (config.strategy === "industrial_segment") {
    const parentSlug = config.editorialTermSlug || config.editorialTermName;
    return getPostSubjectsByIndustrialSegment(post, parentSlug);
  }

  return [];
}

/**
 * Get available subjects from posts based on strategy
 */
export function getAvailableSubjects(
  posts: any[],
  config: FilterStrategyConfig
): string[] {
  const unique = new Set<string>();

  posts.forEach((post) => {
    getPostSubjects(post, config).forEach((subject) => unique.add(subject));
  });

  return Array.from(unique).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/**
 * Filtra e ordena posts de acordo com as opções
 */
export function filterAndSortPosts(
  posts: any[],
  options: FilterOptions = {},
  config: FilterStrategyConfig
): any[] {
  let filtered = [...posts];

  // Filtrar por assunto/segmento
  if (options.subject && options.subject !== "todos") {
    const target = options.subject.toLowerCase();
    filtered = filtered.filter((post) => {
      const subjects = getPostSubjects(post, config).map((subject) =>
        subject.toLowerCase(),
      );
      return subjects.includes(target);
    });
  }

  // Filtrar por tipo de conteúdo (artigo/ebook)
  if (options.contentType && options.contentType !== "todos") {
    filtered = filtered.filter(
      (post) => getPostContentType(post) === options.contentType,
    );
  }

  // Ordenar posts
  const sortBy = options.sortBy || "recente";

  switch (sortBy) {
    case "recente":
      filtered.sort(
        (a, b) =>
          new Date(b?.date || "").getTime() - new Date(a?.date || "").getTime()
      );
      break;

    case "antigo":
      filtered.sort(
        (a, b) =>
          new Date(a?.date || "").getTime() - new Date(b?.date || "").getTime()
      );
      break;

    case "a-z":
      filtered.sort((a, b) => {
        const titleA = (a?.title?.rendered || a?.title || "").toLowerCase();
        const titleB = (b?.title?.rendered || b?.title || "").toLowerCase();
        return titleA.localeCompare(titleB);
      });
      break;

    default:
      break;
  }

  return filtered;
}

/**
 * Divide posts em destaque (4 primeiros) e resto
 */
export function separateFeaturedPosts(posts: any[]): {
  featured: any[];
  remaining: any[];
} {
  return {
    featured: posts.slice(0, 4),
    remaining: posts.slice(4),
  };
}

/**
 * Pagina posts com offset
 */
export function paginatePosts(posts: any[], pageSize: number, page: number): any[] {
  const offset = (page - 1) * pageSize;
  return posts.slice(offset, offset + pageSize);
}

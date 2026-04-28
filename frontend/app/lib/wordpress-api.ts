import { MenuItem, Page } from "../types/settings";
import { StoreSearchResult } from "../types/store-types";
import api from "./api";
import { salesforceClient } from "./salesforce-client";

function cacheConfig(revalidateSeconds: number): RequestInit {
  const isQA =
    process.env.VERCEL_ENV === "preview" ||
    process.env.NEXT_PUBLIC_SITE_URL?.includes("qa") ||
    process.env.NEXT_PUBLIC_SITE_URL?.includes("vercel.app");

  return { next: { revalidate: isQA ? 0 : revalidateSeconds } };
}

export interface SiteInfo {
  name: string;
  description: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: any;
}

interface MenuLocationData {
  items: MenuItem[];
}

class WordPressAPI {
  // Buscar menu por localização
  async getMenu(location: string): Promise<MenuItem[]> {
    try {
      const response = await api.get<ApiResponse<MenuLocationData>>(
        `/moove/v1/menu/${location}`,
      );
      return response.data.data?.items || [];
    } catch (error: any) {
      if (error.code === "ERR_NETWORK") {
        console.error(
          `Network Error: Verifique se a URL da API está correta e acessível.`,
        );
      }
      if (error.response?.status === 404) {
        console.warn(
          `Menu location "${location}" not found, returning empty array`,
        );
        return [];
      }
      console.error(`Error fetching menu "${location}":`, error);
      return [];
    }
  }

  // Buscar menu por nome
  async getMenuByName(name: string): Promise<MenuItem[]> {
    try {
      const response = await api.get<ApiResponse<MenuLocationData>>(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/menu/name/${name}`,
      );
      return response.data.data?.items || [];
    } catch (error: any) {
      if (error.code === "ERR_NETWORK") {
        console.error(
          `Network Error: Verifique se a URL da API está correta e acessível.`,
        );
      }
      if (error.response?.status === 404) {
        console.warn(`Menu name "${name}" not found, returning empty array`);
        return [];
      }
      console.error(`Error fetching menu "${name}":`, error);
      return [];
    }
  }

  // Buscar todos os menus
  async getAllMenus() {
    try {
      const response = await api.get<ApiResponse<any[]>>("/moove/v1/menus");
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching all menus:", error);
      return [];
    }
  }

  // Buscar página por slug
  async getPage(slug: string): Promise<Page | null> {
    try {
      const response = await api.get<ApiResponse<Page>>(
        `/moove/v1/page/slug/${slug}`,
      );
      return response.data.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }

      console.error(`Error fetching page "${slug}":`, error);
      return null;
    }
  }

  async getProductSegments() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/product-segments`,
        cacheConfig(3600),
      );

      if (!response.ok) {
        console.warn(
          `Failed to fetch product segments. Status: ${response.status}`,
        );
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching product segments:", error);
      return [];
    }
  }

  async getProductBySlug(slug: string): Promise<any | null> {
    if (!process.env.NEXT_PUBLIC_WORDPRESS_API_URL) return null;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/product/${slug}`,
        cacheConfig(60),
      );

      if (!response.ok) {
        return null;
      }

      const json = await response.json();
      if (!json?.success || !json?.data) {
        return null;
      }

      return json.data;
    } catch (error) {
      console.error(`Error fetching product by slug "${slug}":`, error);
      return null;
    }
  }

  async getProductSegmentsBySlug(slug: string) {
    if (!process.env.NEXT_PUBLIC_WORDPRESS_API_URL) return null;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/product-segments/${slug}`,
        cacheConfig(60),
      );

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching product segment "${slug}":`, error);
      return null;
    }
  }

  async getApplicationPage(segmentSlug: string, applicationSlug: string): Promise<any | null> {
    if (!process.env.NEXT_PUBLIC_WORDPRESS_API_URL) return null;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/application-page/${segmentSlug}/${applicationSlug}`,
        cacheConfig(300),
      );

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(
        `Error fetching application page "${segmentSlug}/${applicationSlug}":`,
        error,
      );
      return null;
    }
  }

  async getProductAcfData(id: string): Promise<any | null> {
    if (!process.env.NEXT_PUBLIC_WORDPRESS_API_URL) {
      console.error(
        `CRITICAL: NEXT_PUBLIC_WORDPRESS_API_URL is not defined in getProductAcfData for id: ${id}`,
      );
      return null;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/product/${id}`,
        cacheConfig(60),
      );

      if (!response.ok) {
        return null;
      }
      const json = await response.json();
      return json.data?.acf || null;
    } catch (error) {
      console.error(`Error fetching ACF data for product "${id}":`, error);
      return null;
    }
  }

  // Buscar indústria por slug
  async getIndustry(slug: string): Promise<any | null> {
    if (!process.env.NEXT_PUBLIC_WORDPRESS_API_URL) return null;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/industry/${slug}`,
        cacheConfig(3600),
      );

      if (!response.ok) return null;
      const json = await response.json();
      return json.data || null;
    } catch (error) {
      console.error(`Error fetching industry "${slug}":`, error);
      return null;
    }
  }

  // Buscar todas as indústrias
  async getIndustries(): Promise<any[]> {
    if (!process.env.NEXT_PUBLIC_WORDPRESS_API_URL) return [];

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/industries`,
        cacheConfig(3600),
      );

      if (!response.ok) return [];
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error("Error fetching industries:", error);
      return [];
    }
  }

  async getAllPosts(perPage: number = 100): Promise<any[]> {
    try {
      const response =
        await api.get<ApiResponse<{ posts: any[] }>>(
          `/moove/v1/posts?per_page=${perPage}`,
        );
      return response.data?.data?.posts || [];
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  }

  async getPostBySlug(slug: string): Promise<any | null> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `/moove/v1/post/slug/${slug}`,
      );
      return response.data?.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }

      console.error(`Error fetching post by slug "${slug}":`, error);
      return null;
    }
  }
  
  async getEvents(): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<{ events: any[] }>>("/moove/v1/events");
      return response.data?.data?.events || [];
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  }

  async getPostsByQuery(query: string) {
    const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "";
    if (!baseUrl) {
      console.error("NEXT_PUBLIC_WORDPRESS_API_URL não está configurada");
      return [];
    }

    const res = await fetch(`${baseUrl}/wp/v2/posts?search=${encodeURIComponent(query)}&_embed`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id,
      title: item.title?.rendered || "",
      excerpt: item.excerpt?.rendered || "",
      category: item._embedded?.["wp:term"]?.[0]?.[0]?.name || "Conteúdo",
      featured_image:
        item._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
        item.featured_media_url ||
        "",
      date: item.date || "",
      acf: item.acf || {},
      acf_fields: item.acf_fields || item.acf || {},
      reading_time:
        item.acf?.reading_time ||
        item.acf?.["reading-time"] ||
        item.acf_fields?.reading_time ||
        item.acf_fields?.["reading-time"] ||
        "",
      content_type:
        item.content_type ??
        item.acf?.content_type ??
        item.acf_fields?.content_type,
      file: item.file ?? item.acf?.file ?? item.acf_fields?.file,
      file_url:
        item.file_url ??
        item.acf?.file_url ??
        item.acf_fields?.file_url,
      link: item.slug ? `/conteudos/${item.slug}` : "#",
    }));
  }

  async getAllCategories(): Promise<any[]> {
    try {
      const response = await api.get<any>(
        `/wp/v2/categories?per_page=100&acf_format=standard`,
      );
      return response.data || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  async getEditorialTerms(): Promise<any[]> {
    try {
      const response = await api.get<any>(
        `/wp/v2/editorial?per_page=100&acf_format=standard`,
      );
      return response.data || [];
    } catch (error) {
      console.error("Error fetching editorial terms:", error);
      return [];
    }
  }

  async getSegmentoIndustrialTerms(): Promise<any[]> {
    try {
      const response = await api.get<any>(
        `/wp/v2/segmento_industrial?per_page=100&acf_format=standard`,
      );
      return response.data || [];
    } catch (error) {
      console.error("Error fetching segmento industrial terms:", error);
      return [];
    }
  }

  async getPostsByTaxonomyTerm(
    taxonomy: "editorial" | "segmento_industrial",
    termId: number,
  ): Promise<any[]> {
    try {
      const response = await api.get<any>(
        `/wp/v2/posts?per_page=100&${taxonomy}=${termId}&_embed&acf_format=standard`,
      );
      const posts = response.data || [];

      // Hydrate file IDs and featured media IDs with URLs.
      const fileIds = Array.from(
        new Set(
          posts
            .map((post: any) => post?.acf?.file)
            .filter((value: any) =>
              typeof value === "number" || /^\d+$/.test(String(value || "")),
            )
            .map((value: any) => Number(value)),
        ),
      );

      const featuredMediaIds = Array.from(
        new Set(
          posts
            .map((post: any) => post?.featured_media)
            .filter((value: any) =>
              typeof value === "number" || /^\d+$/.test(String(value || "")),
            )
            .map((value: any) => Number(value)),
        ),
      );

      const mediaIds = Array.from(new Set([...fileIds, ...featuredMediaIds]));

      if (mediaIds.length === 0) {
        return posts;
      }

      const mediaEntries = await Promise.all(
        mediaIds.map(async (mediaId: number) => {
          try {
            const mediaResponse = await api.get<any>(`/wp/v2/media/${mediaId}`);
            return [mediaId, mediaResponse.data?.source_url || null] as const;
          } catch {
            return [mediaId, null] as const;
          }
        }),
      );

      const mediaMap = new Map<number, string>();
      mediaEntries.forEach(([fileId, url]) => {
        if (url) {
          mediaMap.set(fileId, url);
        }
      });

      return posts.map((post: any) => {
        const rawFile = post?.acf?.file;
        const numericFileId =
          typeof rawFile === "number"
            ? rawFile
            : /^\d+$/.test(String(rawFile || ""))
              ? Number(rawFile)
              : null;

        return {
          ...post,
          featured_media_url:
            mediaMap.get(Number(post?.featured_media || 0)) ||
            post?.featured_media_url ||
            null,
          acf: {
            ...post.acf,
            file_id: numericFileId || post?.acf?.file_id || null,
            file_url: numericFileId
              ? mediaMap.get(numericFileId) || null
              : post?.acf?.file_url || null,
          },
        };
      });
    } catch (error) {
      console.error("Error fetching posts by taxonomy term:", error);
      return [];
    }
  }

  async getTermBySlugAndTaxonomy(
    taxonomy: "editorial" | "segmento_industrial",
    slug: string,
  ): Promise<any | null> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `/moove/v1/term/${taxonomy}/${slug}`,
      );
      return response.data?.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error(`Error fetching term "${slug}" from "${taxonomy}":`, error);
      return null;
    }
  }

  async getTermById(
    taxonomy: "editorial" | "segmento_industrial",
    termId: number,
  ): Promise<any | null> {
    try {
      const endpoint =
        taxonomy === "editorial"
          ? `/moove/v1/editorial-term/${termId}`
          : `/moove/v1/segmento-industrial-term/${termId}`;

      const response = await api.get<ApiResponse<any>>(endpoint);
      return response.data?.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error(`Error fetching term ${termId} from "${taxonomy}":`, error);
      return null;
    }
  }

  // Buscar informações gerais do site (título, descrição)
  async getSiteInfo(): Promise<SiteInfo | null> {
    try {
      const response = await api.get<ApiResponse<any>>("/moove/v1/site/info");
      return response.data.data?.site || response.data.data || null;
    } catch (error) {
      console.error("Error fetching site info:", error);
      return null;
    }
  }

  async getSalesforceCategories(): Promise<any[]> {
    const result = await salesforceClient.getCategories();
    return result.categories;
  }

  // Todos os produtos no SalesForce

  async getAllProducts() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/salesforce/proxy/products`,
      { cache: "no-store" }
    );

    if (!res.ok) return [];

    const data = await res.json();
    const products = data?.products || [];

    return (data?.products || []).map((item: any) => ({
      id: item.id,
      category_slug: item.category_slug,
      B2BProductName__c: item.B2BProductName__c,
      Description: item.Description,
      image: item.DisplayUrl || '',
      slug: item.slug,
      sku: item.StockKeepingUnit,
      brand: item.Brand__c,
      Viscosity__c: item.Viscosity__c,
      IndustryClassifications__c: item.IndustryClassifications__c,
      ProductApplication__c: item.ProductApplication__c,
      packing: item.Packing__c,
      business_line: item.BusinessLine__c,
      variations: [
        {
          sku: item.acf?.sku || "unknown",
          viscosity: item.acf?.viscosidade || "",
          packing: item.acf?.embalagem || ""
        }
      ]
    }));
  }

  // Produtos por categoria Salesforce
  async getSalesforceProductsByCategory(
    categorySlug: string,
    page: number = 1,
  ): Promise<any> {
    try {
      return await salesforceClient.getProductsByCategory(categorySlug, page);
    } catch (error) {
      console.error(`Error fetching products for ${categorySlug}:`, error);
      return null;
    }
  }

  // Produto individual
  async getSalesforceProduct(sku: string): Promise<any> {
    try {
      return await salesforceClient.getProduct(sku);
    } catch (error) {
      console.error(`Error fetching product ${sku}:`, error);
      return null;
    }
  }

  // Buscar filtros disponíveis para um segmento (Baseado em Meta Data)
  async getFiltersBySegment(
    segmentSlug: string,
    searchParams?: any,
  ): Promise<any> {
    if (!process.env.NEXT_PUBLIC_WORDPRESS_API_URL) {
      console.error("ERRO: NEXT_PUBLIC_WORDPRESS_API_URL não definida");
      return null;
    }

    const params = new URLSearchParams();
    // Passa a aplicação selecionada para filtrar as tecnologias/viscosidades dependentes
    if (searchParams?.aplicacao)
      params.append("aplicacao", searchParams.aplicacao);

    if (searchParams?.tecnologia)
      params.append("tecnologia", searchParams.tecnologia);
    if (searchParams?.ponto_lubrificacao)
      params.append("ponto_lubrificacao", searchParams.ponto_lubrificacao);
    if (searchParams?.espessante)
      params.append("espessante", searchParams.espessante);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/filters/${segmentSlug}?${params.toString()}`,
        cacheConfig(300),
      );

      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(
        `Error fetching filters for segment "${segmentSlug}":`,
        error,
      );
      return null;
    }
  }

  // Buscar produtos filtrados por segmento
  async getProductsBySegment(slug: string, searchParams: any): Promise<any> {
    if (!process.env.NEXT_PUBLIC_WORDPRESS_API_URL) return null;

    const params = new URLSearchParams();
    if (searchParams.page) params.append("page", searchParams.page);
    if (searchParams.viscosidade)
      params.append("viscosidade", searchParams.viscosidade);
    if (searchParams.tecnologia)
      params.append("tecnologia", searchParams.tecnologia);
    if (searchParams.aplicacao)
      params.append("aplicacao", searchParams.aplicacao);
    if (searchParams.ponto_lubrificacao)
      params.append("ponto_lubrificacao", searchParams.ponto_lubrificacao);
    if (searchParams.espessante)
      params.append("espessante", searchParams.espessante);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/products/${slug}?${params.toString()}`,
        cacheConfig(0),
      );

      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error(`Error fetching filtered products for ${slug}:`, e);
      return null;
    }
  }

  // Buscar produtos no Salesforce por termo de busca
  async searchProducts(query: string): Promise<any[]> {
    if (!process.env.NEXT_PUBLIC_WORDPRESS_API_URL) {
      console.error("NEXT_PUBLIC_WORDPRESS_API_URL não está configurada");
      return [];
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/salesforce/proxy/products?search=${encodeURIComponent(query)}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        console.warn(`Erro ao buscar produtos: ${response.status}`);
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.products || [];
    } catch (error) {
      console.error(`Erro ao buscar produtos no Salesforce:`, error);
      return [];
    }
  }

  // Buscar aplicações disponíveis
  async getApplications(): Promise<any[]> {
    if (!process.env.NEXT_PUBLIC_WORDPRESS_API_URL) {
      console.error("NEXT_PUBLIC_WORDPRESS_API_URL não está configurada");
      return [];
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/applications`,
        cacheConfig(24 * 60 * 60),
      );

      if (!response.ok) {
        console.warn(`Erro ao buscar aplicações: ${response.status}`);
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Erro ao buscar aplicações:`, error);
      return [];
    }
  }

  // Buscar todos os produtos de uma aplicação específica
  async getProductsByApplication(applicationSlug: string): Promise<any[]> {
    if (!process.env.NEXT_PUBLIC_WORDPRESS_API_URL) {
      console.error("NEXT_PUBLIC_WORDPRESS_API_URL não está configurada");
      return [];
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/products/by-application/${applicationSlug}`,
        cacheConfig(24 * 60 * 60),
      );

      if (!response.ok) {
        console.warn(`Erro ao buscar produtos da aplicação: ${response.status}`);
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Erro ao buscar produtos da aplicação:`, error);
      return [];
    }
  }

  async getProductsByIndustriesSegmentTerm(termIds: Array<string | number>, limit?: number): Promise<any[]> {
    if (!process.env.NEXT_PUBLIC_WORDPRESS_API_URL) {
      console.error("NEXT_PUBLIC_WORDPRESS_API_URL não está configurada");
      return [];
    }

    const normalizedIds = Array.from(
      new Set(
        termIds
          .map((termId) => Number(termId))
          .filter((termId) => Number.isFinite(termId) && termId > 0),
      ),
    );

    if (normalizedIds.length === 0) {
      return [];
    }

    const params = new URLSearchParams();
    params.append("term_ids", normalizedIds.join(","));

    if (limit && limit > 0) {
      params.append("limit", String(limit));
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/products/by-industries-segment-term?${params.toString()}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data?.data?.products || [];
    } catch (error) {
      console.error("Erro ao buscar produtos por industries_segment_term:", error);
      return [];
    }
  }

  private normalizeString(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  // Calcular distância de Levenshtein entre duas strings (tolerância a erros de digitação)
  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    // Matriz de distâncias
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    // Inicializar primeira coluna e linha
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // Preencher a matriz
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(
            dp[i - 1][j],     // Deleção
            dp[i][j - 1],     // Inserção
            dp[i - 1][j - 1]  // Substituição
          );
        }
      }
    }

    return dp[m][n];
  }

  private calculateMatchScore(query: string, term: string): number {
    const q = this.normalizeString(query);
    const t = this.normalizeString(term);

    let score = 0;

    if (q === t) return 100;
    if (t.includes(q) || q.includes(t)) score += 80;

    const qWords = q.split(/\s+/).filter(Boolean);
    const tWords = t.split(/\s+/).filter(Boolean);

    for (const qWord of qWords) {
      if (qWord.length < 2) continue;
      for (const tWord of tWords) {
        if (qWord === tWord) {
          score += 90;
        } else if (tWord.includes(qWord) || qWord.includes(tWord)) {
          score += 70;
        } else {
          const distance = this.levenshteinDistance(qWord, tWord);
          const maxLen = Math.max(qWord.length, tWord.length);
          const similarity = Math.max(0, 1 - (distance / maxLen));
          if (similarity > 0.6) {
            score += similarity * 60;
          }
        }
      }
    }

    return score;
  }

  private findBestMatchingApplication(query: string, applications: any[]): any | null {
    let bestMatch = null;
    let bestScore = 0;
    const SCORE_THRESHOLD = 50;

    for (const app of applications) {
      const score = this.calculateMatchScore(query, app.name);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = app;
      }
    }

    return bestScore >= SCORE_THRESHOLD ? bestMatch : null;
  }

  // Verificar se strings são similares (com tolerância a erros)
  private isSimilar(query: string, term: string, baseMaxDistance: number = 2): boolean {
    const q = this.normalizeString(query);
    const t = this.normalizeString(term);

    if (q === t) return true;
    if (t.includes(q) || q.includes(t)) return true;

    const distance = this.levenshteinDistance(q, t);
    const threshold = Math.max(baseMaxDistance, Math.ceil(Math.max(q.length, t.length) * 0.3));

    return distance <= threshold;
  }

  // Busca inteligente: detecta segmento → aplicação → busca geral
  async smartSearch(query: string): Promise<{
    type: 'segment' | 'application' | 'general' | 'combined';
    products: any[];
    metadata?: { detectedSegment?: string; detectedApplication?: string };
  }> {
    const normalized = this.normalizeString(query);

    if (!normalized) {
      return { type: 'general', products: [] };
    }

    const segments = await this.getProductSegments();
    const matchedSegment = this.findBestMatchingApplication(query, segments);

    if (matchedSegment) {
      const data = await this.getProductsBySegment(matchedSegment.slug, {});
      if (data?.products) {
        return {
          type: 'segment',
          products: data.products,
          metadata: { detectedSegment: matchedSegment.name },
        };
      }
    }

    const applications = await this.getApplications();
    const matchedApp = this.findBestMatchingApplication(query, applications);

    if (matchedApp) {
      console.log(`Aplicação detectada: "${matchedApp.name}" (${matchedApp.slug})`);
      const appProducts = await this.getProductsByApplication(matchedApp.slug);

      if (appProducts && appProducts.length > 0) {
        return {
          type: 'application',
          products: appProducts,
          metadata: { detectedApplication: matchedApp.name },
        };
      }
    } else {
      console.log(`Nenhuma aplicação encontrada para: "${query}"`);
    }

    // 3. Busca geral (default)
    const generalProducts = await this.searchProducts(query);
    return {
      type: 'general',
      products: generalProducts,
    };
  }

  // Buscar produto único no Salesforce por SKU
  async getSalesforceProductBySku(sku: string): Promise<any | null> {
    if (!process.env.NEXT_PUBLIC_WORDPRESS_API_URL) {
      console.error("NEXT_PUBLIC_WORDPRESS_API_URL não está configurada");
      return null;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/salesforce/proxy/products?search=${encodeURIComponent(sku)}`,
        { cache: "no-store" },
      );

      if (!response.ok) return null;
      const data = await response.json();
      const products = Array.isArray(data) ? data : data.products || [];

      return products.length > 0 ? products[0] : null;
    } catch (error) {
      console.error(
        `Erro ao buscar dados do Salesforce para o SKU ${sku}:`,
        error,
      );
      return null;
    }
  }

  // Buscar lojas próximas por coordenadas (Store Finder)
  async getStores(
    lat: number,
    lng: number,
    radius: number = 30,
    vehicleType?: string,
    cep?: string
  ): Promise<StoreSearchResult | null> {
    if (!process.env.NEXT_PUBLIC_WORDPRESS_API_URL) return null;

    const params = new URLSearchParams();
    params.append("lat", lat.toString());
    params.append("lng", lng.toString());
    params.append("radius", radius.toString());
    if (vehicleType) {
      params.append("vehicle_type", vehicleType);
    }
    if (cep) {
      params.append("cep", cep.replace(/\D/g, ""));
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/moove/v1/stores?${params.toString()}`,
        cacheConfig(0),
      );

      if (!response.ok) {
        console.error(`Error fetching stores: ${response.status}`);
        return null;
      }

      const json = await response.json();
      return json.data || null;
    } catch (error) {
      console.error("Error fetching stores:", error);
      return null;
    }
  }
}

export const wordpressAPI = new WordPressAPI();

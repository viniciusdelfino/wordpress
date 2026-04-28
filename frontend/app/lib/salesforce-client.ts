const WORDPRESS_API_URL = (process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '').replace(/\/$/, '');
const WORDPRESS_URL = (process.env.NEXT_PUBLIC_WORDPRESS_URL || '').replace(/\/$/, '');

let SALESFORCE_API_BASE = '';

if (WORDPRESS_API_URL) {
  SALESFORCE_API_BASE = `${WORDPRESS_API_URL}/moove/v1`;
} else if (WORDPRESS_URL) {
  SALESFORCE_API_BASE = `${WORDPRESS_URL}/wp-json/moove/v1`;
}

export interface ProductVariation {
  sf_id: string;
  sku: string;
  size: number | null;
  size_unit: string | null;
  packing: string | null;
  viscosity: string | null;
  full_name: string;
}

export interface GroupedProduct {
  display_name: string;
  slug: string;
  last_modified: string;
  type: string;
  description: string;
  category_slug: string;
  seo_description: string;
  application: string;
  variations: ProductVariation[];
}

export interface Category {
  id: string;
  name: string;
  api_name: string;
  slug: string;
  count: number;
  url: string;
}

export class SalesforceAPIError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'SalesforceAPIError';
  }
}

export class SalesforceClient {
  private async fetch<T>(endpoint: string): Promise<T> {
    const url = `${SALESFORCE_API_BASE}${endpoint}`;
    
    if (!SALESFORCE_API_BASE) {
      const msg = '[SalesforceClient] ERRO CRÍTICO: Nenhuma URL de API definida. Verifique NEXT_PUBLIC_WORDPRESS_API_URL no .env';
      console.error(msg);
      throw new Error(msg);
    }

    const response = await fetch(url, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      let errorMessage = `Salesforce API Error: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) errorMessage += ` - ${errorData.message}`;
        if (errorData.code) errorMessage += ` (${errorData.code})`;
      } catch (e) {
        // Ignore JSON parse error on error response
      }

      console.error(`[SalesforceClient] API Error Status: ${response.status} ${response.statusText} for URL: ${url}. Details: ${errorMessage}`);
      throw new SalesforceAPIError(
        errorMessage,
        response.status
      );
    }
    
    const data = await response.json();

    // O Proxy pode retornar um array diretamente (lista de produtos)
    if (Array.isArray(data)) {
      return data as T;
    }

    // Ou um objeto com success/data (Legacy wrapper check)
    if (data && typeof data === 'object' && 'success' in data && !data.success) {
      throw new SalesforceAPIError(
        data.error?.message || 'Unknown error',
        data.error?.code
      );
    }
    
    return (data.data || data) as T;
  }
  
  // Saúde da API
  async checkUpdate() {
    return this.fetch<{
      status: string;
      timestamp: string;
    }>('/salesforce/proxy/check-update');
  }
  
  // Todas as categorias (aplicações)
  async getCategories(): Promise<{
    categories: Category[];
    total: number;
  }> {
    return {
      categories: [],
      total: 0
    };
  }
  
  // Produtos por categoria
  async getProductsByCategory(
    slug: string,
    page: number = 1,
    perPage: number = 12,
    filters?: { type?: string; composition?: string }
  ): Promise<{
    category: {
      slug: string;
      name: string;
      total_products: number;
    };
    products: GroupedProduct[];
    pagination: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
    metadata: {
      cached: boolean | undefined;
      cached_at: string;
    };
  }> {
    const params = new URLSearchParams({
      category: slug,
    });
    
    // O Proxy retorna todos os produtos da categoria (agrupados ou planos)
    const response = await this.fetch<any>(`/salesforce/proxy/products?${params}`);
    
    let allProducts: GroupedProduct[] = [];
    if (Array.isArray(response)) {
      allProducts = response;
    } else if (response && typeof response === 'object' && 'products' in response) {
      if (Array.isArray(response.products)) {
         allProducts = response.products;
      } else {
         console.error(`[SalesforceClient] 'products' key exists but is not an array:`, typeof response.products);
      }
    } else {
       console.warn('[SalesforceClient] Response structure unrecognized. Keys:', response ? Object.keys(response) : 'null');
    }

    if (filters?.type) {
      allProducts = allProducts.filter((p) => p.type === filters.type);
    }
    if (filters?.composition) {
      allProducts = allProducts.filter((p) => p.description?.includes(filters.composition!));
    }

    const total = allProducts.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const paginatedProducts = allProducts.slice(start, start + perPage);

    return {
      category: {
        slug,
        name: slug,
        total_products: total
      },
      products: paginatedProducts,
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: totalPages
      },
      metadata: {
        cached: false,
        cached_at: new Date().toISOString()
      }
    };
  }
  
  // Produto por SKU
  async getProduct(sku: string): Promise<{
    product: GroupedProduct;
    status: 'available' | 'discontinued';
  }> {
    // Busca usando o proxy search
    const params = new URLSearchParams({ search: sku });
    const response = await this.fetch<any>(`/salesforce/proxy/products?${params}`);
    
    const products = Array.isArray(response) ? response : (response.products || []);
    const product = products[0]; // Pega o primeiro match

    if (!product) {
      throw new SalesforceAPIError('Product not found', 404);
    }

    return {
      product,
      status: 'available'
    };
  }
  
  // Busca
  async search(query: string, category?: string) {
    const params = new URLSearchParams({
      search: query,
      ...(category && { category }),
    });
    
    const response = await this.fetch<any>(`/salesforce/proxy/products?${params}`);
    return Array.isArray(response) ? response : (response.products || []);
  }
}

// Instância global
export const salesforceClient = new SalesforceClient();
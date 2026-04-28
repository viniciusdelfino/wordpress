import { GroupedProduct } from "../_components/products/types/generalProductType";

export async function getProduct(slug: string): Promise<GroupedProduct | null> {
  const envApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WP_API_URL;

  if (!envApiUrl) {
    console.error("CRITICAL: A variável de ambiente NEXT_PUBLIC_WORDPRESS_API_URL não está configurada.");
    return null;
  }

  const baseUrl = envApiUrl.includes('/moove/v1') 
    ? envApiUrl.replace(/\/$/, '') 
    : `${envApiUrl.replace(/\/$/, '')}/moove/v1`;

  try {
    // Estratégia 1: Tenta corrigir viscosidades (ex: '10w 40' -> '10w-40')
    let searchTerm = slug.replace(/-/g, ' ').replace(/(\d+w)\s(\d+)/gi, '$1-$2');
    
    const fetchUrl = `${baseUrl}/salesforce/proxy/products?search=${encodeURIComponent(searchTerm)}`;

    let res = await fetch(
      fetchUrl,
      { next: { revalidate: 60 } } // Revalidate every 60 seconds
    );

    if (!res.ok) {
      console.error(`Error fetching product data: ${res.status} ${res.statusText}`);
      return null;
    }
    
    let data = await res.json();
    let products = data.products || [];

    // Estratégia 2 (Fallback): Se não encontrou nada, tenta uma busca mais ampla (primeiras 3 palavras)
    if (products.length === 0) {
        const parts = slug.split('-');
        if (parts.length > 2) {
            const broadSearchTerm = parts.slice(0, 3).join(' ');
            
            const fallbackUrl = `${baseUrl}/salesforce/proxy/products?search=${encodeURIComponent(broadSearchTerm)}`;
            const resFallback = await fetch(fallbackUrl, { next: { revalidate: 60 } });
            
            if (resFallback.ok) {
                const dataFallback = await resFallback.json();
                products = dataFallback.products || [];
            }
        }
    }

    const foundProduct = products.find((p: GroupedProduct) => p.slug === slug);
    
    if (!foundProduct) {
      console.warn(`[getProduct] Produto não encontrado via match exato de slug. Slug buscado: "${slug}"`);
    }

    return foundProduct || null;
  } catch (e) {
    console.error("Failed to fetch product. API might be down or network error.", e);
    return null;
  }
}

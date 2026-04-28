import { wordpressAPI } from "@/app/lib/wordpress-api";
import { salesforceClient } from "@/app/lib/salesforce-client";
import { PageDataType } from "@/app/types/salesforce-types";

const SEGMENT_TO_SALESFORCE_MAP: Record<string, string> = {
  'carros': 'motor-de-carros',
  'motos': 'motor-de-motos',
  'caminhoes': 'motor-de-caminhoes',
  'agricola': 'maquinas-agricolas',
  'industrial': 'industrial',
};

function getSalesforceCategorySlug(segmentSlug: string): string | null {
  return SEGMENT_TO_SALESFORCE_MAP[segmentSlug] || null;
}

export async function getPageData(slug: string): Promise<PageDataType> {
  //WordpressPage - Sobre, FAle conosco...
  const tryWordPressPage = async (): Promise<PageDataType | null> => {
    const pageData = await wordpressAPI.getPage(slug);
    return pageData ? handleWordPressPage(pageData, slug) : null;
  };

  //Segments - carros, motos, caminhões...
  const trySegment = async (): Promise<PageDataType | null> => {
    const segmentData = await wordpressAPI.getProductSegmentsBySlug(slug);
    return segmentData ? handleSegment(segmentData) : null;
  };

  //SalesForceCategory - as categorias vindas do SalesForce
  const trySalesforceCategory = async (): Promise<PageDataType | null> => {
    const categories = await salesforceClient.getCategories();
    const category = categories.categories?.find(cat => cat.slug === slug);
    if (category) {
      const products = await salesforceClient.getProductsByCategory(slug);
      return {
        type: "salesforce-direct",
        data: { category, products }
      };
    }
    return null;
  };

  const fetchers = [
    tryWordPressPage,
    trySegment,
    trySalesforceCategory,
  ];

  for (const fetcher of fetchers) {
    try {
      const result = await fetcher();
      if (result) return result;
    } catch (error) {
      // Ignora o erro e tenta o próximo fetcher
    }
  }

  return { type: "not-found", data: null };
}

async function handleWordPressPage(pageData: any, slug: string): Promise<PageDataType> {
  const isSalesforceCategory = pageData?.is_salesforce_category || false;
  const categorySlug = pageData?.salesforce_category_slug;
  
  if (isSalesforceCategory && categorySlug) {
    try {
      const products = await salesforceClient.getProductsByCategory(categorySlug);
      const categories = await salesforceClient.getCategories();
      const category = categories.categories?.find(cat => cat.slug === categorySlug);
      
      if (category) {
        return {
          type: 'page-with-salesforce',
          data: pageData,
          salesforceData: { category, products, type: 'salesforce-category' }
        };
      }
    } catch (error) {
      console.error('Erro ao buscar produtos Salesforce:', error);
    }
  }
  
  return { type: 'page', data: pageData };
}

// Helper para buscar direto do Proxy e garantir o filtro
async function fetchProxyProducts(categorySlug: string) {
  const baseUrl = (process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://localhost:8080/moove/backend/wp-json').replace(/\/$/, '');

  const url = `${baseUrl}/moove/v1/salesforce/proxy/products?category=${categorySlug}`;
  
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Erro Proxy Salesforce [${res.status}]:`, errorText);
    throw new Error(`Erro ao buscar produtos do Proxy: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function handleSegment(segmentData: any): Promise<PageDataType> {
  const salesforceCategorySlug = getSalesforceCategorySlug(segmentData.slug);
  let salesforceData = null;
  
  if (salesforceCategorySlug) {
    try {
      const proxyData = await fetchProxyProducts(salesforceCategorySlug);
      const category = {
        slug: salesforceCategorySlug,
        name: segmentData.name,
        total_products: proxyData.total_grouped || 0,
        url: `/${segmentData.slug}`
      };
      
      salesforceData = { 
        category, 
        products: proxyData.products,
        total_grouped: proxyData.total_grouped,
        type: 'salesforce-category' 
      };
    } catch (error) {
      console.error('Erro ao buscar produtos Salesforce:', error);
    }
  }
  
  return { 
    type: 'segment', 
    data: segmentData,
    salesforceData
  };
}
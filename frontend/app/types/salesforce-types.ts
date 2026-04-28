export interface SalesforceProduct {
  Id: string;
  Name: string;
  B2BProductName__c: string;
  Description: string;
  StockKeepingUnit: string;
  ProductApplication__c: string;
  IndustryClassifications__c: string;
  Grease__c: string;
  Viscosity__c: string;
  Benefits__c: string;
  B2BPackage__c: string;
  MeetsOrExceeds__c: string;
  Recommendation__c: string;
  RelatedProducts__c: string;
  B2BSEOTitle__c: string;
  B2BSEODescription__c: string;
  B2BSEOKeywords__c: string;
  StatusFormula__c: string;
  IsActive: boolean;
  EnabledProductB2BCommerce__c: boolean;
  LastModifiedDate: string;
  url: string;
  category_url: string;
  display_name: string;
  categories: Array<{
    name: string;
    slug: string;
    url: string;
  }>;
  related_products?: Array<{
    sku: string;
    name: string;
    url: string;
    description: string;
  }>;
}

export interface Category {
  id: string;
  name: string;
  api_name: string;
  slug: string;
  count: number;
  url: string;
  api_url: string;
}

export interface ProductsResponse {
  category: {
    slug: string;
    name: string;
    total_products: number;
  };
  products: SalesforceProduct[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters: {
    active: {
      type?: string;
      composition?: string;
    };
    available: {
      type: string[];
      composition: string[];
    };
  };
  metadata: {
    cached: boolean;
    cached_at: string | null;
    timestamp: string;
  };
}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
  cached_at: string;
  cache_key: string;
}

export interface APIError {
  success: false;
  error: {
    code: number;
    message: string;
  };
  meta: {
    timestamp: string;
  };
}

export interface APISuccess<T> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    api_version: string;
    environment: string;
  };
}

export interface PageProps {
  params: Promise<{ slug: string }>;
}

export type PageDataType = 
  | { type: 'page'; data: any; salesforceData?: any }
  | { type: 'page-with-salesforce'; data: any; salesforceData: any }
  | {
    salesforceData: unknown; type: 'segment'; data: any 
}
  | { type: 'salesforce-direct'; data: any }
  | { type: 'salesforce-product'; data: any }
  | { type: 'not-found'; data: null };

export interface SalesforceCategory {
  slug: string;
  name: string;
  total_products: number;
  url: string;
}

export interface SalesforceProducts {
  products: any[];
  category: { total_products: number };
  pagination: any;
  filters: any;
}

export interface SegmentData {
  slug: string;
  name: string;
  description?: string;
  blocks?: any[];
}
interface ProductVariation {
  sf_id: string;
  sku: string;
  size: number | null;
  size_unit: string | null;
  packing: string | null;
  viscosity: string | null;
  gross_weight: number | null;
  weight_unit: string | null;
  full_name: string;
}

interface ProductImage {
  url?: string;
}

interface ProductACF {
  comprar_ml: boolean;
  thumb_products?: ProductImage;
  banner_premium?: ProductImage;
  produto_premium?: boolean
  banner_premium_mobile?: ProductImage;
  ml_btn?: boolean;
  link_ml?: string;
  link_cnpj?: string;
}

export interface GroupedProduct {
  B2BProductName__c: string;
  StockKeepingUnit: string;
  slug: string;
  Description: string;
  IndustryClassifications__c: string;
  Viscosity__c: string;
  ProductApplication__c: string;
  DisplayUrl: string;

  Approvals__c?: string | null;
  MeetsOrExceeds__c?: string | null;
  Benefits__c?: string | null;
  API__c?: string | null;

  variations: ProductVariation[];
  acf?: ProductACF;
}
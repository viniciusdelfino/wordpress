export interface RelatedImage {
  menu_image: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  } | null;
  add_label?: boolean;
  label?: string;
  link?: string;
}

export interface MenuItem {
  ID: number;
  title: string;
  menu_image?: string | null;
  ind_image?: string | null;
  related_images?: RelatedImage[];
  url: string;
  path: string;
  target?: string;
  children?: MenuItem[];
  acf?: {
    related_images?: RelatedImage[];
    [key: string]: unknown;
  };
}

export interface Block {
  [x: string]: any;
  type: string;
  data: Record<string, any>;
}

export interface ProductSegmentCarouselBlock {
  acf_fc_layout: 'product_segment_carousel';
  desc: string;
  segment: { slug: string; taxonomy: string } | string;
  itens_number: string | number;
  products?: unknown[];
}

export interface Page {
  acf: Record<string, unknown> | null;
  id: number;
  title: string;
  slug: string;
  content: string;
  blocks?: Block[];
  acf_fields?: Record<string, unknown>;
  is_salesforce_category?: boolean;
  salesforce_category_slug?: string;
  blocks_after_products?: Block[];
  seo?: {
    title: string;
    description: string;
  };
}

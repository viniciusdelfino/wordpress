// Types for the Distribuidores page blocks (ACF-driven)

export interface AcfImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface AcfLink {
  title?: string;
  url: string;
  target?: string;
}

export interface DistributorEntry {
  state_code: string;
  state_label: string;
  name: string;
  logo?: AcfImage;
  address: string;
  /** Primary phone (display string). Kept for backwards-compat. */
  phone?: string;
  /** Optional ACF repeater of additional phones. Each item: { phone: "..." } */
  phones?: string[] | { phone: string }[];
  website?: AcfLink;
  coverage_areas?: string[] | { area: string }[];
}

export interface DistribuidoresIntroProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  image?: AcfImage;
}

export interface DistribuidoresFinderProps {
  title?: string;
  description?: string;
  state_select_label?: string;
  distributors?: DistributorEntry[];
}

export interface PedeDiretoSectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  /** ACF link group OR a plain URL string (some legacy ACF setups use a URL field). */
  cta?: AcfLink | string;
  image?: AcfImage;
}

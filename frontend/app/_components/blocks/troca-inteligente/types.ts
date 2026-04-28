export interface AcfImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

// TrocaHero
export interface TrocaHeroTab {
  icon?: AcfImage;
  label: string;
}

export interface TrocaHeroProps {
  title?: string;
  subtitle?: string;
  background_image?: AcfImage;
  background_image_mobile?: AcfImage;
  tabs?: TrocaHeroTab[];
}

// TrocaProcessSteps
export interface ProcessStep {
  image?: AcfImage;
  label?: string;
  description?: string;
}

export interface TrocaProcessStepsProps {
  title?: string;
  description?: string;
  steps?: ProcessStep[];
}

// TrocaImpactNumbers
export interface ImpactMetric {
  number?: string;
  label?: string;
}

export interface TrocaImpactNumbersProps {
  badge?: string;
  badge_icon?: AcfImage;
  image?: AcfImage;
  title?: string;
  subtitle?: string;
  metrics?: ImpactMetric[];
}

// TrocaPillars
export interface PillarStat {
  number?: string;
  label?: string;
}

export interface Pillar {
  icon?: AcfImage;
  name?: string;
  description?: string;
  stats?: PillarStat[];
}

export interface TrocaPillarsProps {
  title?: string;
  description?: string;
  pillars?: Pillar[];
}

// TrocaTechFeatures
export interface TechFeatureCard {
  icon?: AcfImage;
  title?: string;
  description?: string;
}

export interface TrocaTechFeaturesProps {
  title?: string;
  description?: string;
  cards?: TechFeatureCard[];
}

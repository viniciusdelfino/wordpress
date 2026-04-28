export const INDUSTRY_LABELS: Record<string, string> = {
  'aplicacao': 'Setor de Atuação',
  'tecnologia': 'Tipo de Lubrificante',
  'viscosidade': 'Classificação ISO VG'
};

export const getIndustryContext = (pathname: string) => {
  const parts = pathname.split('/');
  return {
    isIndustry: parts.includes('industria'),
    subSegment: parts.length > 2 ? parts[parts.length - 1] : null
  };
};
export const GRAXAS_ID = 'graxas';

export const isSpecialSegment = (segment?: string) => {
  return segment === 'caminhoes' || segment === 'maquinas-agricolas';
};
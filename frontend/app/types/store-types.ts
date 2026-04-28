// Types for the Store Finder feature (Onde Comprar)

export interface Store {
  id: string;
  name: string;
  fantasyName?: string;
  address: string;
  city: string;
  state: string;
  cep: string;
  phone?: string;
  segment?: string;
  subsegment?: string;
  lat: number;
  lng: number;
  distance_km: number | null;
}

export interface StoreSearchResult {
  stores: Store[];
  total: number;
  center: {
    lat: number;
    lng: number;
  };
  radius: number;
}

export type SearchState = 'idle' | 'loading' | 'results' | 'no-results' | 'error';

export interface SearchFilters {
  cep: string;
  vehicleType?: string;
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress?: string;
}

export interface VehicleTypeOption {
  value: string;
  label: string;
}

export interface DistributorSearchResult {
  distributors: Store[];
  total: number;
  state: string;
}

export interface BrazilianState {
  value: string;
  label: string;
}

export const BRAZILIAN_STATES: BrazilianState[] = [
  { value: '', label: 'Selecione o estado' },
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

export const VEHICLE_TYPE_OPTIONS: VehicleTypeOption[] = [
  { value: '', label: 'Tipo de veículo' },
  { value: 'carros', label: 'Carros' },
  { value: 'motos', label: 'Motos' },
  { value: 'caminhoes', label: 'Caminhões' },
  { value: 'agricola', label: 'Agrícola' },
  { value: 'industrial', label: 'Industrial' },
];

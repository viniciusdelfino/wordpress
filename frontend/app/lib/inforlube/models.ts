import { inforlubeAuth } from './auth';

export interface VehicleModel {
  id: string;
  name: string;
  make: string;
  year: number;
  fuelType: string;
  engine: string;
}

export interface ModelSearchResponse {
  models: VehicleModel[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    nextPageLink: string | null;
  };
  ticket?: string; // Ticket para recomendações
}

class ModelService {
  // Busca por texto (como no site: "FIAT UNO")
  async searchByText(
    searchText: string, 
    options: {
      spellCheck?: boolean;
      usePartialWords?: boolean;
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<ModelSearchResponse> {
    
    const params = new URLSearchParams({
      SearchText: searchText,
      SpellCheck: options.spellCheck ? 'true' : 'false',
      UsePartialWords: options.usePartialWords ? 'true' : 'false',
      CurrentPage: options.page?.toString() || '1',
      PageSize: options.pageSize?.toString() || '10',
      IsPaged: 'true'
    });
    
    const response = await fetch(
      `${process.env.INFORLUBE_API_URL}/Models?${params}`,
      {
        headers: inforlubeAuth.getHeaders()
      }
    );
    
    if (!response.ok) throw new Error('Falha na busca de modelos');
    
    // Extrair ticket do header (IMPORTANTE!)
    const ticket = response.headers.get('Ticket');
    if (ticket) {
      inforlubeAuth.setRecommendationTicket(ticket);
    }
    
    const models = await response.json();
    
    // Extrair paginação dos headers (conforme documentação)
    const pagination = {
      currentPage: parseInt(response.headers.get('CurrentPage') || '1'),
      totalPages: parseInt(response.headers.get('TotalPages') || '1'),
      totalResults: parseInt(response.headers.get('TotalResults') || '0'),
      nextPageLink: response.headers.get('NextPageLink')
    };
    
    return {
      models,
      pagination,
      ticket: ticket || undefined
    };
  }
  
  // Busca manual passo-a-passo (para formulário guiado)
  async searchManual(filters: {
    makeId?: string;
    vehicleType?: string;
    year?: number;
    fuelType?: string;
  }): Promise<VehicleModel[]> {
    
    const params = new URLSearchParams({
      IsManualSearch: 'true',
      ...(filters.makeId && { MakeId: filters.makeId }),
      ...(filters.vehicleType && { VehicleType: filters.vehicleType }),
      ...(filters.year && { Year: filters.year.toString() }),
      ...(filters.fuelType && { FuelType: filters.fuelType })
    });
    
    const response = await fetch(
      `${process.env.INFORLUBE_API_URL}/Models?${params}`,
      {
        headers: inforlubeAuth.getHeaders()
      }
    );
    
    if (!response.ok) throw new Error('Falha na busca manual');
    
    return response.json();
  }
}

export const modelService = new ModelService();
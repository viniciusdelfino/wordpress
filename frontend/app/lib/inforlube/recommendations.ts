import { inforlubeAuth } from './auth';

export interface ProductRecommendation {
  id: string;
  name: string;
  category: string;
  specifications: Array<{
    key: string;
    value: string;
    unit?: string;
  }>;
  imageUrl?: string;
  productUrl?: string;
}

export interface RecommendationResponse {
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    engine: string;
    fuelType: string;
  };
  recommendations: ProductRecommendation[];
  componentTypes: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

class RecommendationService {
  // Obter recomendações para um modelo específico
  async getRecommendations(
    modelId: string,
    options: {
      componentType?: string;
      productType?: string;
      useCustomization?: boolean;
    } = {}
  ): Promise<RecommendationResponse> {
    
    const params = new URLSearchParams({
      ...(options.componentType && { ComponentType: options.componentType }),
      ...(options.productType && { ProductType: options.productType }),
      UseCustomization: options.useCustomization ? 'true' : 'false'
    });
    
    const url = `${process.env.INFORLUBE_API_URL}/Products/Recommendation/Model/${modelId}${
      params.toString() ? `?${params}` : ''
    }`;
    
    const response = await fetch(url, {
      headers: inforlubeAuth.getHeaders(true) // Com ticket!
    });
    
    if (!response.ok) throw new Error('Falha ao obter recomendações');
    
    const data = await response.json();
    
    // Transformar dados para formato do frontend
    return this.transformRecommendationData(data);
  }
  
  // Obter tipos de componentes disponíveis (Óleo de Motor, Fluido de Câmbio, etc.)
  async getAvailableComponentTypes(modelId: string) {
    const response = await fetch(
      `${process.env.INFORLUBE_API_URL}/Products/Recommendation/Model/${modelId}/Types`,
      {
        headers: inforlubeAuth.getHeaders(true)
      }
    );
    
    if (!response.ok) throw new Error('Falha ao obter tipos de componentes');
    
    return response.json();
  }
  
  // Transformar dados da API para formato do frontend
  private transformRecommendationData(apiData: any): RecommendationResponse {
    // Adaptação baseada na estrutura do swagger
    return {
      vehicleInfo: {
        make: apiData.make || '',
        model: apiData.model || '',
        year: apiData.year || 0,
        engine: apiData.engine || '',
        fuelType: apiData.fuelType || ''
      },
      recommendations: apiData.products?.map((product: any) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        specifications: product.specifications?.map((spec: any) => ({
          key: spec.key,
          value: spec.value,
          unit: spec.unit
        })) || [],
        imageUrl: product.imageUrl,
        productUrl: product.productUrl
      })) || [],
      componentTypes: apiData.componentTypes || []
    };
  }
}

export const recommendationService = new RecommendationService();
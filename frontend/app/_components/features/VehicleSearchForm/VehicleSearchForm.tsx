'use client';

import { inforlubeAuth } from '@/app/lib/inforlube/auth';
import { modelService } from '@/app/lib/inforlube/models';
import { recommendationService } from '@/app/lib/inforlube/recommendations';
import { useState } from 'react';

export default function VehicleSearchForm() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  
  // Buscar modelos (etapa 1)
  const handleSearch = async () => {
    if (searchTerm.length < 2) return;
    
    setIsLoading(true);
    try {
      // Autenticar primeiro (em produção usar reCAPTCHA)
      await inforlubeAuth.authenticateWithHash();
      
      const result = await modelService.searchByText(searchTerm, {
        spellCheck: true,
        usePartialWords: true
      });
      
      setModels(result.models);
      setSelectedModel(null);
      setRecommendations(null);
    } catch (error) {
      console.error('Erro na busca:', error);
      alert('Erro ao buscar modelos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Selecionar modelo e buscar recomendações (etapa 2)
  const handleSelectModel = async (model: any) => {
    setIsLoading(true);
    setSelectedModel(model);
    
    try {
      // Buscar recomendações padrão (óleo de motor)
      const recommendations = await recommendationService.getRecommendations(model.id);
      setRecommendations(recommendations);
      
      // Buscar tipos de componentes disponíveis
      const componentTypes = await recommendationService.getAvailableComponentTypes(model.id);
      // Aqui você pode mostrar botões para outros componentes
      // como "Fluido de Câmbio", "Óleo de Freio", etc.
      
    } catch (error) {
      console.error('Erro nas recomendações:', error);
      alert('Erro ao obter recomendações.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="vehicle-search text-black">
      {/* Campo de busca */}
      <div className="search-box flex flex-col items-center justify-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Digite marca, modelo ou placa do veículo"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="search-input w-100"
        />
        <button 
          onClick={handleSearch}
          disabled={isLoading || searchTerm.length < 2}
          className={`search-button ${isLoading ? 'cursor-pointer' : ''}`}
        >
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      
      {/* Lista de modelos encontrados */}
      {models.length > 0 && !selectedModel && (
        <div className="models-list">
          <h3>Selecione seu veículo:</h3>
          <ul>
            {models.map((model) => (
              <li key={model.id}>
                <button 
                  onClick={() => handleSelectModel(model)}
                  className="model-option"
                >
                  {model.make} {model.name} {model.year} {model.engine}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Recomendações */}
      {recommendations && (
        <div className="recommendations">
          <h3>Recomendação para {selectedModel.make} {selectedModel.name}</h3>
          
          {/* Info do veículo (igual ao site atual) */}
          <div className="vehicle-info">
            <p>
              {selectedModel.make} {selectedModel.name} {selectedModel.year} 
              {selectedModel.engine} - {selectedModel.fuelType}
            </p>
          </div>
          
          {/* Lista de produtos recomendados */}
          <div className="products-grid">
            {recommendations.recommendations.map((product: any) => (
              <div key={product.id} className="product-card">
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} />
                )}
                <h4>{product.name}</h4>
                <p className="category">{product.category}</p>
                
                {product.specifications && product.specifications.length > 0 && (
                  <ul className="specifications">
                    {product.specifications.map((spec: any, index: number) => (
                      <li key={index}>
                        <strong>{spec.key}:</strong> {spec.value} {spec.unit || ''}
                      </li>
                    ))}
                  </ul>
                )}
                
                {product.productUrl && (
                  <a 
                    href={product.productUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="product-link"
                  >
                    Conheça
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Botão Nova Busca (igual ao site) */}
      {recommendations && (
        <button 
          onClick={() => {
            setSearchTerm('');
            setModels([]);
            setSelectedModel(null);
            setRecommendations(null);
          }}
          className="new-search-button"
        >
          <span>Nova Busca</span>
        </button>
      )}
    </div>
  );
}
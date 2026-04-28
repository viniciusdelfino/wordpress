import React from 'react';

export default function NoProductsMessage({ segmentName }: { segmentName: string }) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🔧</div>
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">
          Produtos em breve
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Estamos preparando os produtos para {segmentName}. 
          Em breve você encontrará aqui nossa linha completa.
        </p>
      </div>
    </div>
  );
}

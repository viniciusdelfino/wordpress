'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import { GroupedProduct } from '../../lib/salesforce-client';

interface ProductGridProps {
  products: GroupedProduct[];
  pagination?: {
    page: number;
    total_pages: number;
  };
  layout?: 'grid' | 'list';
  initialCount?: number;
  basePath?: string;
  showAll?: boolean;
  showDownloads?: boolean;
}

export default function ProductGrid({
  products,
  pagination,
  layout = 'grid',
  initialCount = 9,
  basePath = '/product',
  showAll = false,
  showDownloads = false,
}: ProductGridProps) {
  const [currentLayout, setCurrentLayout] = useState(layout);
  const [visibleCount, setVisibleCount] = useState(initialCount);
  
  // Normaliza a entrada: garante que seja array, mesmo se vier encapsulado (ex: { products: [...] })
  const productList = Array.isArray(products) ? products : ((products as any)?.products || []);
  
  // Filtra produtos inválidos
  const validProducts = Array.isArray(productList) ? productList.filter(p => p && typeof p === 'object') : [];

  if (validProducts.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Nenhum produto encontrado
        </h3>
        <p className="text-gray-500">
          Tente ajustar os filtros ou volte mais tarde.
        </p>
      </div>
    );
  }
  
  const paginatedProducts = showAll ? validProducts : validProducts.slice(0, visibleCount);
  const hasMore = !showAll && visibleCount < validProducts.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  return (
    <>
      <div className={currentLayout === 'grid' 
        ? 'grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4'
        : 'space-y-4'
      }>
        {paginatedProducts.map((product, index) => (
          <div key={index} className={currentLayout === 'grid' ? 'col-span-4' : ''}>
            <ProductCard
              product={product}
              layout={currentLayout}
              basePath={basePath}
              showDownloads={showDownloads}
            />
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-10 md:mt-12 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="flex items-center justify-center px-6 py-2 border border-dark-blue rounded-sm text-dark-blue hover:bg-dark-blue hover:text-white transition-colors cursor-pointer w-[18.75rem]"
          >
            Ver mais
          </button>
        </div>
      )}
    </>
  );
}
import React from 'react';
import Link from 'next/link';
import Breadcrumb from '@/app/_components/ui/Breadcrumb/Breadcrumb';
import { GroupedProduct } from '../_components/products/types/generalProductType';

interface ProxyResponse {
  total_grouped: number;
  total_records: number;
  products: GroupedProduct[];
}

// Função para buscar os dados do Proxy WordPress
async function getProducts(): Promise<GroupedProduct[]> {
  const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost:8080/moove/backend/wp-json';
  
  const cleanUrl = baseUrl.replace(/\/$/, '');
  
  try {
    const res = await fetch(`${cleanUrl}/salesforce/proxy/products`, {
      next: { revalidate: 60 }, // ISR: Cache por 60 segundos
    });

    if (!res.ok) {
      console.error('Erro HTTP ao buscar produtos:', res.status, res.statusText);
      return [];
    }

    const data: ProxyResponse = await res.json();
    return data.products || [];
  } catch (error) {
    console.error('Erro ao conectar com o Proxy Salesforce:', error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <>
    <Breadcrumb
      items={[
        { label: "Home", href: "/" },
        { label: "Produtos" },
      ]}
    />
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Catálogo de Produtos</h1>
        <span className="text-sm text-gray-500">
          {products.length} produtos encontrados
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/product/${product.slug}`}
            className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
          >
            <div className="p-6">
              <div className="mb-3">
                <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide text-blue-600 bg-blue-50 rounded-full uppercase">
                  {product.ProductApplication__c}
                </span>
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                {product.B2BProductName__c}
              </h2>

              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {product.Description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="text-xs text-gray-500">
                  {product.variations.length}{" "}
                  {product.variations.length === 1 ? "opção" : "opções"}
                </div>

                <span className="text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                  Ver detalhes →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
    </>
  );
}
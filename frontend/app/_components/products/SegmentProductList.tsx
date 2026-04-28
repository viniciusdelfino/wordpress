'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductGrid from './ProductGrid';
import ProductFilter from './components/ProductFilter';
import { wordpressAPI } from '@/app/lib/wordpress-api';

interface SegmentProductListProps {
  products: any[];
  pagination?: any;
  desc?: string;
  filters?: any;
  segmentName?: string;
  segmentSlug?: string;
  sectionTitle?: string;
}

function sanitizeSegmentDescriptionHtml(value?: string): string {
  if (!value || typeof value !== 'string') return '';

  let html = value.trim();

  // Remove wrappers de layout vindos do CMS que duplicam grid/article no frontend.
  html = html.replace(
    /<div[^>]*class=["'][^"']*grid[^"']*grid-cols-12[^"']*["'][^>]*>\s*<article[^>]*class=["'][^"']*(?:col-span-12|lg:col-span-7|lg:col-span-8)[^"']*["'][^>]*>([\s\S]*?)<\/article>\s*<\/div>/gi,
    '$1'
  );

  html = html.replace(
    /<article[^>]*class=["'][^"']*(?:col-span-12|lg:col-span-7|lg:col-span-8|prose-headings:)[^"']*["'][^>]*>([\s\S]*?)<\/article>/gi,
    '$1'
  );

  return html;
}

export default function SegmentProductList({ products: initialProducts, pagination: initialPagination, desc, filters, segmentName, segmentSlug, sectionTitle }: SegmentProductListProps) {
  const searchParams = useSearchParams();
  const filterKey = searchParams.toString();
  const safeDesc = sanitizeSegmentDescriptionHtml(desc);

  const [products, setProducts] = useState(initialProducts || []);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filterPending, setFilterPending] = useState(false);

  const handlePendingChange = useCallback((pending: boolean) => {
    setFilterPending(pending);
  }, []);

  // Reset accumulated products when filters change (new server data)
  useEffect(() => {
    setProducts(initialProducts || []);
    setPagination(initialPagination);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const hasMore = pagination && pagination.current < pagination.pages;

  const loadMore = async () => {
    if (!segmentSlug || !hasMore || loading) return;
    setLoading(true);
    setLoadError(null);
    try {
      const nextPage = (pagination.current || 1) + 1;
      const params = new URLSearchParams(filterKey);
      params.set('page', String(nextPage));

      const data = await wordpressAPI.getProductsBySegment(segmentSlug, {
        page: String(nextPage),
        viscosidade: params.get('viscosidade') || undefined,
        tecnologia: params.get('tecnologia') || undefined,
        aplicacao: params.get('aplicacao') || undefined,
        ponto_lubrificacao: params.get('ponto_lubrificacao') || undefined,
        espessante: params.get('espessante') || undefined,
      });

      if (!data) {
        setLoadError('Erro ao carregar mais produtos. Tente novamente.');
        return;
      }

      setProducts(prev => [...prev, ...(data.products || [])]);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading more products:', error);
      setLoadError('Erro ao carregar mais produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="segment-product-list container mx-auto px-4 pt-10 md:pt-15 lg:pt-12">
      {filters ? (
        <ProductFilter
          filters={filters}
          segmentName={segmentName}
          segmentSlug={segmentSlug}
          onPendingChange={handlePendingChange}
        />
      ) : (
        <div className="p-4 bg-gray-50 rounded text-sm text-gray-500 mb-8">
          Carregando filtros...
        </div>
      )}

      {/* Título e Descrição da Categoria */}
      {(safeDesc || sectionTitle) && (
        <div className="grid grid-cols-12 mb-8">
          <div className="col-span-12 lg:col-span-8">
            {safeDesc ? (
              <div
                className="prose-headings:font-bold prose-headings:text-2xl prose-headings:md:text-[1.75rem] prose-headings:lg:text-[2rem] prose-headings:text-dark-blue prose-p:lg:text-[18px] prose-p:text-low-dark-blue"
                dangerouslySetInnerHTML={{ __html: safeDesc }}
              />
            ) : (
              <h2 className="font-bold text-2xl md:text-[1.75rem] lg:text-[2rem] text-dark-blue">
                {sectionTitle || segmentName}
              </h2>
            )} 
          </div>
        </div>
      )}      

      <div className={`w-full transition-opacity duration-200 ${filterPending ? 'opacity-50 pointer-events-none' : ''}`}>
        <ProductGrid products={products} pagination={pagination} showAll showDownloads />
        {loadError && (
          <p className="mt-4 text-sm text-red">{loadError}</p>
        )}
      </div>

      {(hasMore || loading) && (
        <div className="mt-10 md:mt-12 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="flex items-center justify-center px-6 py-2 border border-dark-blue rounded-sm text-dark-blue hover:bg-dark-blue hover:text-white transition-colors cursor-pointer w-[18.75rem] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Carregando...' : 'Ver mais'}
          </button>
        </div>
      )}
    </section>
  );
}

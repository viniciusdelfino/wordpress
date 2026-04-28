'use client';

import React from 'react';
import Link from 'next/link';

interface StoreEmptyStateProps {
  type: 'idle' | 'no-results' | 'error';
  errorMessage?: string;
}

export default function StoreEmptyState({ type, errorMessage }: StoreEmptyStateProps) {
  // Grid background component matching Figma design
  const GridBackground = () => (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(to right, #E5E7EB 1px, transparent 1px),
          linear-gradient(to bottom, #E5E7EB 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}
    />
  );

  // Store icon with location pin for idle state (matches Figma exactly)
  const StoreIcon = () => (
    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
      <svg className="w-8 h-8 text-dark-blue" viewBox="0 0 32 32" fill="none">
        {/* Store building */}
        <path
          d="M4 14V26C4 27.1 4.9 28 6 28H26C27.1 28 28 27.1 28 26V14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Roof */}
        <path
          d="M2 14L16 4L30 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Location pin in center */}
        <path
          d="M16 11C14.34 11 13 12.34 13 14C13 16.5 16 20 16 20C16 20 19 16.5 19 14C19 12.34 17.66 11 16 11Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="16" cy="14" r="1" fill="currentColor" />
      </svg>
    </div>
  );

  // Clipboard/document icon for no-results state (matches Figma exactly)
  const ClipboardIcon = () => (
    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
      <svg className="w-8 h-8 text-[#9CA3AF]" viewBox="0 0 32 32" fill="none">
        {/* Clipboard body */}
        <rect
          x="6"
          y="4"
          width="20"
          height="24"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Clipboard top */}
        <path
          d="M12 4V3C12 2.45 12.45 2 13 2H19C19.55 2 20 2.45 20 3V4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect x="12" y="2" width="8" height="4" rx="1" fill="currentColor" opacity="0.3" />
        {/* Lines */}
        <line x1="10" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="17" x2="22" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="22" x2="17" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );

  // Idle state - before any search
  if (type === 'idle') {
    return (
      <div className="relative w-full min-h-[300px] md:min-h-[350px] lg:min-h-[400px] bg-[#F9FAFB] rounded-lg overflow-hidden border border-[#E5E7EB]">
        <GridBackground />

        <div className="relative flex flex-col items-center justify-center h-full min-h-[300px] md:min-h-[350px] lg:min-h-[400px] p-6">
          <StoreIcon />

          <p className="mt-4 text-base md:text-lg text-dark-blue font-semibold text-center">
            Insira o seu CEP
          </p>
          <p className="mt-2 text-sm text-medium-gray text-center max-w-[280px] leading-relaxed">
            Para ver as lojas disponíveis na sua região insira o seu CEP no filtro acima
          </p>
        </div>
      </div>
    );
  }

  // No results state - after search with 0 results
  if (type === 'no-results') {
    return (
      <div className="relative w-full min-h-[300px] md:min-h-[350px] lg:min-h-[400px] bg-[#F9FAFB] rounded-lg overflow-hidden border border-[#E5E7EB]">
        <GridBackground />

        <div className="relative flex flex-col items-center justify-center h-full min-h-[300px] md:min-h-[350px] lg:min-h-[400px] p-6">
          <ClipboardIcon />

          <p className="mt-4 text-base md:text-lg text-dark-blue font-semibold text-center">
            Nenhuma loja encontrada
          </p>
          <p className="mt-2 text-sm text-medium-gray text-center max-w-sm leading-relaxed">
            Tente buscar por outro CEP. Se preferir você pode entrar em contato conosco.
          </p>

          <Link
            href="/contato"
            className="mt-6 inline-flex items-center justify-center px-8 py-3 bg-red text-white text-sm font-medium rounded hover:bg-red/90 transition-colors"
          >
            Fale conosco
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="relative w-full min-h-[300px] md:min-h-[350px] lg:min-h-[400px] bg-[#F9FAFB] rounded-lg overflow-hidden border border-[#E5E7EB]">
      <GridBackground />

      <div className="relative flex flex-col items-center justify-center h-full min-h-[300px] md:min-h-[350px] lg:min-h-[400px] p-6">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
          <svg className="w-8 h-8 text-red" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M16 10V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="22" r="1.5" fill="currentColor" />
          </svg>
        </div>

        <p className="mt-4 text-base md:text-lg text-dark-blue font-semibold text-center">
          Erro na busca
        </p>
        <p className="mt-2 text-sm text-medium-gray text-center max-w-sm leading-relaxed">
          {errorMessage || 'Ocorreu um erro ao buscar as lojas. Tente novamente.'}
        </p>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  url?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  current_page?: string;
}

// Map of known slugs to display names
const SLUG_LABELS: Record<string, string> = {
  'onde-comprar': 'Onde Comprar',
  'contato': 'Contato',
  'sobre': 'Sobre',
  'produtos': 'Produtos',
  'carros': 'Carros',
  'motos': 'Motos',
  'caminhoes': 'Caminhões',
  'agricola': 'Agrícola',
  'industrial': 'Industrial',
  'encontre-seu-oleo': 'Encontre seu Óleo',
  'parceiros': 'Parceiros',
  'faq': 'FAQ',
};

export default function Breadcrumbs({ items, current_page }: BreadcrumbsProps) {
  const pathname = usePathname();

  // If items are provided via ACF, use them
  // Otherwise, auto-generate from pathname
  const breadcrumbItems: BreadcrumbItem[] = items && items.length > 0
    ? items
    : generateBreadcrumbs(pathname, current_page);

  return (
    <nav className="py-4 bg-neutral-2">
      <div className="container mx-auto">
        <ol className="flex items-center gap-2 text-sm text-medium-gray">
          <li>
            <Link href="/" className="hover:text-dark-blue transition-colors">
              Home
            </Link>
          </li>
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            return (
              <React.Fragment key={index}>
                <li className="text-gray">/</li>
                <li>
                  {isLast || !item.url ? (
                    <span className="text-red">{item.label}</span>
                  ) : (
                    <Link href={item.url} className="hover:text-dark-blue transition-colors">
                      {item.label}
                    </Link>
                  )}
                </li>
              </React.Fragment>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

function generateBreadcrumbs(pathname: string, currentPage?: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const url = '/' + segments.slice(0, index + 1).join('/');

    // Use current_page prop for the last item if provided
    const label = isLast && currentPage
      ? currentPage
      : SLUG_LABELS[segment] || formatSlug(segment);

    items.push({
      label,
      url: isLast ? undefined : url,
    });
  });

  return items;
}

function formatSlug(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

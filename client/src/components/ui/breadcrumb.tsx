import React from 'react';
import { Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumbs component with structured data for SEO
 */
export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@id': `https://tsgfulfillment.com${item.href}`,
        'name': item.label
      }
    }))
  };

  return (
    <>
      {/* Hidden JSON-LD structured data for SEO */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Visible breadcrumbs */}
      <nav 
        aria-label="Breadcrumbs"
        className={`flex items-center space-x-1 text-sm ${className}`}
      >
        <ol className="flex items-center space-x-1" role="list">
          <li className="flex items-center">
            <Link 
              href="/" 
              className="text-gray-500 hover:text-primary transition-colors flex items-center"
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </Link>
          </li>
          
          {items.map((item, index) => (
            <li 
              key={index}
              className="flex items-center"
              aria-current={item.isCurrent ? 'page' : undefined}
            >
              <ChevronRight className="h-4 w-4 text-gray-400 mx-1" aria-hidden="true" />
              {item.isCurrent ? (
                <span className="font-medium text-gray-700">{item.label}</span>
              ) : (
                <Link 
                  href={item.href}
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

export default Breadcrumbs;
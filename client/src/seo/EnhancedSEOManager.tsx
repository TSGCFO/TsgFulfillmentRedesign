/**
 * Enhanced SEO Manager Component
 * Advanced SEO management with performance optimization and schema markup
 */

import React, { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG, PAGE_TEMPLATES, STRUCTURED_DATA_TEMPLATES } from './seo-config';
import { ADVANCED_SCHEMA_TEMPLATES, generatePageSchema } from './advanced-schema';
import { seoPerformanceOptimizer } from './performance-optimizer';
import { generateTitle, generateCanonicalUrl, generateDescription } from './utils';

export interface EnhancedSEOProps {
  // Basic SEO
  page?: keyof typeof PAGE_TEMPLATES;
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  noIndex?: boolean;
  
  // Open Graph & Social
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'place';
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  
  // Structured Data
  structuredData?: object[];
  breadcrumbs?: Array<{ name: string; url: string }>;
  
  // Performance & Technical
  criticalImages?: string[];
  preloadResources?: string[];
  prefetchPages?: string[];
  enablePerformanceOptimization?: boolean;
  
  // Content specific
  lastModified?: string;
  publishedDate?: string;
  author?: string;
  articleSection?: string;
  
  // Multi-language
  hreflang?: Array<{ lang: string; url: string }>;
  
  // Business specific
  industry?: string;
  serviceType?: string;
  
  children?: React.ReactNode;
}

export const EnhancedSEOManager: React.FC<EnhancedSEOProps> = ({
  page,
  title,
  description,
  keywords = [],
  canonical,
  noIndex = false,
  ogImage,
  ogType = 'website',
  ogUrl,
  twitterCard = 'summary_large_image',
  structuredData = [],
  breadcrumbs = [],
  criticalImages = [],
  preloadResources = [],
  prefetchPages = [],
  enablePerformanceOptimization = true,
  lastModified,
  publishedDate,
  author,
  articleSection,
  hreflang = [],
  industry,
  serviceType,
  children
}) => {
  // Get page template configuration
  const pageTemplate = page ? PAGE_TEMPLATES[page] : null;
  
  // Generate final meta values
  const finalTitle = useMemo(() => 
    generateTitle(title || pageTemplate?.title || SITE_CONFIG.defaultTitle),
    [title, pageTemplate?.title]
  );
  
  const finalDescription = useMemo(() => 
    generateDescription(description || pageTemplate?.description || SITE_CONFIG.defaultDescription),
    [description, pageTemplate?.description]
  );
  
  const finalKeywords = useMemo(() => {
    const baseKeywords = keywords.length > 0 ? keywords : 
      (pageTemplate?.keywords ? pageTemplate.keywords.split(', ') : SITE_CONFIG.defaultKeywords.split(', '));
    return baseKeywords.join(', ');
  }, [keywords, pageTemplate?.keywords]);
  
  const canonicalUrl = useMemo(() => 

    canonical || (typeof window !== 'undefined' ? generateCanonicalUrl(window.location.pathname) : ''),

    [canonical]
  );
  
  const ogImageUrl = useMemo(() => {
    const imageUrl = ogImage || SITE_CONFIG.defaultImage;
    return imageUrl.startsWith('http') ? imageUrl : `${SITE_CONFIG.siteUrl}${imageUrl}`;
  }, [ogImage]);
  
  // Generate structured data
  const allStructuredData = useMemo(() => {
    const data = [...structuredData];
    
    // Add page-specific schema
    if (page) {
      const pageSchemas = generatePageSchema[page as keyof typeof generatePageSchema];
      if (pageSchemas) {
        if (typeof pageSchemas === 'function') {
          // Handle dynamic schemas
          if (industry && serviceType) {
            const dynamicSchemas = (pageSchemas as any)(industry, [serviceType]);
            if (Array.isArray(dynamicSchemas)) {
              data.push(...dynamicSchemas);
            }
          } else {
            const defaultSchemas = (pageSchemas as any)();
            if (Array.isArray(defaultSchemas)) {
              data.push(...defaultSchemas);
            }
          }
        } else if (Array.isArray(pageSchemas)) {
          data.push(...pageSchemas);
        } else if (pageSchemas) {
          data.push(pageSchemas);
        }
      }
    }
    
    // Add breadcrumb schema
    if (breadcrumbs.length > 0) {
      data.push(STRUCTURED_DATA_TEMPLATES.breadcrumb(breadcrumbs));
    }
    
    // Add website schema if not already present
    const hasWebsiteSchema = data.some(schema => 
      typeof schema === 'object' && schema !== null && '@type' in schema && schema['@type'] === 'WebSite'
    );
    if (!hasWebsiteSchema) {
      data.push(STRUCTURED_DATA_TEMPLATES.website);
    }
    
    return data;
  }, [structuredData, page, breadcrumbs, industry, serviceType]);
  
  // Performance optimization resources
  const performanceResources = useMemo(() => {
    if (!enablePerformanceOptimization) return { resourceHints: [], fontPreloads: [], imagePreloads: [] };
    
    return {
      resourceHints: seoPerformanceOptimizer.generateResourceHints(),
      fontPreloads: seoPerformanceOptimizer.generateFontPreloads(),
      imagePreloads: seoPerformanceOptimizer.generateImagePreloads(criticalImages)
    };
  }, [enablePerformanceOptimization, criticalImages]);
  
  // Initialize performance monitoring
  useEffect(() => {
    if (!enablePerformanceOptimization) return;
    
    // Preload critical resources
    if (preloadResources.length > 0) {
      preloadResources.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = src;
        link.as = src.endsWith('.css') ? 'style' : 
                  src.endsWith('.js') ? 'script' : 
                  src.match(/\.(jpg|jpeg|png|webp|avif|svg)$/i) ? 'image' : 'fetch';
        if (link.as === 'font') link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    }
    
    // Prefetch next pages
    if (prefetchPages.length > 0) {
      prefetchPages.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
      });
    }
  }, [preloadResources, prefetchPages, enablePerformanceOptimization]);
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl || canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={finalTitle} />
      <meta property="og:site_name" content={SITE_CONFIG.siteName} />
      <meta property="og:locale" content={SITE_CONFIG.locale} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:image:alt" content={finalTitle} />
      
      {/* Article-specific meta */}
      {publishedDate && <meta property="article:published_time" content={publishedDate} />}
      {lastModified && <meta property="article:modified_time" content={lastModified} />}
      {author && <meta property="article:author" content={author} />}
      {articleSection && <meta property="article:section" content={articleSection} />}
      
      {/* Technical Meta Tags */}
      <meta name="theme-color" content={SITE_CONFIG.themeColor} />
      <meta name="msapplication-TileColor" content={SITE_CONFIG.themeColor} />
      <meta name="application-name" content={SITE_CONFIG.siteName} />
      <meta name="apple-mobile-web-app-title" content={SITE_CONFIG.siteName} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Geographic Tags */}
      <meta name="geo.region" content="CA-ON" />
      <meta name="geo.placename" content="Vaughan, Ontario" />
      <meta name="geo.position" content="43.7866333;-79.6527142" />
      <meta name="ICBM" content="43.7866333, -79.6527142" />
      
      {/* Language Tags */}
      <meta httpEquiv="content-language" content={SITE_CONFIG.language} />
      {hreflang.map(({ lang, url }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Performance Resource Hints */}
      {performanceResources.resourceHints.map((hint, index) => (
        <link
          key={`hint-${index}`}
          rel={hint.rel}
          href={hint.href}
          {...(hint.as && { as: hint.as })}

          {...(hint.crossorigin && { crossOrigin: hint.crossorigin as 'anonymous' | 'use-credentials' })}

        />
      ))}
      
      {/* Font Preloads */}
      {performanceResources.fontPreloads.map((font, index) => (
        <link
          key={`font-${index}`}
          rel={font.rel}
          href={font.href}
          as={font.as}
          type={font.type}

          crossOrigin={font.crossorigin as 'anonymous' | 'use-credentials'}

        />
      ))}
      
      {/* Image Preloads */}
      {performanceResources.imagePreloads.map((image, index) => (
        <link
          key={`image-${index}`}
          rel={image.rel}
          href={image.href}
          as={image.as}

          {...(image.fetchpriority && { 
            fetchPriority: image.fetchpriority as 'high' | 'low' | 'auto' 
          })}

        />
      ))}
      
      {/* Critical CSS */}
      {enablePerformanceOptimization && (
        <style type="text/css">
          {seoPerformanceOptimizer.generateCriticalCSS()}
        </style>
      )}
      
      {/* Structured Data */}
      {allStructuredData.map((data, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data, null, 0)
          }}
        />
      ))}
      
      {/* Additional head elements */}
      {children}
    </Helmet>
  );
};

export default EnhancedSEOManager;
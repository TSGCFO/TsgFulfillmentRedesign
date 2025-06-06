import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG, PAGE_TEMPLATES, STRUCTURED_DATA_TEMPLATES, META_ROBOTS, PRELOAD_RESOURCES } from './seo-config';

interface SEOManagerProps {
  page?: keyof typeof PAGE_TEMPLATES;
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'place';
  noIndex?: boolean;
  structuredData?: Record<string, any> | Record<string, any>[];
  breadcrumbs?: Array<{ name: string; url: string }>;
  hreflang?: Array<{ lang: string; url: string }>;
  preloadImages?: string[];
  alternatePages?: Array<{ url: string; title: string }>;
  lastModified?: string;
  children?: React.ReactNode;
}

export const SEOManager: React.FC<SEOManagerProps> = ({
  page,
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType,
  noIndex = false,
  structuredData,
  breadcrumbs,
  hreflang = [],
  preloadImages = [],
  alternatePages = [],
  lastModified,
  children
}) => {
  // Get page template or use custom values
  const pageTemplate = page ? PAGE_TEMPLATES[page] : null;
  
  const finalTitle = title || pageTemplate?.title || SITE_CONFIG.defaultTitle;
  const finalDescription = description || pageTemplate?.description || SITE_CONFIG.defaultDescription;
  const finalKeywords = keywords || pageTemplate?.keywords || SITE_CONFIG.defaultKeywords;
  const finalOgType = ogType || pageTemplate?.ogType || 'website';
  
  const canonicalUrl = canonical || `${SITE_CONFIG.siteUrl}${window.location.pathname}`;
  const ogImageUrl = ogImage || SITE_CONFIG.defaultImage;
  const fullOgImageUrl = ogImageUrl.startsWith('http') ? ogImageUrl : `${SITE_CONFIG.siteUrl}${ogImageUrl}`;

  // Generate combined structured data
  const combinedStructuredData = [];
  
  // Always include organization and website data
  combinedStructuredData.push(STRUCTURED_DATA_TEMPLATES.organization);
  combinedStructuredData.push(STRUCTURED_DATA_TEMPLATES.website);
  
  // Add page-specific structured data
  if (page === 'locations') {
    combinedStructuredData.push(STRUCTURED_DATA_TEMPLATES.localBusiness);
  }
  
  // Add breadcrumbs if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    combinedStructuredData.push(STRUCTURED_DATA_TEMPLATES.breadcrumb(breadcrumbs));
  }
  
  // Add custom structured data
  if (structuredData) {
    if (Array.isArray(structuredData)) {
      combinedStructuredData.push(...structuredData);
    } else {
      combinedStructuredData.push(structuredData);
    }
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={SITE_CONFIG.siteName} />
      <meta name="robots" content={noIndex ? META_ROBOTS.noindex : META_ROBOTS.index} />
      
      {/* Language and Locale */}
      <html lang={SITE_CONFIG.language} />
      <meta httpEquiv="content-language" content={SITE_CONFIG.language} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={finalOgType} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={fullOgImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={finalTitle} />
      <meta property="og:site_name" content={SITE_CONFIG.siteName} />
      <meta property="og:locale" content={SITE_CONFIG.locale} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
      <meta name="twitter:creator" content={SITE_CONFIG.twitterHandle} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={fullOgImageUrl} />
      <meta name="twitter:image:alt" content={finalTitle} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content={SITE_CONFIG.themeColor} />
      <meta name="msapplication-TileColor" content={SITE_CONFIG.themeColor} />
      <meta name="application-name" content={SITE_CONFIG.siteName} />
      <meta name="apple-mobile-web-app-title" content={SITE_CONFIG.siteName} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Geographic Tags */}
      <meta name="geo.region" content="CA-ON" />
      <meta name="geo.placename" content="Vaughan, Ontario" />
      <meta name="geo.position" content="43.7866333;-79.6527142" />
      <meta name="ICBM" content="43.7866333, -79.6527142" />
      
      {/* Business Information */}
      <meta name="contact:phone_number" content="+1-289-815-5869" />
      <meta name="contact:email" content="info@tsgfulfillment.com" />
      
      {/* Last Modified */}
      {lastModified && <meta name="last-modified" content={lastModified} />}
      
      {/* Hreflang Tags */}
      {hreflang.map(({ lang, url }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Preload Critical Resources */}
      {PRELOAD_RESOURCES.map((resource, index) => (
        <link
          key={index}
          rel="preload"
          href={resource.href}
          as={resource.as}
          type={resource.type}
          {...(resource.crossorigin && { crossOrigin: resource.crossorigin as 'anonymous' | 'use-credentials' })}
          {...(resource.fetchpriority && { fetchPriority: resource.fetchpriority as 'high' | 'low' | 'auto' })}
        />
      ))}
      
      {/* Preload Page-Specific Images */}
      {preloadImages.map((image, index) => (
        <link
          key={index}
          rel="preload"
          as="image"
          href={image.startsWith('http') ? image : `${SITE_CONFIG.siteUrl}${image}`}
        />
      ))}
      
      {/* Alternate Pages */}
      {alternatePages.map(({ url, title: altTitle }) => (
        <link key={url} rel="alternate" href={url} title={altTitle} />
      ))}
      
      {/* DNS Prefetch for External Resources */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      
      {/* Structured Data */}
      {combinedStructuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data, null, 0)
          }}
        />
      ))}
      
      {/* Additional Custom Head Elements */}
      {children}
    </Helmet>
  );
};

export default SEOManager;
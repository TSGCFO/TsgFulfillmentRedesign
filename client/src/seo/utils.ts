/**
 * SEO Utility Functions
 * Helper functions for generating SEO-optimized content and metadata
 */

import { SITE_CONFIG } from './seo-config';

/**
 * Generate optimized page title
 */
export const generateTitle = (pageTitle: string, includeCompany: boolean = true): string => {
  if (!includeCompany || pageTitle.includes('TSG Fulfillment')) {
    return pageTitle;
  }
  return `${pageTitle} | ${SITE_CONFIG.siteName}`;
};

/**
 * Generate canonical URL
 */
export const generateCanonicalUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.siteUrl}${cleanPath}`;
};

/**
 * Generate optimized meta description
 */
export const generateDescription = (content: string, maxLength: number = 160): string => {
  if (content.length <= maxLength) return content;
  
  // Find the last complete sentence within the limit
  const truncated = content.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  
  if (lastSentence > maxLength * 0.7) {
    return content.substring(0, lastSentence + 1);
  }
  
  // If no good sentence break, truncate at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  return content.substring(0, lastSpace) + '...';
};

/**
 * Generate keywords from content
 */
export const generateKeywords = (
  baseKeywords: string[],
  contentKeywords: string[] = [],
  location: string[] = ['Ontario', 'Toronto', 'GTA', 'Canada']
): string => {
  const allKeywords = [
    ...baseKeywords,
    ...contentKeywords,
    ...location.map(loc => `${baseKeywords[0]} ${loc}`)
  ];
  
  // Remove duplicates and limit to reasonable number
  return Array.from(new Set(allKeywords)).slice(0, 15).join(', ');
};

/**
 * Generate breadcrumb data
 */
export const generateBreadcrumbs = (path: string): Array<{ name: string; url: string }> => {
  const pathSegments = path.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Home', url: '/' }];
  
  let currentPath = '';
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    const name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    breadcrumbs.push({ name, url: currentPath });
  }
  
  return breadcrumbs;
};

/**
 * Generate FAQ structured data
 */
export const generateFAQStructuredData = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

/**
 * Generate service structured data
 */
export const generateServiceStructuredData = (
  serviceName: string,
  description: string,
  url: string,
  price?: string
) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": serviceName,
  "description": description,
  "url": generateCanonicalUrl(url),
  "provider": {
    "@type": "Organization",
    "name": SITE_CONFIG.siteName,
    "url": SITE_CONFIG.siteUrl
  },
  "areaServed": {
    "@type": "State",
    "name": "Ontario"
  },
  "serviceType": "Logistics and Fulfillment Services",
  ...(price && {
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "CAD"
    }
  })
});

/**
 * Generate article structured data
 */
export const generateArticleStructuredData = (
  title: string,
  description: string,
  url: string,
  publishDate: string,
  modifiedDate?: string
) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title,
  "description": description,
  "url": generateCanonicalUrl(url),
  "datePublished": publishDate,
  "dateModified": modifiedDate || publishDate,
  "author": {
    "@type": "Organization",
    "name": SITE_CONFIG.siteName
  },
  "publisher": {
    "@type": "Organization",
    "name": SITE_CONFIG.siteName,
    "logo": {
      "@type": "ImageObject",
      "url": `${SITE_CONFIG.siteUrl}/images/logo.png`
    }
  }
});

/**
 * Generate local business hours structured data
 */
export const generateBusinessHoursStructuredData = () => [
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "17:00"
  },
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Saturday", "Sunday"],
    "opens": "00:00",
    "closes": "00:00"
  }
];

/**
 * Validate and optimize image URLs for SEO
 */
export const optimizeImageUrl = (
  imageUrl: string,
  alt: string,
  width?: number,
  height?: number
): { src: string; alt: string; width?: number; height?: number } => {
  const src = imageUrl.startsWith('http') ? imageUrl : `${SITE_CONFIG.siteUrl}${imageUrl}`;
  
  return {
    src,
    alt: alt.trim(),
    ...(width && { width }),
    ...(height && { height })
  };
};

/**
 * Generate social media sharing URLs
 */
export const generateSharingUrls = (url: string, title: string, description: string) => ({
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&via=tsgfulfillment`,
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + ' ' + url)}`
});

/**
 * Generate robots.txt content
 */
export const generateRobotsTxt = (): string => {
  return `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Sitemaps
Sitemap: ${SITE_CONFIG.siteUrl}/sitemap.xml
Sitemap: ${SITE_CONFIG.siteUrl}/sitemap-images.xml

# Crawl-delay
Crawl-delay: 1`;
};

/**
 * Generate sitemap URLs
 */
export const generateSitemapUrls = () => {
  const basePages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/services', priority: 0.9, changefreq: 'weekly' },
    { url: '/about', priority: 0.8, changefreq: 'monthly' },
    { url: '/contact', priority: 0.9, changefreq: 'weekly' },
    { url: '/locations', priority: 0.8, changefreq: 'monthly' },
    { url: '/quote', priority: 0.9, changefreq: 'weekly' }
  ];

  return basePages.map(page => ({
    ...page,
    url: generateCanonicalUrl(page.url),
    lastmod: new Date().toISOString().split('T')[0]
  }));
};

/**
 * Generate contact point structured data
 */
export const generateContactPointStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "ContactPoint",
  "telephone": "+1-289-815-5869",
  "contactType": "customer service",
  "email": "info@tsgfulfillment.com",
  "areaServed": ["CA", "Ontario", "Toronto", "GTA"],
  "availableLanguage": ["English"],
  "hoursAvailable": generateBusinessHoursStructuredData()
});

/**
 * Generate local business structured data
 */
export const generateLocalBusinessStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": SITE_CONFIG.siteName,
  "image": `${SITE_CONFIG.siteUrl}/images/warehouse-exterior.jpg`,
  "url": SITE_CONFIG.siteUrl,
  "telephone": "+1-289-815-5869",
  "email": "info@tsgfulfillment.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "6750 Langstaff Road",
    "addressLocality": "Vaughan",
    "addressRegion": "Ontario",
    "postalCode": "L4H 5K2",
    "addressCountry": "CA"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 43.7866333,
    "longitude": -79.6527142
  },
  "openingHoursSpecification": generateBusinessHoursStructuredData(),
  "priceRange": "$$",
  "areaServed": ["Ontario", "Toronto", "GTA", "Canada"]
});

/**
 * Generate how-to structured data
 */
export const generateHowToStructuredData = (
  name: string,
  description: string,
  steps: Array<{ name: string; text: string }>
) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": name,
  "description": description,
  "image": `${SITE_CONFIG.siteUrl}/images/og-default.jpg`,
  "totalTime": "PT30M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "CAD",
    "value": "0"
  },
  "step": steps.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": step.name,
    "text": step.text
  }))
});

/**
 * Generate testimonial structured data
 */
export const generateTestimonialStructuredData = (
  testimonials: Array<{ name: string; text: string; company?: string; rating?: number }>
) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": SITE_CONFIG.siteName,
  "review": testimonials.map(testimonial => ({
    "@type": "Review",
    "reviewBody": testimonial.text,
    "author": {
      "@type": "Person",
      "name": testimonial.name,
      ...(testimonial.company && {
        "worksFor": {
          "@type": "Organization",
          "name": testimonial.company
        }
      })
    },
    ...(testimonial.rating && {
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": testimonial.rating,
        "bestRating": 5
      }
    })
  }))
});

/**
 * Optimize title for SEO best practices
 */
export const optimizeTitle = (title: string, maxLength: number = 60): string => {
  if (title.length <= maxLength) return title;
  
  const truncated = title.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};

/**
 * Generate hreflang tags
 */
export const generateHreflangTags = (currentPath: string): Array<{ lang: string; url: string }> => [
  { lang: 'en-CA', url: generateCanonicalUrl(currentPath) },
  { lang: 'en', url: generateCanonicalUrl(currentPath) },
  { lang: 'x-default', url: generateCanonicalUrl(currentPath) }
];

/**
 * Generate preload links for performance
 */
export const generatePreloadLinks = (images: string[] = []): Array<{ href: string; as: string; type?: string }> => {
  const defaultPreloads = [
    { href: '/images/logo.png', as: 'image' },
    { href: '/fonts/poppins-v20-latin-regular.woff2', as: 'font', type: 'font/woff2' },
    { href: '/fonts/poppins-v20-latin-600.woff2', as: 'font', type: 'font/woff2' }
  ];
  
  const imagePreloads = images.map(image => ({ href: image, as: 'image' }));
  
  return [...defaultPreloads, ...imagePreloads];
};
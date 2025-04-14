import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  prevPage?: string;
  nextPage?: string;
  jsonLd?: Record<string, any>;
  hreflang?: Array<{ lang: string, url: string }>;
}

/**
 * Custom hook to manage SEO metadata across the site
 * @param props - SEO configuration object
 */
export function useSEO({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noIndex = false,
  prevPage,
  nextPage,
  jsonLd,
  hreflang = []
}: SEOProps): void {
  
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title.includes('TSG Fulfillment') 
        ? title 
        : `${title} | TSG Fulfillment Services`;
    }
    
    // Update meta description
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        const newMetaDescription = document.createElement('meta');
        newMetaDescription.setAttribute('name', 'description');
        newMetaDescription.setAttribute('content', description);
        document.head.appendChild(newMetaDescription);
      }
    }
    
    // Set canonical URL
    if (canonicalUrl) {
      const fullCanonicalUrl = canonicalUrl.startsWith('http') 
        ? canonicalUrl 
        : `https://tsgfulfillment.com${canonicalUrl}`;
        
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', fullCanonicalUrl);
    }
    
    // Handle Open Graph metadata
    if (ogImage) {
      const fullOgImageUrl = ogImage.startsWith('http') ? ogImage : `https://tsgfulfillment.com${ogImage}`;
      
      // og:image
      let ogImageMeta = document.querySelector('meta[property="og:image"]');
      if (!ogImageMeta) {
        ogImageMeta = document.createElement('meta');
        ogImageMeta.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageMeta);
      }
      ogImageMeta.setAttribute('content', fullOgImageUrl);
    }
    
    // og:type
    let ogTypeMeta = document.querySelector('meta[property="og:type"]');
    if (!ogTypeMeta) {
      ogTypeMeta = document.createElement('meta');
      ogTypeMeta.setAttribute('property', 'og:type');
      document.head.appendChild(ogTypeMeta);
    }
    ogTypeMeta.setAttribute('content', ogType);
    
    // Update title and description for Open Graph
    if (title) {
      let ogTitleMeta = document.querySelector('meta[property="og:title"]');
      if (!ogTitleMeta) {
        ogTitleMeta = document.createElement('meta');
        ogTitleMeta.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitleMeta);
      }
      ogTitleMeta.setAttribute('content', title);
    }
    
    if (description) {
      let ogDescMeta = document.querySelector('meta[property="og:description"]');
      if (!ogDescMeta) {
        ogDescMeta = document.createElement('meta');
        ogDescMeta.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescMeta);
      }
      ogDescMeta.setAttribute('content', description);
    }
    
    // Update Twitter Card metadata
    let twitterCardMeta = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCardMeta) {
      twitterCardMeta = document.createElement('meta');
      twitterCardMeta.setAttribute('name', 'twitter:card');
      document.head.appendChild(twitterCardMeta);
    }
    twitterCardMeta.setAttribute('content', twitterCard);
    
    if (ogImage) {
      let twitterImageMeta = document.querySelector('meta[name="twitter:image"]');
      if (!twitterImageMeta) {
        twitterImageMeta = document.createElement('meta');
        twitterImageMeta.setAttribute('name', 'twitter:image');
        document.head.appendChild(twitterImageMeta);
      }
      twitterImageMeta.setAttribute('content', ogImage.startsWith('http') ? ogImage : `https://tsgfulfillment.com${ogImage}`);
    }
    
    // Handle robots meta tag for noindex
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', noIndex ? 'noindex, nofollow' : 'index, follow');
    
    // Handle prev/next pagination links
    if (prevPage) {
      let prevLink = document.querySelector('link[rel="prev"]');
      if (!prevLink) {
        prevLink = document.createElement('link');
        prevLink.setAttribute('rel', 'prev');
        document.head.appendChild(prevLink);
      }
      prevLink.setAttribute('href', prevPage.startsWith('http') ? prevPage : `https://tsgfulfillment.com${prevPage}`);
    } else {
      const existingPrevLink = document.querySelector('link[rel="prev"]');
      if (existingPrevLink) {
        existingPrevLink.remove();
      }
    }
    
    if (nextPage) {
      let nextLink = document.querySelector('link[rel="next"]');
      if (!nextLink) {
        nextLink = document.createElement('link');
        nextLink.setAttribute('rel', 'next');
        document.head.appendChild(nextLink);
      }
      nextLink.setAttribute('href', nextPage.startsWith('http') ? nextPage : `https://tsgfulfillment.com${nextPage}`);
    } else {
      const existingNextLink = document.querySelector('link[rel="next"]');
      if (existingNextLink) {
        existingNextLink.remove();
      }
    }
    
    // Handle JSON-LD structured data
    if (jsonLd) {
      let script = document.getElementById('dynamic-jsonld');
      if (!script) {
        script = document.createElement('script');
        script.id = 'dynamic-jsonld';
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }
    
    // Handle hreflang tags for internationalization
    // First, remove any existing hreflang tags
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    
    // Add new hreflang tags
    hreflang.forEach(({ lang, url }) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', url.startsWith('http') ? url : `https://tsgfulfillment.com${url}`);
      document.head.appendChild(link);
    });
    
    // Return a cleanup function
    return () => {
      // Clean up dynamic JSON-LD when component unmounts
      const dynamicScript = document.getElementById('dynamic-jsonld');
      if (dynamicScript) {
        dynamicScript.remove();
      }
    };
  }, [
    title,
    description,
    canonicalUrl,
    ogImage,
    ogType,
    twitterCard,
    noIndex,
    prevPage,
    nextPage,
    jsonLd,
    hreflang
  ]);
}

export default useSEO;
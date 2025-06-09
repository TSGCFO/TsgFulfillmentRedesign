/**
 * Critical SEO Optimizations
 * Advanced SEO features for enterprise-level search engine optimization
 */

export interface SEOAuditResult {
  score: number;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    category: 'performance' | 'accessibility' | 'seo' | 'best-practices';
    message: string;
    fix: string;
  }>;
  recommendations: string[];
}

export interface CriticalResourceOptions {
  preloadFonts: boolean;
  optimizeImages: boolean;
  enableServiceWorker: boolean;
  criticalCSS: boolean;
  resourceHints: boolean;
}

class CriticalSEOOptimizer {
  private config: CriticalResourceOptions;

  constructor(config: CriticalResourceOptions) {
    this.config = config;
  }

  /**
   * Perform comprehensive SEO audit
   */
  performSEOAudit(): SEOAuditResult {
    const issues: SEOAuditResult['issues'] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check meta tags
    const titleTag = document.querySelector('title');
    if (!titleTag || titleTag.textContent!.length < 30) {
      issues.push({
        type: 'error',
        category: 'seo',
        message: 'Title tag is missing or too short',
        fix: 'Add descriptive title tag (30-60 characters)'
      });
      score -= 10;
    }

    const metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription || metaDescription.getAttribute('content')!.length < 120) {
      issues.push({
        type: 'warning',
        category: 'seo',
        message: 'Meta description is missing or too short',
        fix: 'Add compelling meta description (120-160 characters)'
      });
      score -= 5;
    }

    // Check heading structure
    const h1Tags = document.querySelectorAll('h1');
    if (h1Tags.length !== 1) {
      issues.push({
        type: 'warning',
        category: 'seo',
        message: h1Tags.length === 0 ? 'Missing H1 tag' : 'Multiple H1 tags found',
        fix: 'Use exactly one H1 tag per page'
      });
      score -= 5;
    }

    // Check image alt tags
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: 'warning',
        category: 'accessibility',
        message: `${imagesWithoutAlt.length} images missing alt text`,
        fix: 'Add descriptive alt text to all images'
      });
      score -= Math.min(10, imagesWithoutAlt.length * 2);
    }

    // Check structured data
    const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
    if (structuredData.length === 0) {
      issues.push({
        type: 'info',
        category: 'seo',
        message: 'No structured data found',
        fix: 'Add JSON-LD structured data for better search visibility'
      });
      score -= 5;
    }

    // Performance checks
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        if (loadTime > 3000) {
          issues.push({
            type: 'warning',
            category: 'performance',
            message: 'Page load time is slow',
            fix: 'Optimize images, enable compression, and use CDN'
          });
          score -= 10;
        }
      }
    }

    // Generate recommendations
    if (score > 90) {
      recommendations.push('Excellent SEO implementation! Consider adding FAQ schema for featured snippets.');
    } else if (score > 80) {
      recommendations.push('Good SEO foundation. Focus on performance optimization and content quality.');
    } else {
      recommendations.push('SEO needs improvement. Address critical issues first, then enhance with structured data.');
    }

    return { score, issues, recommendations };
  }

  /**
   * Generate service worker for advanced caching
   */
  generateServiceWorker(): string {
    return `
// TSG Fulfillment Service Worker
const CACHE_NAME = 'tsg-fulfillment-v1';
const STATIC_CACHE = 'tsg-static-v1';
const DYNAMIC_CACHE = 'tsg-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/images/logo.png',
  '/css/critical.css',
  '/fonts/poppins-v20-latin-regular.woff2',
  '/fonts/poppins-v20-latin-600.woff2'
];

const CACHE_STRATEGIES = {
  images: 'cache-first',
  api: 'network-first',
  pages: 'stale-while-revalidate'
};

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then(cache => {
        return fetch(request).then(response => {
          if (response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => cache.match(request));
      })
    );
    return;
  }

  // Handle images
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(fetchResponse => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request);
    })
  );
});
`;
  }

  /**
   * Generate critical CSS for above-the-fold content
   */
  generateCriticalCSS(): string {
    return `
/* Critical CSS for TSG Fulfillment */
:root {
  --primary-color: #0056B3;
  --secondary-color: #004494;
  --background-color: #ffffff;
  --text-color: #333333;
  --border-color: #e5e5e5;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Poppins', system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--background-color);
}

/* Critical above-the-fold styles */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
}

.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 1rem;
}

.hero-content {
  max-width: 1200px;
  text-align: center;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  color: #64748b;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.cta-button:hover {
  background: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 86, 179, 0.3);
}

.logo {
  height: 2.5rem;
  width: auto;
}

/* Loading states */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 0.25rem;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .hero-section {
    padding: 1rem;
    min-height: 90vh;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .cta-button {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
}

/* Font loading optimization */
@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/poppins-v20-latin-regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/poppins-v20-latin-600.woff2') format('woff2');
}
`;
  }

  /**
   * Generate enhanced robots.txt with advanced directives
   */
  generateAdvancedRobotsTxt(): string {
    return `# TSG Fulfillment Advanced Robots.txt
User-agent: *
Allow: /

# Performance optimizations
Disallow: /admin/
Disallow: /test/
Disallow: /dev/
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*ref=*
Disallow: /*?*fbclid=*
Disallow: /*?*gclid=*
Disallow: /*?*source=*
Disallow: /*?*medium=*

# Allow critical resources
Allow: /images/
Allow: /css/
Allow: /js/
Allow: /fonts/
Allow: /manifest.json
Allow: /service-worker.js

# SEO-specific directives
Crawl-delay: 1
Request-rate: 1/1s

# Sitemap references
Sitemap: https://tsgfulfillment.com/sitemap.xml
Sitemap: https://tsgfulfillment.com/sitemap-main.xml
Sitemap: https://tsgfulfillment.com/sitemap-images.xml
Sitemap: https://tsgfulfillment.com/sitemap-services.xml

# Host directive
Host: https://tsgfulfillment.com

# Search engine specific optimizations
User-agent: Googlebot
Crawl-delay: 0.5

User-agent: Bingbot
Crawl-delay: 1

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /
`;
  }

  /**
   * Generate comprehensive manifest.json for PWA
   */
  generateWebAppManifest(): object {
    return {
      name: "TSG Fulfillment Services",
      short_name: "TSG Fulfillment",
      description: "Professional order fulfillment, warehousing, and logistics services in Ontario",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#0056B3",
      orientation: "portrait-primary",
      scope: "/",
      lang: "en-CA",
      categories: ["business", "logistics", "fulfillment"],
      icons: [
        {
          src: "/images/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: "/images/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ],
      shortcuts: [
        {
          name: "Get Quote",
          short_name: "Quote",
          description: "Request a fulfillment quote",
          url: "/quote",
          icons: [{ src: "/images/quote-icon.png", sizes: "96x96" }]
        },
        {
          name: "Services",
          short_name: "Services",
          description: "View our services",
          url: "/services",
          icons: [{ src: "/images/services-icon.png", sizes: "96x96" }]
        }
      ]
    };
  }

  /**
   * Optimize images with modern formats and compression
   */
  generateImageOptimizationScript(): string {
    return `
// Image Optimization Handler
class ImageOptimizer {
  constructor() {
    this.supportedFormats = this.detectSupportedFormats();
    this.observeImages();
  }

  detectSupportedFormats() {
    const formats = {
      webp: false,
      avif: false
    };

    // Check WebP support
    const webp = document.createElement('canvas');
    webp.width = 1;
    webp.height = 1;
    formats.webp = webp.toDataURL('image/webp').indexOf('data:image/webp') === 0;

    // Check AVIF support
    const avif = new Image();
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    formats.avif = avif.complete && avif.naturalWidth > 0;

    return formats;
  }

  observeImages() {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadOptimizedImage(entry.target);
          imageObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px'
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  loadOptimizedImage(img) {
    const src = img.dataset.src;
    if (!src) return;

    let optimizedSrc = src;
    
    // Use modern format if supported
    if (this.supportedFormats.avif && src.includes('.jpg')) {
      optimizedSrc = src.replace('.jpg', '.avif');
    } else if (this.supportedFormats.webp && src.includes('.jpg')) {
      optimizedSrc = src.replace('.jpg', '.webp');
    }

    img.src = optimizedSrc;
    img.classList.add('loaded');
  }
}

// Initialize on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ImageOptimizer());
} else {
  new ImageOptimizer();
}
`;
  }
}

export const criticalSEOOptimizer = new CriticalSEOOptimizer({
  preloadFonts: true,
  optimizeImages: true,
  enableServiceWorker: true,
  criticalCSS: true,
  resourceHints: true
});

export default CriticalSEOOptimizer;
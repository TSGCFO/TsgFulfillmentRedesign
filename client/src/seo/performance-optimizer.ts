/**
 * Advanced SEO Performance Optimizer
 * Handles resource preloading, critical CSS, and performance monitoring
 */

export interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

export interface SEOPerformanceConfig {
  enableResourceHints: boolean;
  enableCriticalCSS: boolean;
  enableImageOptimization: boolean;
  enableFontPreloading: boolean;
  monitorCoreWebVitals: boolean;
}

class SEOPerformanceOptimizer {
  private config: SEOPerformanceConfig;
  private metrics: Partial<PerformanceMetrics> = {};
  private observer: PerformanceObserver | null = null;

  constructor(config: SEOPerformanceConfig) {
    this.config = config;
    this.initializeMonitoring();
  }

  /**
   * Initialize Core Web Vitals monitoring
   */
  private initializeMonitoring(): void {
    if (!this.config.monitorCoreWebVitals || typeof window === 'undefined') return;

    // Monitor Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entry) => {
      this.metrics.lcp = entry.startTime;
    });

    // Monitor First Input Delay (FID)
    this.observeMetric('first-input', (entry) => {
      this.metrics.fid = entry.processingStart - entry.startTime;
    });

    // Monitor Cumulative Layout Shift (CLS)
    this.observeMetric('layout-shift', (entry) => {
      if (!entry.hadRecentInput) {
        this.metrics.cls = (this.metrics.cls || 0) + entry.value;
      }
    });

    // Monitor navigation timing
    if (window.performance && window.performance.getEntriesByType) {
      const navigationEntries = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const entry = navigationEntries[0];
        this.metrics.ttfb = entry.responseStart - entry.requestStart;
        this.metrics.fcp = entry.loadEventStart - entry.navigationStart;
      }
    }
  }

  /**
   * Observe specific performance metrics
   */
  private observeMetric(entryType: string, callback: (entry: any) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(callback);
      });
      observer.observe({ entryTypes: [entryType] });
    } catch (error) {
      console.warn(`Failed to observe ${entryType}:`, error);
    }
  }

  /**
   * Generate resource hints for better loading performance
   */
  generateResourceHints(): Array<{ rel: string; href: string; as?: string; crossorigin?: string }> {
    if (!this.config.enableResourceHints) return [];

    return [
      // DNS prefetch for external resources
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
      { rel: 'dns-prefetch', href: '//cdnjs.cloudflare.com' },
      
      // Preconnect to critical origins
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
      
      // Prefetch likely next pages
      { rel: 'prefetch', href: '/services' },
      { rel: 'prefetch', href: '/about' },
      { rel: 'prefetch', href: '/contact' },
      { rel: 'prefetch', href: '/quote' }
    ];
  }

  /**
   * Generate font preloading directives
   */
  generateFontPreloads(): Array<{ rel: string; href: string; as: string; type: string; crossorigin: string }> {
    if (!this.config.enableFontPreloading) return [];

    return [
      {
        rel: 'preload',
        href: '/fonts/poppins-v20-latin-regular.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous'
      },
      {
        rel: 'preload',
        href: '/fonts/poppins-v20-latin-600.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous'
      },
      {
        rel: 'preload',
        href: '/fonts/poppins-v20-latin-700.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous'
      }
    ];
  }

  /**
   * Generate image preloading for critical above-the-fold images
   */
  generateImagePreloads(criticalImages: string[]): Array<{ rel: string; href: string; as: string; fetchpriority?: string }> {
    if (!this.config.enableImageOptimization) return [];

    return criticalImages.map((src, index) => ({
      rel: 'preload',
      href: src,
      as: 'image',
      fetchpriority: index === 0 ? 'high' : undefined
    }));
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Calculate performance score based on Core Web Vitals
   */
  calculatePerformanceScore(): number {
    const { lcp, fid, cls } = this.metrics;
    
    if (!lcp || !fid || cls === undefined) return 0;

    // Scoring based on Google's Core Web Vitals thresholds
    const lcpScore = lcp <= 2500 ? 100 : lcp <= 4000 ? 50 : 0;
    const fidScore = fid <= 100 ? 100 : fid <= 300 ? 50 : 0;
    const clsScore = cls <= 0.1 ? 100 : cls <= 0.25 ? 50 : 0;

    return Math.round((lcpScore + fidScore + clsScore) / 3);
  }

  /**
   * Generate critical CSS for above-the-fold content
   */
  generateCriticalCSS(): string {
    if (!this.config.enableCriticalCSS) return '';

    return `
      /* Critical CSS for above-the-fold content */
      .hero-section {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .navbar {
        position: fixed;
        top: 0;
        width: 100%;
        z-index: 1000;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
      }
      
      .hero-title {
        font-size: clamp(2rem, 5vw, 4rem);
        font-weight: 700;
        line-height: 1.2;
        margin-bottom: 1rem;
      }
      
      .hero-description {
        font-size: clamp(1rem, 2vw, 1.25rem);
        line-height: 1.6;
        opacity: 0.8;
        margin-bottom: 2rem;
      }
      
      .cta-button {
        display: inline-flex;
        align-items: center;
        padding: 0.75rem 2rem;
        background: #0056B3;
        color: white;
        text-decoration: none;
        border-radius: 0.5rem;
        font-weight: 600;
        transition: all 0.2s ease;
      }
      
      .cta-button:hover {
        background: #004494;
        transform: translateY(-2px);
      }
      
      /* Loading states */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
  }

  /**
   * Optimize images with modern formats and loading strategies
   */
  optimizeImage(src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
    loading?: 'lazy' | 'eager';
    fetchpriority?: 'high' | 'low' | 'auto';
  } = {}): { srcSet: string; sizes: string; loading: string; fetchpriority?: string } {
    const {
      width,
      height,
      quality = 85,
      format = 'auto',
      loading = 'lazy',
      fetchpriority
    } = options;

    // Generate responsive srcSet
    const sizes = [480, 768, 1024, 1280, 1920];
    const srcSet = sizes
      .filter(size => !width || size <= width)
      .map(size => {
        const params = new URLSearchParams({
          url: src,
          w: size.toString(),
          q: quality.toString(),
          ...(format !== 'auto' && { f: format })
        });
        return `/_next/image?${params} ${size}w`;
      })
      .join(', ');

    const sizesAttr = width 
      ? `(max-width: 768px) 100vw, ${width}px`
      : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';

    return {
      srcSet,
      sizes: sizesAttr,
      loading,
      ...(fetchpriority && { fetchpriority })
    };
  }

  /**
   * Monitor and report performance issues
   */
  reportPerformanceIssues(): Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }> {
    const issues = [];
    const { lcp, fid, cls, ttfb } = this.metrics;

    if (lcp && lcp > 4000) {
      issues.push({
        type: 'LCP',
        message: 'Largest Contentful Paint is above 4 seconds. Consider optimizing images and reducing server response time.',
        severity: 'high' as const
      });
    } else if (lcp && lcp > 2500) {
      issues.push({
        type: 'LCP',
        message: 'Largest Contentful Paint could be improved. Target under 2.5 seconds.',
        severity: 'medium' as const
      });
    }

    if (fid && fid > 300) {
      issues.push({
        type: 'FID',
        message: 'First Input Delay is above 300ms. Consider reducing JavaScript execution time.',
        severity: 'high' as const
      });
    } else if (fid && fid > 100) {
      issues.push({
        type: 'FID',
        message: 'First Input Delay could be improved. Target under 100ms.',
        severity: 'medium' as const
      });
    }

    if (cls !== undefined && cls > 0.25) {
      issues.push({
        type: 'CLS',
        message: 'Cumulative Layout Shift is above 0.25. Ensure proper image dimensions and avoid layout shifts.',
        severity: 'high' as const
      });
    } else if (cls !== undefined && cls > 0.1) {
      issues.push({
        type: 'CLS',
        message: 'Cumulative Layout Shift could be improved. Target under 0.1.',
        severity: 'medium' as const
      });
    }

    if (ttfb && ttfb > 800) {
      issues.push({
        type: 'TTFB',
        message: 'Time to First Byte is slow. Consider server optimization or CDN implementation.',
        severity: 'medium' as const
      });
    }

    return issues;
  }

  /**
   * Cleanup observers
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Default configuration
export const defaultSEOPerformanceConfig: SEOPerformanceConfig = {
  enableResourceHints: true,
  enableCriticalCSS: true,
  enableImageOptimization: true,
  enableFontPreloading: true,
  monitorCoreWebVitals: true
};

// Export singleton instance
export const seoPerformanceOptimizer = new SEOPerformanceOptimizer(defaultSEOPerformanceConfig);

// Utility functions
export const preloadCriticalResources = (resources: string[]) => {
  if (typeof window === 'undefined') return;

  resources.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = src.endsWith('.css') ? 'style' : 'script';
    document.head.appendChild(link);
  });
};

export const prefetchNextPages = (pages: string[]) => {
  if (typeof window === 'undefined') return;

  pages.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  });
};
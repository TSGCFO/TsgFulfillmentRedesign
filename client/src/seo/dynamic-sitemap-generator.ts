/**
 * Dynamic Sitemap Generator
 * Generates comprehensive XML sitemaps with priority and frequency optimization
 */

import { SITE_CONFIG } from './seo-config';

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: Array<{
    url: string;
    caption?: string;
    title?: string;
    license?: string;
  }>;
  alternates?: Array<{
    rel: string;
    hreflang: string;
    href: string;
  }>;
}

export interface SitemapConfig {
  baseUrl: string;
  defaultChangeFreq: SitemapEntry['changefreq'];
  defaultPriority: number;
  includeImages: boolean;
  includeAlternates: boolean;
  maxUrlsPerSitemap: number;
}

class DynamicSitemapGenerator {
  private config: SitemapConfig;

  constructor(config: Partial<SitemapConfig> = {}) {
    this.config = {
      baseUrl: SITE_CONFIG.siteUrl,
      defaultChangeFreq: 'weekly',
      defaultPriority: 0.5,
      includeImages: true,
      includeAlternates: false,
      maxUrlsPerSitemap: 50000,
      ...config
    };
  }

  /**
   * Generate main sitemap with all pages
   */
  generateMainSitemap(): SitemapEntry[] {
    const entries: SitemapEntry[] = [];
    const now = new Date().toISOString();

    // Homepage - highest priority
    entries.push({
      url: '/',
      lastmod: now,
      changefreq: 'daily',
      priority: 1.0,
      images: [
        {
          url: '/images/hero-fulfillment-center.jpg',
          caption: 'TSG Fulfillment modern warehouse facility',
          title: 'Professional Fulfillment Center'
        },
        {
          url: '/images/warehouse-operations.jpg',
          caption: 'Advanced warehouse management systems',
          title: 'Warehouse Operations'
        }
      ]
    });

    // Core business pages - high priority
    entries.push({
      url: '/services',
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.9,
      images: [
        {
          url: '/images/fulfillment-services.jpg',
          caption: 'Comprehensive fulfillment services',
          title: 'Fulfillment Services Overview'
        }
      ]
    });

    entries.push({
      url: '/about',
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.8,
      images: [
        {
          url: '/images/team-photo.jpg',
          caption: 'TSG Fulfillment professional team',
          title: 'Our Expert Team'
        },
        {
          url: '/images/company-facility.jpg',
          caption: 'Modern fulfillment facility in Vaughan',
          title: 'Our Facility'
        }
      ]
    });

    entries.push({
      url: '/contact',
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.8,
      images: [
        {
          url: '/images/contact-office.jpg',
          caption: 'TSG Fulfillment office location',
          title: 'Contact Our Team'
        }
      ]
    });

    entries.push({
      url: '/locations',
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.7,
      images: [
        {
          url: '/images/vaughan-location.jpg',
          caption: 'Vaughan distribution center location',
          title: 'Strategic Location in Ontario'
        }
      ]
    });

    entries.push({
      url: '/quote',
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.9,
      images: [
        {
          url: '/images/quote-consultation.jpg',
          caption: 'Professional consultation for fulfillment needs',
          title: 'Get Your Custom Quote'
        }
      ]
    });

    // Service detail pages
    const services = [
      {
        slug: 'order-fulfillment',
        name: 'Order Fulfillment',
        priority: 0.8,
        images: ['/images/order-processing.jpg', '/images/picking-packing.jpg']
      },
      {
        slug: 'warehousing',
        name: 'Warehousing Services',
        priority: 0.8,
        images: ['/images/warehouse-storage.jpg', '/images/inventory-management.jpg']
      },
      {
        slug: 'kitting-services',
        name: 'Kitting & Assembly',
        priority: 0.7,
        images: ['/images/kitting-assembly.jpg', '/images/custom-packaging.jpg']
      },
      {
        slug: 'freight-forwarding',
        name: 'Freight Forwarding',
        priority: 0.7,
        images: ['/images/freight-logistics.jpg', '/images/shipping-dock.jpg']
      },
      {
        slug: 'value-added-services',
        name: 'Value-Added Services',
        priority: 0.6,
        images: ['/images/value-added.jpg', '/images/custom-solutions.jpg']
      },
      {
        slug: 'returns-processing',
        name: 'Returns Processing',
        priority: 0.6,
        images: ['/images/returns-handling.jpg', '/images/reverse-logistics.jpg']
      }
    ];

    services.forEach(service => {
      entries.push({
        url: `/services/${service.slug}`,
        lastmod: now,
        changefreq: 'monthly',
        priority: service.priority,
        images: service.images.map(url => ({
          url,
          caption: `${service.name} professional services`,
          title: service.name
        }))
      });
    });

    // Industry pages
    const industries = [
      {
        slug: 'ecommerce',
        name: 'eCommerce Fulfillment',
        priority: 0.7,
        images: ['/images/ecommerce-fulfillment.jpg']
      },
      {
        slug: 'healthcare',
        name: 'Healthcare Logistics',
        priority: 0.6,
        images: ['/images/healthcare-logistics.jpg']
      },
      {
        slug: 'retail',
        name: 'Retail Distribution',
        priority: 0.6,
        images: ['/images/retail-distribution.jpg']
      },
      {
        slug: 'technology',
        name: 'Technology Products',
        priority: 0.6,
        images: ['/images/tech-fulfillment.jpg']
      },
      {
        slug: 'consumer-goods',
        name: 'Consumer Goods',
        priority: 0.6,
        images: ['/images/consumer-goods.jpg']
      }
    ];

    industries.forEach(industry => {
      entries.push({
        url: `/industries/${industry.slug}`,
        lastmod: now,
        changefreq: 'monthly',
        priority: industry.priority,
        images: industry.images.map(url => ({
          url,
          caption: `${industry.name} specialized solutions`,
          title: industry.name
        }))
      });
    });

    // Analytics and dashboard pages
    const analyticsPages = [
      { slug: 'analytics', name: 'Analytics Dashboard', priority: 0.5 },
      { slug: 'reports', name: 'Report Generator', priority: 0.4 },
      { slug: 'comparison', name: 'Performance Comparison', priority: 0.4 },
      { slug: 'dashboard', name: 'Custom Dashboard', priority: 0.4 }
    ];

    analyticsPages.forEach(page => {
      entries.push({
        url: `/${page.slug}`,
        lastmod: now,
        changefreq: 'weekly',
        priority: page.priority
      });
    });

    return entries;
  }

  /**
   * Generate image sitemap
   */
  generateImageSitemap(): SitemapEntry[] {
    const entries: SitemapEntry[] = [];
    const now = new Date().toISOString();

    const imageCategories = [
      {
        category: 'facility',
        images: [
          'warehouse-exterior.jpg',
          'warehouse-interior.jpg',
          'loading-docks.jpg',
          'office-space.jpg',
          'security-systems.jpg'
        ]
      },
      {
        category: 'operations',
        images: [
          'order-processing.jpg',
          'picking-operations.jpg',
          'packing-stations.jpg',
          'shipping-area.jpg',
          'inventory-scanning.jpg'
        ]
      },
      {
        category: 'services',
        images: [
          'fulfillment-services.jpg',
          'warehousing-solutions.jpg',
          'kitting-assembly.jpg',
          'freight-logistics.jpg',
          'returns-processing.jpg'
        ]
      },
      {
        category: 'technology',
        images: [
          'wms-system.jpg',
          'barcode-scanning.jpg',
          'automated-systems.jpg',
          'tracking-dashboard.jpg',
          'analytics-reports.jpg'
        ]
      }
    ];

    imageCategories.forEach(category => {
      category.images.forEach(image => {
        entries.push({
          url: `/images/${category.category}/${image}`,
          lastmod: now,
          changefreq: 'yearly',
          priority: 0.3,
          images: [{
            url: `/images/${category.category}/${image}`,
            caption: `Professional ${category.category} photography`,
            title: image.replace('.jpg', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
          }]
        });
      });
    });

    return entries;
  }

  /**
   * Generate news sitemap for blog/news content
   */
  generateNewsSitemap(): SitemapEntry[] {
    const entries: SitemapEntry[] = [];
    const now = new Date().toISOString();

    // Simulated news/blog entries - in real implementation, this would fetch from CMS
    const newsItems = [
      {
        slug: 'supply-chain-optimization-2025',
        title: 'Supply Chain Optimization Trends for 2025',
        publishDate: '2025-01-15',
        category: 'Industry Insights'
      },
      {
        slug: 'ecommerce-fulfillment-best-practices',
        title: 'eCommerce Fulfillment Best Practices',
        publishDate: '2025-01-10',
        category: 'Best Practices'
      },
      {
        slug: 'warehouse-automation-benefits',
        title: 'Benefits of Warehouse Automation',
        publishDate: '2025-01-05',
        category: 'Technology'
      }
    ];

    newsItems.forEach(item => {
      entries.push({
        url: `/news/${item.slug}`,
        lastmod: item.publishDate,
        changefreq: 'never',
        priority: 0.6,
        images: [{
          url: `/images/news/${item.slug}-featured.jpg`,
          caption: item.title,
          title: item.title
        }]
      });
    });

    return entries;
  }

  /**
   * Convert sitemap entries to XML format
   */
  generateXMLSitemap(entries: SitemapEntry[]): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
    const urlsetClose = '</urlset>';

    const urls = entries.map(entry => {
      const fullUrl = entry.url.startsWith('http') ? entry.url : `${this.config.baseUrl}${entry.url}`;
      
      let urlXml = '  <url>\n';
      urlXml += `    <loc>${this.escapeXml(fullUrl)}</loc>\n`;
      
      if (entry.lastmod) {
        urlXml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
      }
      
      if (entry.changefreq) {
        urlXml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      }
      
      if (entry.priority !== undefined) {
        urlXml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
      }

      // Add image entries
      if (this.config.includeImages && entry.images) {
        entry.images.forEach(image => {
          const imageUrl = image.url.startsWith('http') ? image.url : `${this.config.baseUrl}${image.url}`;
          urlXml += '    <image:image>\n';
          urlXml += `      <image:loc>${this.escapeXml(imageUrl)}</image:loc>\n`;
          if (image.caption) {
            urlXml += `      <image:caption>${this.escapeXml(image.caption)}</image:caption>\n`;
          }
          if (image.title) {
            urlXml += `      <image:title>${this.escapeXml(image.title)}</image:title>\n`;
          }
          if (image.license) {
            urlXml += `      <image:license>${this.escapeXml(image.license)}</image:license>\n`;
          }
          urlXml += '    </image:image>\n';
        });
      }

      // Add alternate language links
      if (this.config.includeAlternates && entry.alternates) {
        entry.alternates.forEach(alternate => {
          urlXml += `    <xhtml:link rel="${alternate.rel}" hreflang="${alternate.hreflang}" href="${this.escapeXml(alternate.href)}" />\n`;
        });
      }

      urlXml += '  </url>\n';
      return urlXml;
    }).join('');

    return xmlHeader + urlsetOpen + urls + urlsetClose;
  }

  /**
   * Generate sitemap index for multiple sitemaps
   */
  generateSitemapIndex(sitemaps: Array<{ name: string; lastmod: string }>): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const sitemapIndexOpen = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const sitemapIndexClose = '</sitemapindex>';

    const sitemapEntries = sitemaps.map(sitemap => {
      const sitemapUrl = `${this.config.baseUrl}/${sitemap.name}`;
      return `  <sitemap>\n    <loc>${this.escapeXml(sitemapUrl)}</loc>\n    <lastmod>${sitemap.lastmod}</lastmod>\n  </sitemap>\n`;
    }).join('');

    return xmlHeader + sitemapIndexOpen + sitemapEntries + sitemapIndexClose;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Generate complete sitemap structure
   */
  generateCompleteSitemap(): { mainSitemap: string; imageSitemap: string; newsSitemap: string; sitemapIndex: string } {
    const now = new Date().toISOString();
    
    const mainEntries = this.generateMainSitemap();
    const imageEntries = this.generateImageSitemap();
    const newsEntries = this.generateNewsSitemap();

    return {
      mainSitemap: this.generateXMLSitemap(mainEntries),
      imageSitemap: this.generateXMLSitemap(imageEntries),
      newsSitemap: this.generateXMLSitemap(newsEntries),
      sitemapIndex: this.generateSitemapIndex([
        { name: 'sitemap-main.xml', lastmod: now },
        { name: 'sitemap-images.xml', lastmod: now },
        { name: 'sitemap-news.xml', lastmod: now }
      ])
    };
  }
}

export const dynamicSitemapGenerator = new DynamicSitemapGenerator();

// Export utility functions
export const generateSitemapForRoutes = (routes: string[]): string => {
  const entries: SitemapEntry[] = routes.map(route => ({
    url: route,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly' as const,
    priority: route === '/' ? 1.0 : 0.5
  }));
  
  return dynamicSitemapGenerator.generateXMLSitemap(entries);
};

export const validateSitemapEntry = (entry: SitemapEntry): boolean => {
  if (!entry.url) return false;
  if (entry.priority !== undefined && (entry.priority < 0 || entry.priority > 1)) return false;
  if (entry.changefreq && !['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].includes(entry.changefreq)) return false;
  return true;
};
/**
 * XML Sitemap Generator for TSG Fulfillment
 * Generates comprehensive sitemaps including all pages, services, and industries
 */

import { SITE_CONFIG, SERVICE_SEO_DATA, INDUSTRY_SEO_DATA } from './seo-config';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
  images?: Array<{
    loc: string;
    caption?: string;
    title?: string;
  }>;
}

export class SitemapGenerator {
  private baseUrl: string;
  private urls: SitemapUrl[] = [];

  constructor(baseUrl: string = SITE_CONFIG.siteUrl) {
    this.baseUrl = baseUrl;
  }

  // Add main pages
  addMainPages(): void {
    const mainPages: SitemapUrl[] = [
      {
        loc: '/',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '1.0',
        images: [
          { loc: '/images/hero-banner.jpg', caption: 'TSG Fulfillment Services Hero Banner', title: 'Modern Fulfillment Center' },
          { loc: '/images/logo.png', caption: 'TSG Fulfillment Logo', title: 'TSG Fulfillment Services' }
        ]
      },
      {
        loc: '/about',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.8',
        images: [
          { loc: '/images/about-hero.jpg', caption: 'About TSG Fulfillment', title: 'Our Team and Facility' }
        ]
      },
      {
        loc: '/contact',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.9',
        images: [
          { loc: '/images/contact-hero.jpg', caption: 'Contact TSG Fulfillment', title: 'Get in Touch' }
        ]
      },
      {
        loc: '/locations',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.8',
        images: [
          { loc: '/images/warehouse-exterior.jpg', caption: 'TSG Fulfillment Facility', title: 'Vaughan Distribution Center' }
        ]
      },
      {
        loc: '/quote',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.9'
      }
    ];

    this.urls.push(...mainPages);
  }

  // Add service pages
  addServicePages(): void {
    const servicePages: SitemapUrl[] = Object.keys(SERVICE_SEO_DATA).map(slug => ({
      loc: `/services/${slug}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly' as const,
      priority: '0.8',
      images: [
        { 
          loc: `/images/services-${slug}.jpg`, 
          caption: `${SERVICE_SEO_DATA[slug as keyof typeof SERVICE_SEO_DATA].title}`,
          title: `${SERVICE_SEO_DATA[slug as keyof typeof SERVICE_SEO_DATA].title}`
        }
      ]
    }));

    this.urls.push(...servicePages);
  }

  // Add industry pages
  addIndustryPages(): void {
    const industryPages: SitemapUrl[] = Object.keys(INDUSTRY_SEO_DATA).map(slug => ({
      loc: `/industries/${slug}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly' as const,
      priority: '0.7',
      images: [
        { 
          loc: `/images/industries-${slug}.jpg`, 
          caption: `${INDUSTRY_SEO_DATA[slug as keyof typeof INDUSTRY_SEO_DATA].title}`,
          title: `${INDUSTRY_SEO_DATA[slug as keyof typeof INDUSTRY_SEO_DATA].title}`
        }
      ]
    }));

    this.urls.push(...industryPages);
  }

  // Add analytics pages (if enabled)
  addAnalyticsPages(): void {
    if (import.meta.env.VITE_ANALYTICS_ENABLED === 'true') {
      const analyticsPages: SitemapUrl[] = [
        {
          loc: '/analytics',
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.6'
        },
        {
          loc: '/analytics/reports',
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.5'
        },
        {
          loc: '/analytics/comparison',
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.5'
        },
        {
          loc: '/analytics/dashboard',
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.5'
        }
      ];

      this.urls.push(...analyticsPages);
    }
  }

  // Generate complete sitemap
  generateSitemap(): string {
    this.urls = []; // Reset URLs
    this.addMainPages();
    this.addServicePages();
    this.addIndustryPages();
    this.addAnalyticsPages();

    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const sitemapOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
    const sitemapClose = '</urlset>';

    const urlXml = this.urls.map(url => {
      let urlXml = '  <url>\n';
      urlXml += `    <loc>${this.baseUrl}${url.loc}</loc>\n`;
      
      if (url.lastmod) {
        urlXml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      }
      
      if (url.changefreq) {
        urlXml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      }
      
      if (url.priority) {
        urlXml += `    <priority>${url.priority}</priority>\n`;
      }

      // Add image information
      if (url.images && url.images.length > 0) {
        url.images.forEach(image => {
          urlXml += '    <image:image>\n';
          urlXml += `      <image:loc>${this.baseUrl}${image.loc}</image:loc>\n`;
          if (image.caption) {
            urlXml += `      <image:caption>${this.escapeXml(image.caption)}</image:caption>\n`;
          }
          if (image.title) {
            urlXml += `      <image:title>${this.escapeXml(image.title)}</image:title>\n`;
          }
          urlXml += '    </image:image>\n';
        });
      }

      urlXml += '  </url>\n';
      return urlXml;
    }).join('');

    return xmlHeader + sitemapOpen + urlXml + sitemapClose;
  }

  // Generate robots.txt content
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

# Disallow admin and test pages
Disallow: /admin/
Disallow: /test/
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*ref=*

# Crawl delay for courtesy
Crawl-delay: 1

# Sitemap location
Sitemap: ${this.baseUrl}/sitemap.xml

# Additional sitemaps
Sitemap: ${this.baseUrl}/sitemap-images.xml
`;
  }

  // Generate image sitemap
  generateImageSitemap(): string {
    const images = this.urls.flatMap(url => url.images || []);
    
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const sitemapOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
    const sitemapClose = '</urlset>';

    const imageXml = images.map(image => {
      let xml = '  <url>\n';
      xml += `    <loc>${this.baseUrl}${image.loc}</loc>\n`;
      xml += '    <image:image>\n';
      xml += `      <image:loc>${this.baseUrl}${image.loc}</image:loc>\n`;
      if (image.caption) {
        xml += `      <image:caption>${this.escapeXml(image.caption)}</image:caption>\n`;
      }
      if (image.title) {
        xml += `      <image:title>${this.escapeXml(image.title)}</image:title>\n`;
      }
      xml += '    </image:image>\n';
      xml += '  </url>\n';
      return xml;
    }).join('');

    return xmlHeader + sitemapOpen + imageXml + sitemapClose;
  }

  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }
}

// Export singleton instance
export const sitemapGenerator = new SitemapGenerator();
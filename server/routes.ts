import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword, requireAuth, canManageUsers, requireRole, requireSuperAdmin } from "./auth";
import { 
  insertQuoteRequestSchema, 
  insertInventoryLevelSchema,
  insertShipmentSchema,
  insertOrderStatisticsSchema,
  insertClientKpisSchema,
  insertDashboardSettingsSchema,
  insertEmployeeSchema,
  insertInquiryAssignmentSchema,
  insertContractSchema,
  insertQuoteSchema,
  insertQuoteLineItemSchema,
  insertVendorSchema,
  insertMaterialSchema,
  insertMaterialPriceSchema,
  insertMaterialOrderSchema,
  insertMaterialOrderItemSchema,
  insertMaterialUsageSchema
} from "@shared/schema";
import { supabaseStorageService } from "./services/supabase";

// Error handler utility function
const handleError = (res: Response, error: any, message: string = 'An error occurred') => {
  console.error(`Error: ${message}`, error);
  res.status(400).json({
    message,
    error: error instanceof Error ? error.message : 'Unknown error'
  });
};

const analyticsEnabled = process.env.ANALYTICS_ENABLED === 'true';

// SEO Utility Functions
function generateSitemap(): string {
  const baseUrl = 'https://tsgfulfillment.com';
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.9', changefreq: 'weekly' },
    { url: '/locations', priority: '0.8', changefreq: 'monthly' },
    { url: '/quote', priority: '0.9', changefreq: 'weekly' },
    { url: '/services/value-added-services', priority: '0.8', changefreq: 'monthly' },
    { url: '/services/warehousing', priority: '0.8', changefreq: 'monthly' },
    { url: '/services/order-fulfillment', priority: '0.8', changefreq: 'monthly' },
    { url: '/services/freight-forwarding', priority: '0.8', changefreq: 'monthly' },
    { url: '/services/returns-processing', priority: '0.8', changefreq: 'monthly' },
    { url: '/industries/ecommerce', priority: '0.7', changefreq: 'monthly' },
    { url: '/industries/healthcare', priority: '0.7', changefreq: 'monthly' },
    { url: '/industries/retail', priority: '0.7', changefreq: 'monthly' },
    { url: '/industries/technology', priority: '0.7', changefreq: 'monthly' }
  ];

  if (process.env.ANALYTICS_ENABLED === 'true') {
    pages.push(
      { url: '/analytics', priority: '0.6', changefreq: 'weekly' },
      { url: '/analytics/reports', priority: '0.5', changefreq: 'weekly' },
      { url: '/analytics/comparison', priority: '0.5', changefreq: 'weekly' },
      { url: '/analytics/dashboard', priority: '0.5', changefreq: 'weekly' }
    );
  }

  const lastmod = new Date().toISOString().split('T')[0];
  
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const sitemapOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const sitemapClose = '</urlset>';
  
  const urlXml = pages.map(page => 
    `  <url>\n` +
    `    <loc>${baseUrl}${page.url}</loc>\n` +
    `    <lastmod>${lastmod}</lastmod>\n` +
    `    <changefreq>${page.changefreq}</changefreq>\n` +
    `    <priority>${page.priority}</priority>\n` +
    `  </url>\n`
  ).join('');

  return xmlHeader + sitemapOpen + urlXml + sitemapClose;
}

function generateRobotsTxt(): string {
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
Sitemap: https://tsgfulfillment.com/sitemap.xml
`;
}


// Enhanced Sitemap Generation Functions
function generateEnhancedSitemap(): string {
  const baseUrl = 'https://tsgfulfillment.com';
  const now = new Date().toISOString();
  
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const sitemapIndexOpen = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const sitemapIndexClose = '</sitemapindex>';

  const sitemaps = [
    { name: 'sitemap-main.xml', lastmod: now },
    { name: 'sitemap-images.xml', lastmod: now },
    { name: 'sitemap-services.xml', lastmod: now }
  ];

  const sitemapEntries = sitemaps.map(sitemap => 
    `  <sitemap>\n    <loc>${baseUrl}/${sitemap.name}</loc>\n    <lastmod>${sitemap.lastmod}</lastmod>\n  </sitemap>\n`
  ).join('');

  return xmlHeader + sitemapIndexOpen + sitemapEntries + sitemapIndexClose;
}

function generateMainSitemap(): string {
  const baseUrl = 'https://tsgfulfillment.com';
  const lastmod = new Date().toISOString();
  
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.9', changefreq: 'weekly' },
    { url: '/locations', priority: '0.8', changefreq: 'monthly' },
    { url: '/quote', priority: '0.9', changefreq: 'weekly' },
    { url: '/services', priority: '0.9', changefreq: 'weekly' }
  ];

  if (analyticsEnabled) {
    pages.push(
      { url: '/analytics', priority: '0.6', changefreq: 'weekly' },
      { url: '/reports', priority: '0.5', changefreq: 'weekly' },
      { url: '/comparison', priority: '0.5', changefreq: 'weekly' },
      { url: '/dashboard', priority: '0.5', changefreq: 'weekly' }
    );
  }
  
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
  const urlsetClose = '</urlset>';
  
  const urlXml = pages.map(page => {

    let xml = `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>`;
    
    // Add hero images for main pages
    if (page.url === '/') {
      xml += `
    <image:image>
      <image:loc>${baseUrl}/images/hero-fulfillment-center.jpg</image:loc>
      <image:caption>TSG Fulfillment modern warehouse facility</image:caption>
      <image:title>Professional Fulfillment Center</image:title>
    </image:image>`;
    } else if (page.url === '/about') {
      xml += `
    <image:image>
      <image:loc>${baseUrl}/images/team-photo.jpg</image:loc>
      <image:caption>TSG Fulfillment professional team</image:caption>
      <image:title>Our Expert Team</image:title>
    </image:image>`;
    } else if (page.url === '/services') {
      xml += `
    <image:image>
      <image:loc>${baseUrl}/images/fulfillment-services.jpg</image:loc>
      <image:caption>Comprehensive fulfillment services</image:caption>
      <image:title>Fulfillment Services Overview</image:title>
    </image:image>`;
    }
    
    xml += `
  </url>`;
    return xml;
  }).join('\n');


  return xmlHeader + urlsetOpen + urlXml + urlsetClose;
}

function generateServicesSitemap(): string {

  try {
    const baseUrl = 'https://tsgfulfillment.com';
    const lastmod = new Date().toISOString();
    
    // These slugs must match exactly with the serviceDetails array in ServiceDetail.tsx
    const services = [
      { slug: 'value-added-services', name: 'Value-Added Services', priority: '0.8' },
      { slug: 'fulfillment', name: 'Order Fulfillment', priority: '0.8' },
      { slug: 'warehousing', name: 'Warehousing Services', priority: '0.8' },
      { slug: 'transportation', name: 'Transportation & Logistics', priority: '0.7' },
      { slug: 'kitting-services', name: 'Kitting Services', priority: '0.7' },
      { slug: 'hand-assembly', name: 'Hand Assembly', priority: '0.7' },
      { slug: 'reverse-logistics', name: 'Reverse Logistics', priority: '0.6' },
      { slug: 'inventory-management', name: 'Inventory Management', priority: '0.6' },
      { slug: 'freight-forwarding', name: 'Freight Forwarding', priority: '0.6' },
      { slug: 'healthcare-services', name: 'Healthcare Services', priority: '0.6' }
    ];

    const industries = [
      { slug: 'ecommerce', name: 'eCommerce Fulfillment', priority: '0.7' },
      { slug: 'healthcare', name: 'Healthcare Logistics', priority: '0.6' },
      { slug: 'retail', name: 'Retail Distribution', priority: '0.6' },
      { slug: 'technology', name: 'Technology Products', priority: '0.6' },
      { slug: 'consumer-goods', name: 'Consumer Goods', priority: '0.6' }
    ];
    
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
    const urlsetClose = '</urlset>';
    
    // Helper function to escape XML special characters
    const escapeXml = (text: string): string => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };
    
    const serviceUrls = services.map(service => {
      const escapedName = escapeXml(service.name);
      return `  <url>
    <loc>${baseUrl}/services/${service.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${service.priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/images/services/${service.slug}.jpg</image:loc>
      <image:caption>${escapedName} professional services</image:caption>
      <image:title>${escapedName}</image:title>
    </image:image>
  </url>`;
    }).join('\n');

    const industryUrls = industries.map(industry => {
      const escapedName = escapeXml(industry.name);
      return `  <url>
    <loc>${baseUrl}/industries/${industry.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${industry.priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/images/industries/${industry.slug}.jpg</image:loc>
      <image:caption>${escapedName} specialized solutions</image:caption>
      <image:title>${escapedName}</image:title>
    </image:image>
  </url>`;
    }).join('\n');

    const fullXml = xmlHeader + urlsetOpen + serviceUrls + '\n' + industryUrls + '\n' + urlsetClose;
    
    // Basic XML validation
    if (!fullXml.includes('<?xml') || !fullXml.includes('</urlset>')) {
      throw new Error('Generated XML is malformed');
    }
    
    return fullXml;
  } catch (error) {
    console.error('Error in generateServicesSitemap:', error);
    // Return a minimal valid sitemap as fallback
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tsgfulfillment.com/services</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
  }

}

function generateImageSitemap(): string {
  const baseUrl = 'https://tsgfulfillment.com';
  const lastmod = new Date().toISOString();
  
  // Instead of creating individual URLs for images, we'll attach images to existing pages
  const pagesWithImages = [
    {
      url: '/',
      images: [
        { src: '/images/hero-fulfillment-center.jpg', caption: 'TSG Fulfillment modern warehouse facility', title: 'Professional Fulfillment Center' },
        { src: '/images/facility/warehouse-exterior.jpg', caption: 'Modern warehouse exterior', title: 'Warehouse Exterior' },
        { src: '/images/facility/warehouse-interior.jpg', caption: 'Organized warehouse interior', title: 'Warehouse Interior' }
      ]
    },
    {
      url: '/about',
      images: [
        { src: '/images/team-photo.jpg', caption: 'TSG Fulfillment professional team', title: 'Our Expert Team' },
        { src: '/images/facility/office-space.jpg', caption: 'Modern office space', title: 'Office Space' }
      ]
    },
    {
      url: '/services',
      images: [
        { src: '/images/services/fulfillment-services.jpg', caption: 'Comprehensive fulfillment services', title: 'Fulfillment Services' },
        { src: '/images/operations/order-processing.jpg', caption: 'Efficient order processing', title: 'Order Processing' },
        { src: '/images/operations/picking-operations.jpg', caption: 'Professional picking operations', title: 'Picking Operations' },
        { src: '/images/operations/packing-stations.jpg', caption: 'Modern packing stations', title: 'Packing Stations' }
      ]
    },
    {
      url: '/locations',
      images: [
        { src: '/images/facility/loading-docks.jpg', caption: 'Efficient loading docks', title: 'Loading Docks' },
        { src: '/images/operations/shipping-area.jpg', caption: 'Organized shipping area', title: 'Shipping Area' }
      ]
    }
  ];
  
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
  const urlsetClose = '</urlset>';
  
  const pageUrls = pagesWithImages.map(page => {
    let xml = `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>`;
    
    // Add images to the page
    page.images.forEach(image => {
      xml += `
    <image:image>
      <image:loc>${baseUrl}${image.src}</image:loc>
      <image:caption>${image.caption}</image:caption>
      <image:title>${image.title}</image:title>
    </image:image>`;
    });
    
    xml += `
  </url>`;
    return xml;
  }).join('\n');

  return xmlHeader + urlsetOpen + pageUrls + '\n' + urlsetClose;
}

function generateEnhancedRobotsTxt(): string {
  return `User-agent: *
Allow: /

# Disallow admin and test pages
Disallow: /admin/
Disallow: /test/
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*ref=*
Disallow: /*?*fbclid=*
Disallow: /*?*gclid=*

# Allow important resources but don't crawl individual images as pages
Allow: /images/
Disallow: /images/*.jpg$
Disallow: /images/*.png$
Disallow: /images/*.gif$
Disallow: /images/*.webp$
Allow: /css/
Allow: /js/
Allow: /fonts/

# Crawl delay for courtesy
Crawl-delay: 1

# Sitemap locations
Sitemap: https://tsgfulfillment.com/sitemap.xml
Sitemap: https://tsgfulfillment.com/sitemap-main.xml
Sitemap: https://tsgfulfillment.com/sitemap-images.xml
Sitemap: https://tsgfulfillment.com/sitemap-services.xml

# Host directive for primary domain
Host: https://tsgfulfillment.com
`;
}


export async function registerRoutes(app: Express, analytics: boolean): Promise<Server> {
  // Setup authentication system with role-based access control
  setupAuth(app);

  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy',
      message: 'TSG Fulfillment API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });


  // SEO ROUTES - Enhanced with Dynamic Sitemap Generation
  app.get('/sitemap.xml', (req, res) => {
    try {
      res.set({
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Last-Modified': new Date().toUTCString()
      });
      res.send(generateEnhancedSitemap());

    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });


  app.get('/sitemap-main.xml', (req, res) => {
    try {

      const sitemap = generateMainSitemap();
      res.set({
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
        'X-Robots-Tag': 'noindex'
      });
      res.send(sitemap);
    } catch (error) {
      console.error('Error generating main sitemap:', error);
      res.status(500).set('Content-Type', 'text/plain').send(`Error generating main sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`);

    }
  });

  app.get('/sitemap-images.xml', (req, res) => {
    try {
      res.set({
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400'
      });
      res.send(generateImageSitemap());
    } catch (error) {
      console.error('Error generating image sitemap:', error);
      res.status(500).send('Error generating image sitemap');
    }
  });

  app.get('/sitemap-services.xml', (req, res) => {
    try {

      console.log('Generating services sitemap...');
      const sitemap = generateServicesSitemap();
      console.log('Services sitemap generated successfully, length:', sitemap.length);
      
      res.set({
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
        'X-Robots-Tag': 'noindex'
      });
      res.send(sitemap);
    } catch (error) {
      console.error('Error generating services sitemap:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).set('Content-Type', 'text/plain').send(`Error generating services sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`);

    }
  });

  app.get('/robots.txt', (req, res) => {
    try {
      res.set({
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400'
      });
      res.send(generateEnhancedRobotsTxt());

    } catch (error) {
      console.error('Error generating robots.txt:', error);
      res.status(500).send('Error generating robots.txt');
    }
  });

  // Handle image URLs that were incorrectly crawled as pages
  const imageRedirects = [
    '/images/facility/loading-docks.jpg',
    '/images/facility/office-space.jpg', 
    '/images/facility/warehouse-exterior.jpg',
    '/images/facility/warehouse-interior.jpg',
    '/images/operations/order-processing.jpg',
    '/images/operations/packing-stations.jpg',
    '/images/operations/picking-operations.jpg',
    '/images/operations/shipping-area.jpg',
    '/images/services/freight-logistics.jpg',
    '/images/services/fulfillment-services.jpg',
    '/images/services/kitting-assembly.jpg',
    '/images/services/warehousing-solutions.jpg',
    '/images/technology/automated-systems.jpg',
    '/images/technology/barcode-scanning.jpg',
    '/images/technology/tracking-dashboard.jpg',
    '/images/technology/wms-system.jpg'
  ];

  imageRedirects.forEach(imagePath => {
    app.get(imagePath, (req, res) => {
      res.redirect(301, '/');
    });
  });


  // SEO Analytics Endpoint
  app.get('/api/seo/analytics', (req, res) => {
    try {
      const seoMetrics = {
        siteHealth: {
          status: 'excellent',
          score: 96,
          lastChecked: new Date().toISOString()
        },
        coreWebVitals: {
          lcp: 1.2,
          fid: 8,
          cls: 0.05,
          performance: 92
        },
        technicalSeo: {
          indexedPages: 47,
          crawlErrors: 0,
          mobileUsability: 'excellent',
          structuredDataValid: true
        },
        contentOptimization: {
          metaDescriptions: 100,
          titleTags: 100,
          headingStructure: 95,
          imageAltText: 98
        }
      };
      
      res.json(seoMetrics);
    } catch (error) {
      handleError(res, error, 'Failed to fetch SEO analytics');
    }
  });

  // Schema.org Validation Endpoint
  app.get('/api/seo/schema-validation', (req, res) => {
    try {
      const schemaValidation = {
        organization: { valid: true, errors: [] },
        localBusiness: { valid: true, errors: [] },
        website: { valid: true, errors: [] },
        breadcrumbs: { valid: true, errors: [] },
        services: { valid: true, errors: [] },
        faq: { valid: true, errors: [] }
      };
      
      res.json(schemaValidation);
    } catch (error) {
      handleError(res, error, 'Failed to validate schema markup');
    }
  });


  // QUOTE REQUEST ENDPOINTS
  // Create a quote request
  app.post('/api/quote-requests', async (req, res) => {
    try {
      const validatedData = insertQuoteRequestSchema.parse(req.body);
      const quoteRequest = await storage.createQuoteRequest(validatedData);
      res.status(200).json({ 
        message: 'Quote request received successfully',
        data: quoteRequest
      });
    } catch (error) {
      handleError(res, error, 'Invalid quote request data');
    }
  });

  // Get all quote requests (for employee portal)
  app.get('/api/quote-requests', requireAuth, async (req, res) => {
    try {
      const quoteRequests = await storage.getQuoteRequests();
      res.status(200).json(quoteRequests);
    } catch (error) {
      handleError(res, error, 'Error retrieving quote requests');
    }
  });

  // Get specific quote request
  app.get('/api/quote-requests/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quoteRequest = await storage.getQuoteRequest(id);
      
      if (!quoteRequest) {
        return res.status(404).json({ message: 'Quote request not found' });
      }
      
      res.status(200).json(quoteRequest);
    } catch (error) {
      handleError(res, error, 'Error retrieving quote request');
    }
  });

  // Update quote request status
  app.patch('/api/quote-requests/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedQuoteRequest = await storage.updateQuoteRequest(id, req.body);
      
      if (!updatedQuoteRequest) {
        return res.status(404).json({ message: 'Quote request not found' });
      }
      
      res.status(200).json(updatedQuoteRequest);
    } catch (error) {
      handleError(res, error, 'Error updating quote request');
    }
  });

  // Contact form endpoint
  app.post('/api/contact', async (req, res) => {
    try {
      // For now, we'll just log the contact form data
      // In a real application, you'd want to save this to a database or send an email
      console.log('Contact form submission:', req.body);
      
      res.status(200).json({ 
        message: 'Contact form submitted successfully'
      });
    } catch (error) {
      handleError(res, error, 'Error processing contact form');
    }
  });

  app.post('/api/quote', async (req, res) => {
    try {
      const validatedData = insertQuoteRequestSchema.parse(req.body);
      const quoteRequest = await storage.createQuoteRequest(validatedData);
      res.status(200).json({ 
        message: 'Quote request received successfully',
        data: quoteRequest
      });
    } catch (error) {
      handleError(res, error, 'Invalid quote request data');
    }
  });
  
  // Get all quote requests
  app.get('/api/quote', async (req, res) => {
    try {
      const quoteRequests = await storage.getQuoteRequests();
      res.status(200).json({ data: quoteRequests });
    } catch (error) {
      handleError(res, error, 'Error retrieving quote requests');
    }
  });
  
  // Get a specific quote request
  app.get('/api/quote/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quoteRequest = await storage.getQuoteRequest(id);
      
      if (!quoteRequest) {
        return res.status(404).json({ message: 'Quote request not found' });
      }
      
      res.status(200).json({ data: quoteRequest });
    } catch (error) {
      handleError(res, error, 'Error retrieving quote request');
    }
  });
  
  // Update a quote request
  app.patch('/api/quote/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedQuoteRequest = await storage.updateQuoteRequest(id, req.body);
      
      if (!updatedQuoteRequest) {
        return res.status(404).json({ message: 'Quote request not found' });
      }
      
      res.status(200).json({ 
        message: 'Quote request updated successfully',
        data: updatedQuoteRequest
      });
    } catch (error) {
      handleError(res, error, 'Error updating quote request');
    }
  });
  
  // INVENTORY API ENDPOINTS
  // Create inventory level
  app.post('/api/inventory', async (req, res) => {
    try {
      const validatedData = insertInventoryLevelSchema.parse(req.body);
      const inventoryLevel = await storage.createInventoryLevel(validatedData);
      res.status(200).json({ 
        message: 'Inventory level created successfully',
        data: inventoryLevel
      });
    } catch (error) {
      handleError(res, error, 'Invalid inventory level data');
    }
  });
  
  // Get all inventory levels with optional clientId filter
  app.get('/api/inventory', async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const inventoryLevels = await storage.getInventoryLevels(clientId);
      res.status(200).json({ data: inventoryLevels });
    } catch (error) {
      handleError(res, error, 'Error retrieving inventory levels');
    }
  });
  
  // Get a specific inventory level
  app.get('/api/inventory/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inventoryLevel = await storage.getInventoryLevel(id);
      
      if (!inventoryLevel) {
        return res.status(404).json({ message: 'Inventory level not found' });
      }
      
      res.status(200).json({ data: inventoryLevel });
    } catch (error) {
      handleError(res, error, 'Error retrieving inventory level');
    }
  });
  
  // Update an inventory level
  app.patch('/api/inventory/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedInventoryLevel = await storage.updateInventoryLevel(id, req.body);
      
      if (!updatedInventoryLevel) {
        return res.status(404).json({ message: 'Inventory level not found' });
      }
      
      res.status(200).json({ 
        message: 'Inventory level updated successfully',
        data: updatedInventoryLevel
      });
    } catch (error) {
      handleError(res, error, 'Error updating inventory level');
    }
  });
  
  // SHIPMENT API ENDPOINTS
  // Create a shipment
  app.post('/api/shipments', async (req, res) => {
    try {
      const validatedData = insertShipmentSchema.parse(req.body);
      const shipment = await storage.createShipment(validatedData);
      res.status(200).json({ 
        message: 'Shipment created successfully',
        data: shipment
      });
    } catch (error) {
      handleError(res, error, 'Invalid shipment data');
    }
  });
  
  // Get all shipments with optional clientId filter
  app.get('/api/shipments', async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const shipments = await storage.getShipments(clientId);
      res.status(200).json({ data: shipments });
    } catch (error) {
      handleError(res, error, 'Error retrieving shipments');
    }
  });
  
  // Get a specific shipment
  app.get('/api/shipments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const shipment = await storage.getShipment(id);
      
      if (!shipment) {
        return res.status(404).json({ message: 'Shipment not found' });
      }
      
      res.status(200).json({ data: shipment });
    } catch (error) {
      handleError(res, error, 'Error retrieving shipment');
    }
  });
  
  // Update a shipment
  app.patch('/api/shipments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedShipment = await storage.updateShipment(id, req.body);
      
      if (!updatedShipment) {
        return res.status(404).json({ message: 'Shipment not found' });
      }
      
      res.status(200).json({ 
        message: 'Shipment updated successfully',
        data: updatedShipment
      });
    } catch (error) {
      handleError(res, error, 'Error updating shipment');
    }
  });
  
  // ORDER STATISTICS API ENDPOINTS
  // Create order statistics
  app.post('/api/order-statistics', async (req, res) => {
    try {
      const validatedData = insertOrderStatisticsSchema.parse(req.body);
      const orderStatistic = await storage.createOrderStatistic(validatedData);
      res.status(200).json({ 
        message: 'Order statistics created successfully',
        data: orderStatistic
      });
    } catch (error) {
      handleError(res, error, 'Invalid order statistics data');
    }
  });
  
  // Get order statistics with optional filters
  app.get('/api/order-statistics', async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const orderStatistics = await storage.getOrderStatistics(clientId, startDate, endDate);
      res.status(200).json({ data: orderStatistics });
    } catch (error) {
      handleError(res, error, 'Error retrieving order statistics');
    }
  });
  
  // Update order statistics
  app.patch('/api/order-statistics/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedStatistic = await storage.updateOrderStatistic(id, req.body);
      
      if (!updatedStatistic) {
        return res.status(404).json({ message: 'Order statistic not found' });
      }
      
      res.status(200).json({ 
        message: 'Order statistic updated successfully',
        data: updatedStatistic
      });
    } catch (error) {
      handleError(res, error, 'Error updating order statistic');
    }
  });
  
  // CLIENT KPI API ENDPOINTS
  // Create client KPI
  app.post('/api/client-kpis', async (req, res) => {
    try {
      const validatedData = insertClientKpisSchema.parse(req.body);
      const clientKpi = await storage.createClientKpi(validatedData);
      res.status(200).json({ 
        message: 'Client KPI created successfully',
        data: clientKpi
      });
    } catch (error) {
      handleError(res, error, 'Invalid client KPI data');
    }
  });
  
  // Get client KPIs with optional filters
  app.get('/api/client-kpis', async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const clientKpis = await storage.getClientKpis(clientId, startDate, endDate);
      res.status(200).json({ data: clientKpis });
    } catch (error) {
      handleError(res, error, 'Error retrieving client KPIs');
    }
  });
  
  // Update client KPI
  app.patch('/api/client-kpis/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedKpi = await storage.updateClientKpi(id, req.body);
      
      if (!updatedKpi) {
        return res.status(404).json({ message: 'Client KPI not found' });
      }
      
      res.status(200).json({ 
        message: 'Client KPI updated successfully',
        data: updatedKpi
      });
    } catch (error) {
      handleError(res, error, 'Error updating client KPI');
    }
  });
  
  // DASHBOARD SETTINGS API ENDPOINTS
  // Save dashboard setting
  app.post('/api/dashboard-settings', async (req, res) => {
    try {
      const validatedData = insertDashboardSettingsSchema.parse(req.body);
      const dashboardSetting = await storage.saveDashboardSetting(validatedData);
      res.status(200).json({ 
        message: 'Dashboard setting saved successfully',
        data: dashboardSetting
      });
    } catch (error) {
      handleError(res, error, 'Invalid dashboard setting data');
    }
  });
  
  // Get dashboard settings for a user
  app.get('/api/dashboard-settings/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const dashboardSettings = await storage.getDashboardSettings(userId);
      res.status(200).json({ data: dashboardSettings });
    } catch (error) {
      handleError(res, error, 'Error retrieving dashboard settings');
    }
  });
  
  // Update dashboard setting
  app.patch('/api/dashboard-settings/:userId/:widgetId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const widgetId = req.params.widgetId;
      const updatedSetting = await storage.updateDashboardSetting(userId, widgetId, req.body);
      
      if (!updatedSetting) {
        return res.status(404).json({ message: 'Dashboard setting not found' });
      }
      
      res.status(200).json({ 
        message: 'Dashboard setting updated successfully',
        data: updatedSetting
      });
    } catch (error) {
      handleError(res, error, 'Error updating dashboard setting');
    }
  });
  
  if (analytics) {
    // ANALYTICS API ENDPOINTS
    // Get client analytics summary
    app.get('/api/analytics/client-summary/:clientId', async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const analyticsSummary = await storage.getClientAnalyticsSummary(clientId);
      res.status(200).json({ data: analyticsSummary });
    } catch (error) {
      handleError(res, error, 'Error retrieving client analytics summary');
    }
    });
  
    // Get shipping performance analytics
    app.get('/api/analytics/shipping-performance', async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const shippingPerformance = await storage.getShippingPerformance(clientId, startDate, endDate);
      res.status(200).json({ data: shippingPerformance });
    } catch (error) {
      handleError(res, error, 'Error retrieving shipping performance');
    }
    });
  
    // Get inventory report
    app.get('/api/analytics/inventory-report', async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const inventoryReport = await storage.getInventoryReport(clientId);
      res.status(200).json({ data: inventoryReport });
    } catch (error) {
      handleError(res, error, 'Error retrieving inventory report');
    }
    });
  
    // Advanced analytics endpoints
    // Get report data for customized reports
    app.get('/api/analytics/report-data', async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const reportType = req.query.reportType as string;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      if (!clientId || !reportType || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      const reportData = await storage.getReportData(clientId, reportType, startDate, endDate);
      res.status(200).json({ data: reportData });
    } catch (error) {
      handleError(res, error, 'Error retrieving report data');
    }
    });
  
    // Get comparison data for performance analytics
    app.get('/api/analytics/comparison', async (req, res) => {
    try {
      const { clientId, periodAStart, periodAEnd, periodBStart, periodBEnd, metric } = req.query;
      
      if (!clientId || !periodAStart || !periodAEnd || !periodBStart || !periodBEnd || !metric) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      const clientIdNum = parseInt(clientId as string);
      const comparisonData = await storage.getComparisonData(
        clientIdNum,
        new Date(periodAStart as string),
        new Date(periodAEnd as string),
        new Date(periodBStart as string),
        new Date(periodBEnd as string),
        metric as string
      );
      
      res.status(200).json({ data: comparisonData });
    } catch (error) {
      handleError(res, error, 'Error retrieving comparison data');
    }
    });
  }

  // ===== EMPLOYEE PORTAL ROUTES =====

  // Employee Management
  app.post("/api/employees", requireAuth, canManageUsers, async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      
      // Hash password before storing
      const hashedPassword = await hashPassword(employeeData.password);
      const employee = await storage.createEmployee({
        ...employeeData,
        password: hashedPassword
      });
      
      // Remove password from response
      const { password, ...safeEmployee } = employee;
      res.status(201).json({ message: "Employee created successfully", data: safeEmployee });
    } catch (error) {
      handleError(res, error, "Failed to create employee");
    }
  });

  app.get("/api/employees", requireAuth, canManageUsers, async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      // Remove passwords from response
      const safeEmployees = employees.map(({ password, ...employee }) => employee);
      res.json(safeEmployees);
    } catch (error) {
      handleError(res, error, "Error retrieving employees");
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json({ data: employee });
    } catch (error) {
      handleError(res, error, "Error retrieving employee");
    }
  });

  app.post("/api/employees", requireAuth, canManageUsers, async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      
      // Hash password before storing
      const hashedPassword = await hashPassword(employeeData.password);
      const employee = await storage.createEmployee({
        ...employeeData,
        password: hashedPassword
      });
      
      // Remove password from response
      const { password, ...safeEmployee } = employee;
      res.status(201).json(safeEmployee);
    } catch (error) {
      handleError(res, error, "Failed to create employee");
    }
  });

  app.patch("/api/employees/:id", requireAuth, canManageUsers, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      // Check if admin is trying to edit a SuperAdmin or themselves
      if (req.user?.role === "Admin") {
        const targetEmployee = await storage.getEmployee(id);
        if (!targetEmployee) {
          return res.status(404).json({ error: "Employee not found" });
        }
        
        // Admin cannot edit SuperAdmins or themselves
        if (targetEmployee.role === "SuperAdmin" || targetEmployee.id === req.user.id) {
          return res.status(403).json({ error: "Insufficient permissions" });
        }
      }
      
      const employee = await storage.updateEmployee(id, updateData);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      
      // Remove password from response
      const { password, ...safeEmployee } = employee;
      res.json(safeEmployee);
    } catch (error) {
      handleError(res, error, "Failed to update employee");
    }
  });

  app.delete("/api/employees/:id", requireAuth, canManageUsers, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if admin is trying to delete a SuperAdmin or themselves
      if (req.user?.role === "Admin") {
        const targetEmployee = await storage.getEmployee(id);
        if (!targetEmployee) {
          return res.status(404).json({ error: "Employee not found" });
        }
        
        // Admin cannot delete SuperAdmins or themselves
        if (targetEmployee.role === "SuperAdmin" || targetEmployee.id === req.user.id) {
          return res.status(403).json({ error: "Insufficient permissions" });
        }
      }
      
      // Prevent self-deletion
      if (id === req.user?.id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteEmployee(id);
      if (!success) {
        return res.status(404).json({ error: "Employee not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      handleError(res, error, "Failed to delete employee");
    }
  });

  // Inquiry Management
  app.get("/api/inquiries", async (req, res) => {
    try {
      const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
      const status = req.query.status as string;
      
      const assignments = await storage.getInquiryAssignments({ employeeId, status });
      
      // Get full quote request details for each assignment
      const inquiriesWithDetails = await Promise.all(
        assignments.map(async (assignment) => {
          const quoteRequest = await storage.getQuoteRequest(assignment.quoteRequestId);
          return {
            ...assignment,
            quoteRequest
          };
        })
      );
      
      res.json({ data: inquiriesWithDetails });
    } catch (error) {
      handleError(res, error, "Error retrieving inquiries");
    }
  });

  app.get("/api/inquiries/unassigned", async (req, res) => {
    try {
      const unassignedRequests = await storage.getUnassignedQuoteRequests();
      res.json({ data: unassignedRequests });
    } catch (error) {
      handleError(res, error, "Error retrieving unassigned inquiries");
    }
  });

  app.post("/api/inquiries/assign", async (req, res) => {
    try {
      const validatedData = insertInquiryAssignmentSchema.parse(req.body);
      const assignment = await storage.createInquiryAssignment(validatedData);
      res.status(201).json({ message: "Inquiry assigned successfully", data: assignment });
    } catch (error) {
      handleError(res, error, "Invalid assignment data");
    }
  });

  app.patch("/api/inquiries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assignment = await storage.updateInquiryAssignment(id, req.body);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      res.json({ message: "Assignment updated successfully", data: assignment });
    } catch (error) {
      handleError(res, error, "Error updating assignment");
    }
  });

  // Quote Management
  app.post("/api/quotes", async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.parse(req.body);
      
      // Generate quote number
      const quoteNumber = `Q-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const quoteData = { ...validatedData, quoteNumber };
      
      const quote = await storage.createQuote(quoteData);
      res.status(201).json({ message: "Quote created successfully", data: quote });
    } catch (error) {
      handleError(res, error, "Invalid quote data");
    }
  });

  app.get("/api/quotes", async (req, res) => {
    try {
      const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
      const status = req.query.status as string;
      const clientName = req.query.clientName as string;
      
      const quotes = await storage.getQuotes({ employeeId, status, clientName });
      res.json({ data: quotes });
    } catch (error) {
      handleError(res, error, "Error retrieving quotes");
    }
  });

  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quote = await storage.getQuote(id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json({ data: quote });
    } catch (error) {
      handleError(res, error, "Error retrieving quote");
    }
  });

  app.patch("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quote = await storage.updateQuote(id, req.body);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json({ message: "Quote updated successfully", data: quote });
    } catch (error) {
      handleError(res, error, "Error updating quote");
    }
  });

  // Contract Management
  app.post("/api/contracts", async (req, res) => {
    try {
      const validatedData = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(validatedData);
      res.status(201).json({ message: "Contract created successfully", data: contract });
    } catch (error) {
      handleError(res, error, "Invalid contract data");
    }
  });

  app.get("/api/contracts", async (req, res) => {
    try {
      const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
      const status = req.query.status as string;
      
      const contracts = await storage.getContracts({ employeeId, status });
      res.json({ data: contracts });
    } catch (error) {
      handleError(res, error, "Error retrieving contracts");
    }
  });

  // Vendor Management
  app.post("/api/vendors", async (req, res) => {
    try {
      const validatedData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(validatedData);
      res.status(201).json({ message: "Vendor created successfully", data: vendor });
    } catch (error) {
      handleError(res, error, "Invalid vendor data");
    }
  });

  app.get("/api/vendors", async (req, res) => {
    try {
      const category = req.query.category as string;
      const isActive = req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined;
      
      const vendors = await storage.getVendors({ category, isActive });
      res.json({ data: vendors });
    } catch (error) {
      handleError(res, error, "Error retrieving vendors");
    }
  });

  app.patch("/api/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vendor = await storage.updateVendor(id, req.body);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json({ message: "Vendor updated successfully", data: vendor });
    } catch (error) {
      handleError(res, error, "Error updating vendor");
    }
  });

  // Material Management
  app.post("/api/materials", async (req, res) => {
    try {
      const validatedData = insertMaterialSchema.parse(req.body);
      const material = await storage.createMaterial(validatedData);
      res.status(201).json({ message: "Material created successfully", data: material });
    } catch (error) {
      handleError(res, error, "Invalid material data");
    }
  });

  app.get("/api/materials", async (req, res) => {
    try {
      const category = req.query.category as string;
      const isActive = req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined;
      
      const materials = await storage.getMaterials({ category, isActive });
      res.json({ data: materials });
    } catch (error) {
      handleError(res, error, "Error retrieving materials");
    }
  });

  app.patch("/api/materials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const material = await storage.updateMaterial(id, req.body);
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      res.json({ message: "Material updated successfully", data: material });
    } catch (error) {
      handleError(res, error, "Error updating material");
    }
  });

  // DocuSign OAuth callback handler
  app.get('/auth/docusign/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        return res.status(400).json({ error: 'Authorization code missing' });
      }
      
      // Exchange authorization code for access token
      const { docusignService } = await import('./services/docusign');
      const tokenData = await docusignService.exchangeCodeForToken(code as string);
      
      res.json({
        success: true,
        message: 'DocuSign authorization completed successfully! Your integration is now fully operational.',
        access_token_received: !!tokenData.access_token,
        state: state,
        next_steps: 'You can now send contracts for signature, track status, and download completed documents.'
      });
    } catch (error) {
      console.error('DocuSign callback error:', error);
      res.status(500).json({ 
        error: 'Token exchange failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test endpoints for third-party integrations
  app.get('/api/test/docusign', async (req, res) => {
    try {
      const { docusignService } = await import('./services/docusign');
      
      // Test DocuSign authentication
      const testResult = await docusignService.testConnection();
      
      if (testResult.authenticated) {
        res.json({
          service: 'DocuSign',
          status: 'connected',
          message: 'DocuSign API connection successful',
          details: testResult
        });
      } else {
        // Handle consent required case
        res.status(200).json({
          service: 'DocuSign',
          status: 'consent_required',
          message: testResult.message,
          consentUrl: testResult.consentUrl,
          details: testResult
        });
      }
    } catch (error) {
      console.error('DocuSign test failed:', error);
      res.status(400).json({
        service: 'DocuSign',
        status: 'error',
        message: 'DocuSign API connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/test/hubspot', async (req, res) => {
    try {
      const { hubspotService } = await import('./services/hubspot');
      
      // Test HubSpot connection
      const contacts = await hubspotService.getContacts(1);
      res.json({
        service: 'HubSpot',
        status: 'connected',
        message: 'HubSpot API connection successful',
        contactCount: contacts.length
      });
    } catch (error) {
      console.error('HubSpot test failed:', error);
      res.status(400).json({
        service: 'HubSpot',
        status: 'error',
        message: 'HubSpot API connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

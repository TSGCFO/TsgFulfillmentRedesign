import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertQuoteRequestSchema, 
  insertInventoryLevelSchema,
  insertShipmentSchema,
  insertOrderStatisticsSchema,
  insertClientKpisSchema,
  insertDashboardSettingsSchema
} from "@shared/schema";

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

  if (analyticsEnabled) {
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

export async function registerRoutes(app: Express, analytics: boolean): Promise<Server> {
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy',
      message: 'TSG Fulfillment API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // SEO ROUTES
  // XML Sitemap
  app.get('/sitemap.xml', (req, res) => {
    try {
      const sitemap = generateSitemap();
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(sitemap);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Robots.txt
  app.get('/robots.txt', (req, res) => {
    try {
      const robotsTxt = generateRobotsTxt();
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(robotsTxt);
    } catch (error) {
      console.error('Error generating robots.txt:', error);
      res.status(500).send('Error generating robots.txt');
    }
  });

  // QUOTE REQUEST ENDPOINTS
  // Create a quote request
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
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid quote request ID' });
      }
      
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
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid quote request ID' });
      }
      
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
      let clientId: number | undefined;
      if (req.query.clientId) {
        clientId = parseInt(req.query.clientId as string);
        if (isNaN(clientId)) {
          return res.status(400).json({ message: 'Invalid client ID' });
        }
      }
      
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
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid inventory level ID' });
      }
      
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
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid inventory level ID' });
      }
      
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
      let clientId: number | undefined;
      if (req.query.clientId) {
        clientId = parseInt(req.query.clientId as string);
        if (isNaN(clientId)) {
          return res.status(400).json({ message: 'Invalid client ID' });
        }
      }
      
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
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid shipment ID' });
      }
      
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
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid shipment ID' });
      }
      
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
      let clientId: number | undefined;
      if (req.query.clientId) {
        clientId = parseInt(req.query.clientId as string);
        if (isNaN(clientId)) {
          return res.status(400).json({ message: 'Invalid client ID' });
        }
      }
      
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({ message: 'Invalid start date format' });
        }
      }
      
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({ message: 'Invalid end date format' });
        }
      }
      
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
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid order statistic ID' });
      }
      
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
      let clientId: number | undefined;
      if (req.query.clientId) {
        clientId = parseInt(req.query.clientId as string);
        if (isNaN(clientId)) {
          return res.status(400).json({ message: 'Invalid client ID' });
        }
      }
      
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({ message: 'Invalid start date format' });
        }
      }
      
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({ message: 'Invalid end date format' });
        }
      }
      
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
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid client KPI ID' });
      }
      
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
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
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
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
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
      if (isNaN(clientId)) {
        return res.status(400).json({ message: 'Invalid client ID' });
      }
      
      const analyticsSummary = await storage.getClientAnalyticsSummary(clientId);
      res.status(200).json({ data: analyticsSummary });
    } catch (error) {
      handleError(res, error, 'Error retrieving client analytics summary');
    }
    });
  
    // Get shipping performance analytics
    app.get('/api/analytics/shipping-performance', async (req, res) => {
    try {
      let clientId: number | undefined;
      if (req.query.clientId) {
        clientId = parseInt(req.query.clientId as string);
        if (isNaN(clientId)) {
          return res.status(400).json({ message: 'Invalid client ID' });
        }
      }
      
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({ message: 'Invalid start date format' });
        }
      }
      
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({ message: 'Invalid end date format' });
        }
      }
      
      const shippingPerformance = await storage.getShippingPerformance(clientId, startDate, endDate);
      res.status(200).json({ data: shippingPerformance });
    } catch (error) {
      handleError(res, error, 'Error retrieving shipping performance');
    }
    });
  
    // Get inventory report
    app.get('/api/analytics/inventory-report', async (req, res) => {
    try {
      let clientId: number | undefined;
      if (req.query.clientId) {
        clientId = parseInt(req.query.clientId as string);
        if (isNaN(clientId)) {
          return res.status(400).json({ message: 'Invalid client ID' });
        }
      }
      
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
      let clientId: number | undefined;
      if (req.query.clientId) {
        clientId = parseInt(req.query.clientId as string);
        if (isNaN(clientId)) {
          return res.status(400).json({ message: 'Invalid client ID' });
        }
      }
      
      const reportType = req.query.reportType as string;
      
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({ message: 'Invalid start date format' });
        }
      }
      
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({ message: 'Invalid end date format' });
        }
      }
      
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
      if (isNaN(clientIdNum)) {
        return res.status(400).json({ message: 'Invalid client ID' });
      }
      
      const periodAStartDate = new Date(periodAStart as string);
      const periodAEndDate = new Date(periodAEnd as string);
      const periodBStartDate = new Date(periodBStart as string);
      const periodBEndDate = new Date(periodBEnd as string);
      
      if (isNaN(periodAStartDate.getTime()) || isNaN(periodAEndDate.getTime()) || 
          isNaN(periodBStartDate.getTime()) || isNaN(periodBEndDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format in parameters' });
      }
      
      const comparisonData = await storage.getComparisonData(
        clientIdNum,
        periodAStartDate,
        periodAEndDate,
        periodBStartDate,
        periodBEndDate,
        metric as string
      );
      
      res.status(200).json({ data: comparisonData });
    } catch (error) {
      handleError(res, error, 'Error retrieving comparison data');
    }
    });
  } else {
    // Add 404 handlers for analytics routes when analytics is disabled
    app.all('/api/analytics/*', (req, res) => {
      res.status(404).json({ 
        message: 'Analytics features are disabled. Enable analytics to access these endpoints.' 
      });
    });
  }

  const httpServer = createServer(app);

  return httpServer;
}

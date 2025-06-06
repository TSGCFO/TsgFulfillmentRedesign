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

export async function registerRoutes(app: Express, analytics: boolean): Promise<Server> {
  // Health check endpoint for Render - only in production
  if (process.env.NODE_ENV === 'production') {
    app.get('/', (req, res) => {
      res.status(200).json({ 
        status: 'healthy',
        message: 'TSG Fulfillment API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });
  }

  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
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

  const httpServer = createServer(app);

  return httpServer;
}

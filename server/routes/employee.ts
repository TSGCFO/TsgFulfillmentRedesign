import type { Express } from "express";
import { verifyToken, requireRole, generateToken } from "../auth";
import { storage } from "../storage";
import bcrypt from 'bcryptjs';
import hubspotService from "../services/hubspot";
import docusignService from "../services/docusign";
import { 
  insertEmployeeSchema,
  insertQuoteSchema,
  insertContractSchema,
  insertVendorSchema,
  insertMaterialSchema,
  insertPurchaseOrderSchema
} from "@shared/schema";

const handleError = (res: any, error: any, message: string = 'An error occurred') => {
  console.error(`Error: ${message}`, error);
  res.status(400).json({
    message,
    error: error instanceof Error ? error.message : 'Unknown error'
  });
};

export function registerEmployeeRoutes(app: Express) {
  
  // AUTHENTICATION ENDPOINTS
  
  // Employee login
  app.post('/api/employee/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if user has employee record
      const employee = await storage.getEmployeeByUserId(user.id);
      if (!employee || !employee.isActive) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const token = generateToken(user);
      
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          department: employee.department,
          position: employee.position,
          permissions: employee.permissions
        }
      });
    } catch (error) {
      handleError(res, error, 'Login failed');
    }
  });

  // Get current employee profile
  app.get('/api/employee/profile', verifyToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const employee = await storage.getEmployeeByUserId(user.id);
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }

      res.json({ data: employee });
    } catch (error) {
      handleError(res, error, 'Error fetching profile');
    }
  });

  // QUOTE REQUEST MANAGEMENT
  
  // Get all quote requests with filtering and assignment
  app.get('/api/employee/quote-requests', verifyToken, async (req, res) => {
    try {
      const { status, assignedTo, page = 1, limit = 20 } = req.query;
      
      const quoteRequests = await storage.getQuoteRequests();

      res.json({ data: quoteRequests });
    } catch (error) {
      handleError(res, error, 'Error fetching quote requests');
    }
  });

  // Assign quote request to employee
  app.patch('/api/employee/quote-requests/:id/assign', 
    verifyToken, 
    requireRole(['admin', 'sales_manager']),
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const { assignedTo } = req.body;
        
        const updatedQuoteRequest = await storage.updateQuoteRequest(id, {
          assignedTo: assignedTo,
          status: 'assigned'
        });

        if (!updatedQuoteRequest) {
          return res.status(404).json({ message: 'Quote request not found' });
        }

        // Sync to HubSpot
        try {
          await hubspotService.syncQuoteRequestToDeal(id);
        } catch (syncError) {
          console.warn('HubSpot sync failed:', syncError);
        }

        res.json({ 
          message: 'Quote request assigned successfully',
          data: updatedQuoteRequest 
        });
      } catch (error) {
        handleError(res, error, 'Error assigning quote request');
      }
    }
  );

  // QUOTE MANAGEMENT
  
  // Create quote from quote request
  app.post('/api/employee/quotes', verifyToken, async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.parse(req.body);
      const user = (req as any).user;
      
      // Generate quote number
      const quoteNumber = `QUO-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const quote = await storage.createQuote({
        ...validatedData,
        quoteNumber,
        createdBy: user.id,
        status: 'draft'
      });

      res.status(201).json({
        message: 'Quote created successfully',
        data: quote
      });
    } catch (error) {
      handleError(res, error, 'Error creating quote');
    }
  });

  // Get all quotes with filtering
  app.get('/api/employee/quotes', verifyToken, async (req, res) => {
    try {
      const { assignedTo, status, page = 1, limit = 20 } = req.query;
      
      const quotes = await storage.getQuotes({
        assignedTo: assignedTo ? parseInt(assignedTo as string) : undefined,
        status: status as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({ data: quotes });
    } catch (error) {
      handleError(res, error, 'Error fetching quotes');
    }
  });

  // Update quote
  app.patch('/api/employee/quotes/:id', verifyToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedQuote = await storage.updateQuote(id, req.body);
      
      if (!updatedQuote) {
        return res.status(404).json({ message: 'Quote not found' });
      }

      res.json({
        message: 'Quote updated successfully',
        data: updatedQuote
      });
    } catch (error) {
      handleError(res, error, 'Error updating quote');
    }
  });

  // Send contract via DocuSign
  app.post('/api/employee/quotes/:id/send-contract', 
    verifyToken,
    requireRole(['admin', 'sales_manager', 'sales_rep']),
    async (req, res) => {
      try {
        const quoteId = parseInt(req.params.id);
        const { templateId, signerName, signerEmail, signerCompany } = req.body;
        
        const result = await docusignService.sendContractForSignature(quoteId, templateId, {
          name: signerName,
          email: signerEmail,
          company: signerCompany
        });

        res.json({
          message: 'Contract sent successfully',
          data: result
        });
      } catch (error) {
        handleError(res, error, 'Error sending contract');
      }
    }
  );

  // CONTRACT MANAGEMENT
  
  // Get all contracts
  app.get('/api/employee/contracts', verifyToken, async (req, res) => {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      
      const contracts = await storage.getContracts({
        status: status as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({ data: contracts });
    } catch (error) {
      handleError(res, error, 'Error fetching contracts');
    }
  });

  // MATERIAL AND VENDOR MANAGEMENT
  
  // Create vendor
  app.post('/api/employee/vendors', 
    verifyToken, 
    requireRole(['admin', 'inventory_manager']),
    async (req, res) => {
      try {
        const validatedData = insertVendorSchema.parse(req.body);
        const vendor = await storage.createVendor(validatedData);
        
        res.status(201).json({
          message: 'Vendor created successfully',
          data: vendor
        });
      } catch (error) {
        handleError(res, error, 'Error creating vendor');
      }
    }
  );

  // Get all vendors
  app.get('/api/employee/vendors', verifyToken, async (req, res) => {
    try {
      const { activeOnly = true } = req.query;
      const vendors = await storage.getVendors(activeOnly === 'true');
      
      res.json({ data: vendors });
    } catch (error) {
      handleError(res, error, 'Error fetching vendors');
    }
  });

  // Create material
  app.post('/api/employee/materials', 
    verifyToken, 
    requireRole(['admin', 'inventory_manager']),
    async (req, res) => {
      try {
        const validatedData = insertMaterialSchema.parse(req.body);
        const material = await storage.createMaterial(validatedData);
        
        res.status(201).json({
          message: 'Material created successfully',
          data: material
        });
      } catch (error) {
        handleError(res, error, 'Error creating material');
      }
    }
  );

  // Get materials with low stock alerts
  app.get('/api/employee/materials', verifyToken, async (req, res) => {
    try {
      const { category, lowStock, page = 1, limit = 50 } = req.query;
      
      const materials = await storage.getMaterials({
        category: category as string,
        lowStock: lowStock === 'true',
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({ data: materials });
    } catch (error) {
      handleError(res, error, 'Error fetching materials');
    }
  });

  // Create purchase order
  app.post('/api/employee/purchase-orders', 
    verifyToken, 
    requireRole(['admin', 'inventory_manager']),
    async (req, res) => {
      try {
        const validatedData = insertPurchaseOrderSchema.parse(req.body);
        const user = (req as any).user;
        
        // Generate PO number
        const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        
        const purchaseOrder = await storage.createPurchaseOrder({
          ...validatedData,
          poNumber,
          createdBy: user.id,
          status: 'pending'
        });

        res.status(201).json({
          message: 'Purchase order created successfully',
          data: purchaseOrder
        });
      } catch (error) {
        handleError(res, error, 'Error creating purchase order');
      }
    }
  );

  // Get employees for assignment dropdown
  app.get('/api/employee/employees', verifyToken, async (req, res) => {
    try {
      const { department } = req.query;
      
      const employees = department 
        ? await storage.getEmployeesByDepartment(department as string)
        : await storage.getEmployees();

      res.json({ data: employees });
    } catch (error) {
      handleError(res, error, 'Error fetching employees');
    }
  });

  // DASHBOARD AND ANALYTICS
  
  // Get employee dashboard data
  app.get('/api/employee/dashboard', verifyToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const employee = await storage.getEmployeeByUserId(user.id);
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Get dashboard metrics based on role
      const dashboardData = {
        employee: employee,
        metrics: {
          assignedQuotes: await storage.getQuoteCount({ assignedTo: employee.id }),
          activeContracts: await storage.getContractCount({ status: 'active' }),
          pendingQuoteRequests: await storage.getQuoteRequestCount({ 
            status: 'new', 
            assignedTo: null 
          }),
          lowStockItems: await storage.getMaterialCount({ lowStock: true })
        },
        recentActivity: await storage.getRecentActivity(employee.id, 10)
      };

      res.json({ data: dashboardData });
    } catch (error) {
      handleError(res, error, 'Error fetching dashboard data');
    }
  });

  // HUBSPOT WEBHOOK ENDPOINT
  app.post('/api/employee/webhooks/hubspot', async (req, res) => {
    try {
      const { subscriptionType, objectId, propertyName, propertyValue } = req.body;
      
      if (subscriptionType === 'deal.propertyChange') {
        await hubspotService.syncDealFromHubSpot(objectId);
      }

      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('HubSpot webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // DOCUSIGN WEBHOOK ENDPOINT
  app.post('/api/employee/webhooks/docusign', async (req, res) => {
    try {
      const { envelopeSummary } = req.body;
      
      if (envelopeSummary && envelopeSummary.status) {
        await docusignService.handleWebhook(
          envelopeSummary.envelopeId, 
          envelopeSummary.status
        );
      }

      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('DocuSign webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });
}
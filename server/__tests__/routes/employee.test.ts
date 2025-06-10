import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import { registerEmployeeRoutes } from '../routes/employee';
import { storage } from '../storage';
import hubspotService from '../services/hubspot';
import docusignService from '../services/docusign';
import { generateToken } from '../auth';

// Mock dependencies
vi.mock('../storage');
vi.mock('../services/hubspot');
vi.mock('../services/docusign');
vi.mock('../auth');
vi.mock('bcryptjs');

describe('Employee Routes API Tests', () => {
  let app: express.Application;
  let mockUser: any;
  let mockEmployee: any;
  let validToken: string;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    registerEmployeeRoutes(app);

    mockUser = {
      id: 1,
      username: 'testuser',
      password: 'hashedpassword',
      role: 'sales_rep'
    };

    mockEmployee = {
      id: 1,
      userId: 1,
      firstName: 'John',
      lastName: 'Doe',
      department: 'Sales',
      position: 'Sales Representative',
      isActive: true,
      permissions: {}
    };

    validToken = 'valid.jwt.token';

    vi.clearAllMocks();
  });

  describe('POST /api/employee/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      vi.mocked(storage.getUserByUsername).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(storage.getEmployeeByUserId).mockResolvedValue(mockEmployee);
      vi.mocked(generateToken).mockReturnValue(validToken);

      const response = await request(app)
        .post('/api/employee/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        token: validToken,
        user: {
          id: 1,
          username: 'testuser',
          role: 'sales_rep'
        },
        employee: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          department: 'Sales',
          position: 'Sales Representative'
        }
      });
    });

    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/employee/auth/login')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username and password required');
    });

    it('should reject login with invalid credentials', async () => {
      vi.mocked(storage.getUserByUsername).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const response = await request(app)
        .post('/api/employee/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login for non-existent user', async () => {
      vi.mocked(storage.getUserByUsername).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/employee/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login for inactive employee', async () => {
      const inactiveEmployee = { ...mockEmployee, isActive: false };
      
      vi.mocked(storage.getUserByUsername).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(storage.getEmployeeByUserId).mockResolvedValue(inactiveEmployee);

      const response = await request(app)
        .post('/api/employee/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    it('should reject login for user without employee record', async () => {
      vi.mocked(storage.getUserByUsername).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(storage.getEmployeeByUserId).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/employee/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });
  });

  describe('GET /api/employee/profile', () => {
    beforeEach(() => {
      // Mock token verification middleware
      vi.doMock('../auth', () => ({
        verifyToken: (req: any, res: any, next: any) => {
          req.user = mockUser;
          next();
        },
        requireRole: () => (req: any, res: any, next: any) => next(),
        generateToken: vi.fn()
      }));
    });

    it('should return employee profile for authenticated user', async () => {
      vi.mocked(storage.getEmployeeByUserId).mockResolvedValue(mockEmployee);

      const response = await request(app)
        .get('/api/employee/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject(mockEmployee);
    });

    it('should return 404 when employee profile not found', async () => {
      vi.mocked(storage.getEmployeeByUserId).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/employee/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Employee profile not found');
    });
  });

  describe('GET /api/employee/quote-requests', () => {
    it('should return quote requests for authenticated user', async () => {
      const mockQuoteRequests = [
        {
          id: 1,
          name: 'John Smith',
          email: 'john@example.com',
          company: 'Test Corp',
          status: 'new'
        }
      ];

      vi.mocked(storage.getQuoteRequests).mockResolvedValue(mockQuoteRequests);

      const response = await request(app)
        .get('/api/employee/quote-requests')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockQuoteRequests);
    });

    it('should handle query parameters for filtering', async () => {
      vi.mocked(storage.getQuoteRequests).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/employee/quote-requests?status=new&assignedTo=1&page=2&limit=10')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(storage.getQuoteRequests).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/employee/quote-requests/:id/assign', () => {
    it('should assign quote request successfully', async () => {
      const updatedQuoteRequest = {
        id: 1,
        assignedTo: 2,
        status: 'assigned'
      };

      vi.mocked(storage.updateQuoteRequest).mockResolvedValue(updatedQuoteRequest);
      vi.mocked(hubspotService.syncQuoteRequestToDeal).mockResolvedValue({} as any);

      const response = await request(app)
        .patch('/api/employee/quote-requests/1/assign')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ assignedTo: 2 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Quote request assigned successfully');
      expect(response.body.data).toEqual(updatedQuoteRequest);
      expect(storage.updateQuoteRequest).toHaveBeenCalledWith(1, {
        assignedTo: 2,
        status: 'assigned'
      });
      expect(hubspotService.syncQuoteRequestToDeal).toHaveBeenCalledWith(1);
    });

    it('should return 404 when quote request not found', async () => {
      vi.mocked(storage.updateQuoteRequest).mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/employee/quote-requests/999/assign')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ assignedTo: 2 });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Quote request not found');
    });

    it('should handle HubSpot sync failures gracefully', async () => {
      const updatedQuoteRequest = { id: 1, assignedTo: 2, status: 'assigned' };
      
      vi.mocked(storage.updateQuoteRequest).mockResolvedValue(updatedQuoteRequest);
      vi.mocked(hubspotService.syncQuoteRequestToDeal).mockRejectedValue(
        new Error('HubSpot sync failed')
      );

      const response = await request(app)
        .patch('/api/employee/quote-requests/1/assign')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ assignedTo: 2 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Quote request assigned successfully');
    });
  });

  describe('POST /api/employee/quotes', () => {
    it('should create quote successfully', async () => {
      const quoteData = {
        quoteRequestId: 1,
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientCompany: 'Test Corp',
        servicesQuoted: { fulfillment: true },
        pricingData: { basePrice: 1000 }
      };

      const createdQuote = {
        id: 1,
        ...quoteData,
        quoteNumber: 'QUO-12345',
        status: 'draft'
      };

      vi.mocked(storage.createQuote).mockResolvedValue(createdQuote);

      const response = await request(app)
        .post('/api/employee/quotes')
        .set('Authorization', `Bearer ${validToken}`)
        .send(quoteData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Quote created successfully');
      expect(response.body.data).toEqual(createdQuote);
      expect(storage.createQuote).toHaveBeenCalledWith({
        ...quoteData,
        quoteNumber: expect.stringMatching(/^QUO-\d+-[A-Z0-9]{5}$/),
        createdBy: mockUser.id,
        status: 'draft'
      });
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/employee/quotes')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ invalidData: true });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Error creating quote');
    });
  });

  describe('GET /api/employee/quotes', () => {
    it('should return quotes with filtering', async () => {
      const mockQuotes = [
        { id: 1, quoteNumber: 'QUO-1', status: 'draft' },
        { id: 2, quoteNumber: 'QUO-2', status: 'sent' }
      ];

      vi.mocked(storage.getQuotes).mockResolvedValue(mockQuotes);

      const response = await request(app)
        .get('/api/employee/quotes?status=draft&assignedTo=1')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockQuotes);
      expect(storage.getQuotes).toHaveBeenCalledWith({
        assignedTo: 1,
        status: 'draft',
        page: 1,
        limit: 20
      });
    });
  });

  describe('PATCH /api/employee/quotes/:id', () => {
    it('should update quote successfully', async () => {
      const updatedQuote = { id: 1, status: 'sent', totalAmount: 2500 };
      
      vi.mocked(storage.updateQuote).mockResolvedValue(updatedQuote);

      const response = await request(app)
        .patch('/api/employee/quotes/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'sent', totalAmount: 2500 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Quote updated successfully');
      expect(response.body.data).toEqual(updatedQuote);
    });

    it('should return 404 when quote not found', async () => {
      vi.mocked(storage.updateQuote).mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/employee/quotes/999')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ status: 'sent' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Quote not found');
    });
  });

  describe('POST /api/employee/quotes/:id/send-contract', () => {
    it('should send contract successfully', async () => {
      const contractData = {
        templateId: 'template-123',
        signerName: 'John Doe',
        signerEmail: 'john@example.com',
        signerCompany: 'Test Corp'
      };

      const mockResult = {
        contract: { id: 1, contractNumber: 'CON-123' },
        envelopeId: 'envelope-456'
      };

      vi.mocked(docusignService.sendContractForSignature).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/employee/quotes/1/send-contract')
        .set('Authorization', `Bearer ${validToken}`)
        .send(contractData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Contract sent successfully');
      expect(response.body.data).toEqual(mockResult);
      expect(docusignService.sendContractForSignature).toHaveBeenCalledWith(
        1,
        'template-123',
        {
          name: 'John Doe',
          email: 'john@example.com',
          company: 'Test Corp'
        }
      );
    });

    it('should handle DocuSign service errors', async () => {
      vi.mocked(docusignService.sendContractForSignature).mockRejectedValue(
        new Error('DocuSign API error')
      );

      const response = await request(app)
        .post('/api/employee/quotes/1/send-contract')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          templateId: 'template-123',
          signerName: 'John Doe',
          signerEmail: 'john@example.com',
          signerCompany: 'Test Corp'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Error sending contract');
    });
  });

  describe('GET /api/employee/contracts', () => {
    it('should return contracts with filtering', async () => {
      const mockContracts = [
        { id: 1, contractNumber: 'CON-1', status: 'sent' },
        { id: 2, contractNumber: 'CON-2', status: 'signed' }
      ];

      vi.mocked(storage.getContracts).mockResolvedValue(mockContracts);

      const response = await request(app)
        .get('/api/employee/contracts?status=sent')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockContracts);
      expect(storage.getContracts).toHaveBeenCalledWith({
        status: 'sent',
        page: 1,
        limit: 20
      });
    });
  });

  describe('POST /api/employee/vendors', () => {
    it('should create vendor successfully', async () => {
      const vendorData = {
        vendorName: 'Test Vendor',
        vendorCode: 'VEN001',
        contactPerson: 'Jane Smith',
        email: 'jane@vendor.com'
      };

      const createdVendor = { id: 1, ...vendorData };
      
      vi.mocked(storage.createVendor).mockResolvedValue(createdVendor);

      const response = await request(app)
        .post('/api/employee/vendors')
        .set('Authorization', `Bearer ${validToken}`)
        .send(vendorData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Vendor created successfully');
      expect(response.body.data).toEqual(createdVendor);
    });
  });

  describe('GET /api/employee/vendors', () => {
    it('should return vendors', async () => {
      const mockVendors = [
        { id: 1, vendorName: 'Vendor 1', isActive: true },
        { id: 2, vendorName: 'Vendor 2', isActive: true }
      ];

      vi.mocked(storage.getVendors).mockResolvedValue(mockVendors);

      const response = await request(app)
        .get('/api/employee/vendors')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockVendors);
      expect(storage.getVendors).toHaveBeenCalledWith(true);
    });

    it('should handle activeOnly parameter', async () => {
      vi.mocked(storage.getVendors).mockResolvedValue([]);

      await request(app)
        .get('/api/employee/vendors?activeOnly=false')
        .set('Authorization', `Bearer ${validToken}`);

      expect(storage.getVendors).toHaveBeenCalledWith(false);
    });
  });

  describe('GET /api/employee/dashboard', () => {
    it('should return dashboard data', async () => {
      const mockDashboardData = {
        employee: mockEmployee,
        metrics: {
          assignedQuotes: 5,
          activeContracts: 3,
          pendingQuoteRequests: 10,
          lowStockItems: 2
        },
        recentActivity: []
      };

      vi.mocked(storage.getEmployeeByUserId).mockResolvedValue(mockEmployee);
      vi.mocked(storage.getQuoteCount).mockResolvedValue(5);
      vi.mocked(storage.getContractCount).mockResolvedValue(3);
      vi.mocked(storage.getQuoteRequestCount).mockResolvedValue(10);
      vi.mocked(storage.getMaterialCount).mockResolvedValue(2);
      vi.mocked(storage.getRecentActivity).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/employee/dashboard')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject(mockDashboardData);
    });

    it('should return 404 when employee not found', async () => {
      vi.mocked(storage.getEmployeeByUserId).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/employee/dashboard')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Employee not found');
    });
  });

  describe('Webhook endpoints', () => {
    describe('POST /api/employee/webhooks/hubspot', () => {
      it('should process HubSpot webhook successfully', async () => {
        vi.mocked(hubspotService.syncDealFromHubSpot).mockResolvedValue({} as any);

        const response = await request(app)
          .post('/api/employee/webhooks/hubspot')
          .send({
            subscriptionType: 'deal.propertyChange',
            objectId: 'deal-123',
            propertyName: 'dealstage',
            propertyValue: 'closedwon'
          });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Webhook processed successfully');
        expect(hubspotService.syncDealFromHubSpot).toHaveBeenCalledWith('deal-123');
      });

      it('should handle HubSpot webhook errors', async () => {
        vi.mocked(hubspotService.syncDealFromHubSpot).mockRejectedValue(
          new Error('Sync failed')
        );

        const response = await request(app)
          .post('/api/employee/webhooks/hubspot')
          .send({
            subscriptionType: 'deal.propertyChange',
            objectId: 'deal-123'
          });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Webhook processing failed');
      });
    });

    describe('POST /api/employee/webhooks/docusign', () => {
      it('should process DocuSign webhook successfully', async () => {
        vi.mocked(docusignService.handleWebhook).mockResolvedValue(undefined);

        const response = await request(app)
          .post('/api/employee/webhooks/docusign')
          .send({
            envelopeSummary: {
              envelopeId: 'envelope-123',
              status: 'completed'
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Webhook processed successfully');
        expect(docusignService.handleWebhook).toHaveBeenCalledWith(
          'envelope-123',
          'completed'
        );
      });

      it('should handle DocuSign webhook errors', async () => {
        vi.mocked(docusignService.handleWebhook).mockRejectedValue(
          new Error('Webhook processing failed')
        );

        const response = await request(app)
          .post('/api/employee/webhooks/docusign')
          .send({
            envelopeSummary: {
              envelopeId: 'envelope-123',
              status: 'completed'
            }
          });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Webhook processing failed');
      });

      it('should handle missing envelope summary', async () => {
        const response = await request(app)
          .post('/api/employee/webhooks/docusign')
          .send({});

        expect(response.status).toBe(200);
        expect(docusignService.handleWebhook).not.toHaveBeenCalled();
      });
    });
  });

  describe('Error handling', () => {
    it('should handle database connection errors', async () => {
      vi.mocked(storage.getQuoteRequests).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/employee/quote-requests')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Error fetching quote requests');
      expect(response.body.error).toBe('Database connection failed');
    });

    it('should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/api/employee/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });
  });
});